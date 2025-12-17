const axios = require('axios');

const API_URL = 'https://dev.yaamijewels.com/api';

// Test get products on sale
async function getOnSaleProducts() {
  try {
    const response = await axios.get(`${API_URL}/products/on-sale`);
    console.log('Products on sale:', response.data);
  } catch (error) {
    console.error('Get on sale products failed:', error.response ? error.response.data : error.message);
  }
}

// Test get best seller products
async function getBestSellerProducts() {
  try {
    const response = await axios.get(`${API_URL}/products/best-seller`);
    console.log('Best seller products:', response.data);
  } catch (error) {
    console.error('Get best seller products failed:', error.response ? error.response.data : error.message);
  }
}

// Test get top rated products
async function getTopRatedProducts() {
  try {
    const response = await axios.get(`${API_URL}/products/top-rated`);
    console.log('Top rated products:', response.data);
  } catch (error) {
    console.error('Get top rated products failed:', error.response ? error.response.data : error.message);
  }
}

// Test get products by category
async function getProductsByCategory() {
  try {
    const response = await axios.get(`${API_URL}/products/category/rings`);
    console.log('Products by category (rings):', response.data);
  } catch (error) {
    console.error('Get products by category failed:', error.response ? error.response.data : error.message);
  }
}

// Run all filter tests
async function runFilterTests() {
  console.log('=== Testing Product Filter Endpoints ===\n');
  
  console.log('1. Testing ON SALE products...');
  await getOnSaleProducts();
  
  console.log('\n2. Testing BEST SELLER products...');
  await getBestSellerProducts();
  
  console.log('\n3. Testing TOP RATED products...');
  await getTopRatedProducts();
  
  console.log('\n4. Testing products by category...');
  await getProductsByCategory();
  
  console.log('\n=== All filter tests completed ===');
}

runFilterTests(); 