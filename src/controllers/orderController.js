const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Coupon = require('../models/couponModel');
const sendEmail = require('../utils/emailService');
const sendWhatsAppMessage = require('../utils/whatsappService');
const { AppError } = require('../utils/errorHandler');

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders'
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    res.status(200).json({
      status: 'success',
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch order'
    });
  }
};

// Create order from cart
const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod = 'Cash on Delivery',
      orderNotes,
      couponCode
    } = req.body;

    // Validate required fields
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.email ||
        !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city ||
        !shippingAddress.state || !shippingAddress.pincode) {
      return res.status(400).json({
        status: 'error',
        message: 'All shipping address fields are required'
      });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cart is empty'
      });
    }

    // Check stock availability for all items
    for (const item of cart.items) {
      const product = item.product;
      if (product.stock < item.quantity) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient stock for ${product.name}`
        });
      }
    }

    // Create order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      selectedMetalVariation: item.selectedMetalVariation,
      customizations: item.customizations,
      price: item.price,
      total: item.price * item.quantity
    }));

    // Calculate total amount
    const totalBeforeDiscount = orderItems.reduce((total, item) => total + item.total, 0);
    let totalAmount = totalBeforeDiscount;
    let discountAmount = 0;
    let appliedCouponCode;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: String(couponCode).toUpperCase(), isActive: true });

      if (!coupon) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid coupon code'
        });
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return res.status(400).json({
          status: 'error',
          message: 'Coupon has expired'
        });
      }

      if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return res.status(400).json({
          status: 'error',
          message: 'Coupon usage limit reached'
        });
      }

      if (totalBeforeDiscount < coupon.minOrderAmount) {
        return res.status(400).json({
          status: 'error',
          message: `Minimum order amount is ${coupon.minOrderAmount}`
        });
      }

      discountAmount = coupon.discountType === 'percentage'
        ? (totalBeforeDiscount * coupon.discountValue) / 100
        : coupon.discountValue;

      if (coupon.maxDiscountAmount > 0) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
      }

      totalAmount = Math.max(totalBeforeDiscount - discountAmount, 0);
      appliedCouponCode = coupon.code;
      coupon.usedCount += 1;
      await coupon.save();
    }

    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      totalBeforeDiscount,
      couponCode: appliedCouponCode,
      discountAmount,
      shippingAddress,
      paymentMethod,
      orderNotes
    });

    await order.save();
    await order.populate('items.product');

    // Reduce product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send notifications
    try {
      await sendOrderNotifications(order);
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
      // Don't fail the order if notifications fail
    }

    res.status(201).json({
      status: 'success',
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create order'
    });
  }
};

// Send order notifications (WhatsApp and Email)
const sendOrderNotifications = async (order) => {
  try {
    // Get user details
    const user = await User.findById(order.user);

    // Prepare order details for WhatsApp
    const orderDetails = order.items.map(item =>
      `${item.product.name} : ${item.product.name} sku : ${item.product.sku} (${item.quantity}x) - ₹${item.total}`
    ).join('\n');

    const whatsappMessage = `🛍️ *New Order Received!*

📋 *Order Details:*
Order #: ${order.orderNumber}
Customer: ${order.shippingAddress.name}
Phone: ${order.shippingAddress.phone}
Email: ${order.shippingAddress.email}

📦 *Items:*
${orderDetails}

💰 *Total:* ₹${order.totalAmount}

📍 *Shipping Address:*
${order.shippingAddress.address}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}

💳 *Payment:* ${order.paymentMethod}

${order.orderNotes ? `📝 *Notes:* ${order.orderNotes}` : ''}

Please contact the customer to confirm the order.`;

    // Send WhatsApp message to admin
    await sendWhatsAppMessage('+85295614051', whatsappMessage);

    // Send email notification
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">🛍️ New Order Received!</h2>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Customer:</strong> ${order.shippingAddress.name}</p>
          <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
          <p><strong>Email:</strong> ${order.shippingAddress.email}</p>
          <p><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
        </div>

        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
          <h3>Items Ordered</h3>
          ${order.items.map(item => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
              ${item.product.images && item.product.images[0] ? `<img src="https://dev.yaamijewels.com${item.product.images[0].url}" alt="${item.product.name}" style="max-width: 250px; max-height: 250px; margin-bottom: 10px;">` : ''}
              <p style="margin: 5px 0;"><strong>Product Name: ${item.product.name}</strong></p>
              <p style="margin: 5px 0;">SKU: ${item.product.sku}</p>
              <p style="margin: 5px 0;">Category: ${item.product.categoryName || 'N/A'}</p>
              <p style="margin: 5px 0;">Type: ${item.product.categoryName || 'N/A'}</p>
              <p style="margin: 5px 0;">Quantity: ${item.quantity}</p>
              ${item.selectedMetalVariation ? `<p style="margin: 5px 0;">Metal: ${item.selectedMetalVariation.type} ${item.selectedMetalVariation.karat || ''} ${item.selectedMetalVariation.color || ''}</p>` : ''}
              ${item.customizations && item.customizations.ringSize ? `<p style="margin: 5px 0;">Ring Size: ${item.customizations.ringSize}</p>` : ''}
              ${item.customizations && item.customizations.notes ? `<p style="margin: 5px 0;">Notes: ${item.customizations.notes}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Price: ₹${item.price} x ${item.quantity} = ₹${item.total}</strong></p>
            </div>
          `).join('')}
          <div style="text-align: right; margin-top: 20px; font-size: 18px;">
            <strong>Total: ₹${order.totalAmount}</strong>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Address</h3>
          <p style="margin: 5px 0;">${order.shippingAddress.name}</p>
          <p style="margin: 5px 0;">${order.shippingAddress.address}</p>
          <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}</p>
          <p style="margin: 5px 0;">${order.shippingAddress.country}</p>
        </div>

        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          ${order.orderNotes ? `<p><strong>Order Notes:</strong> ${order.orderNotes}</p>` : ''}
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <p>Please contact the customer at ${order.shippingAddress.phone} or ${order.shippingAddress.email} to confirm the order details.</p>
        </div>
      </div>
    `;

    // Send email to admin
    await sendEmail({
      to: 'yaamisjewels@gmail.com',
      subject: `New Order Received - ${order.orderNumber}`,
      html: emailHtml
    });

    // Send confirmation email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">🎉 Order Confirmed!</h2>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Thank you for your order!</h3>
          <p>Dear ${order.shippingAddress.name},</p>
          <p>Your order has been successfully placed. Here are the details:</p>
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${order.createdAt.toLocaleDateString()}</p>
        </div>

        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
          <h3>Order Summary</h3>
          ${order.items.map(item => `
            <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
              ${item.product.images && item.product.images[0] ? `<img src="https://dev.yaamijewels.com${item.product.images[0].url}" alt="${item.product.name}" style="max-width: 250px; max-height: 250px; margin-bottom: 10px;">` : ''}
              <p style="margin: 5px 0;"><strong>${item.product.name}</strong></p>
              <p style="margin: 5px 0;">SKU: ${item.product.sku}</p>
              <p style="margin: 5px 0;">Category: ${item.product.categoryName || 'N/A'}</p>
              <p style="margin: 5px 0;">Type: ${item.product.categoryName || 'N/A'}</p>
              <p style="margin: 5px 0;">Quantity: ${item.quantity}</p>
              ${item.selectedMetalVariation ? `<p style="margin: 5px 0;">Metal: ${item.selectedMetalVariation.type} ${item.selectedMetalVariation.karat || ''} ${item.selectedMetalVariation.color || ''}</p>` : ''}
              ${item.customizations && item.customizations.ringSize ? `<p style="margin: 5px 0;">Ring Size: ${item.customizations.ringSize}</p>` : ''}
              ${item.customizations && item.customizations.notes ? `<p style="margin: 5px 0;">Notes: ${item.customizations.notes}</p>` : ''}
              <p style="margin: 5px 0;"><strong>Price: ₹${item.price} x ${item.quantity} = ₹${item.total}</strong></p>
            </div>
          `).join('')}
          <div style="text-align: right; margin-top: 20px; font-size: 18px;">
            <strong>Total: ₹${order.totalAmount}</strong>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Address</h3>
          <p style="margin: 5px 0;">${order.shippingAddress.address}</p>
          <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}</p>
          <p style="margin: 5px 0;">${order.shippingAddress.country}</p>
        </div>

        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Status:</strong> Order Confirmed</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <p>We will contact you soon at ${order.shippingAddress.phone} to confirm delivery details.</p>
          <p>For any questions, please contact us at yaamisjewels@gmail.com</p>
        </div>
      </div>
    `;

    await sendEmail({
      email: order.shippingAddress.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: customerEmailHtml
    });

    // Update order status
    order.whatsappSent = true;
    order.emailSent = true;
    await order.save();

  } catch (error) {
    console.error('Error sending order notifications:', error);
    throw error;
  }
};

// Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    order.status = status;
    await order.save();
    await order.populate('items.product');

    res.status(200).json({
      status: 'success',
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update order status'
    });
  }
};

// Get all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: orders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders'
    });
  }
};

module.exports = {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getAllOrders
};
