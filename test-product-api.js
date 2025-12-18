const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let token = '';
let productId = '';

// Test user login to get token
async function login() {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email: 'admin@example.com', // Replace with your admin email
      password: 'password123' // Replace with your admin password
    });
    
    token = response.data.token;
    console.log('Login successful, token obtained');
    return token;
  } catch (error) {
    console.error('Login failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

// Test create product
async function createProduct() {
  try {
    const response = await axios.post(
      `${API_URL}/products/admin`,
      {
        name: 'Test Diamond Ring',
        sku: 'TEST-RING-001',
        categoryName: 'rings',
        size: 'medium',
        stock: 10,
        regularPrice: 999.99,
        salePrice: 899.99,
        metalVariations: [
          {
            type: 'gold',
            color: 'yellow',
            karat: '18k'
          }
        ],
        images: [
          {
            url: 'https://example.com/images/ring1.jpg',
            alt: 'Diamond Ring Front View'
          }
        ],
        videoUrl: 'https://example.com/videos/ring.mp4',
        description: 'Beautiful diamond ring with 18k gold band.'
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    productId = response.data.data.product._id;
    console.log('Product created successfully:', response.data.data.product);
    return productId;
  } catch (error) {
    console.error('Create product failed:', error.response ? error.response.data : error.message);
  }
}

// Test get all products
async function getAllProducts() {
  try {
    const response = await axios.get(`${API_URL}/products`);
    console.log('All products:', response.data);
  } catch (error) {
    console.error('Get all products failed:', error.response ? error.response.data : error.message);
  }
}

// Test get product by ID
async function getProductById() {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}`);
    console.log('Product by ID:', response.data);
  } catch (error) {
    console.error('Get product by ID failed:', error.response ? error.response.data : error.message);
  }
}

// Test update product
async function updateProduct() {
  try {
    const response = await axios.patch(
      `${API_URL}/products/admin/${productId}`,
      {
        stock: 15,
        salePrice: 849.99
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Product updated successfully:', response.data);
  } catch (error) {
    console.error('Update product failed:', error.response ? error.response.data : error.message);
  }
}

// Test add to wishlist
async function addToWishlist() {
  try {
    const response = await axios.post(
      `${API_URL}/products/wishlist`,
      {
        productId
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Product added to wishlist:', response.data);
  } catch (error) {
    console.error('Add to wishlist failed:', error.response ? error.response.data : error.message);
  }
}

// Test get wishlist
async function getWishlist() {
  try {
    const response = await axios.get(
      `${API_URL}/products/wishlist/me`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Wishlist:', response.data);
  } catch (error) {
    console.error('Get wishlist failed:', error.response ? error.response.data : error.message);
  }
}

// Test remove from wishlist
async function removeFromWishlist() {
  try {
    const response = await axios.delete(
      `${API_URL}/products/wishlist/${productId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Product removed from wishlist:', response.status === 204 ? 'Success' : response.data);
  } catch (error) {
    console.error('Remove from wishlist failed:', error.response ? error.response.data : error.message);
  }
}

// Test delete product
async function deleteProduct() {
  try {
    const response = await axios.delete(
      `${API_URL}/products/admin/${productId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('Product deleted successfully:', response.status === 204 ? 'Success' : response.data);
  } catch (error) {
    console.error('Delete product failed:', error.response ? error.response.data : error.message);
  }
}

// Run all tests
async function runTests() {
  await login();
  await createProduct();
  await getAllProducts();
  await getProductById();
  await updateProduct();
  await addToWishlist();
  await getWishlist();
  await removeFromWishlist();
  await deleteProduct();
  console.log('All tests completed');
}

runTests();