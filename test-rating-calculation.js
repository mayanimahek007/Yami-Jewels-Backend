const mongoose = require('mongoose');
const Review = require('./src/models/reviewModel');
const Product = require('./src/models/productModel');

// Connect to database
require('./src/config/database');

const testRatingCalculation = async () => {
  try {
    console.log('Testing rating calculation...');
    
    // Find a product to test with
    const product = await Product.findOne({});
    if (!product) {
      console.log('No products found. Please create some products first.');
      return;
    }
    
    console.log(`Testing with product: ${product.name} (ID: ${product._id})`);
    console.log(`Current ratings: ${product.ratingsAverage} (${product.ratingsQuantity} reviews)`);
    
    // Test the calculation
    await Review.calcAverageRatings(product._id);
    
    // Refresh product data
    const updatedProduct = await Product.findById(product._id);
    console.log(`Updated ratings: ${updatedProduct.ratingsAverage} (${updatedProduct.ratingsQuantity} reviews)`);
    
    console.log('Rating calculation test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error testing rating calculation:', error);
    process.exit(1);
  }
};

// Run the test
testRatingCalculation();
