# Product API Documentation

This document provides information about the Product API endpoints and how to use them with cURL examples.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Many endpoints require authentication. To authenticate, include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Product Endpoints

### 1. Get All Products

**Endpoint:** `GET /products`

**Description:** Retrieves all products with optional filtering, sorting, and pagination.

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/products" \
  -H "Content-Type: application/json"
```

**Query Parameters:**
- `categoryName`: Filter by category name
- `sort`: Sort by field(s), comma-separated (e.g., `sort=price,-createdAt`)
- `page`: Page number for pagination
- `limit`: Number of results per page

### 2. Get Products by Category

**Endpoint:** `GET /products/category/:categoryName`

**Description:** Retrieves all products in a specific category.

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/products/category/necklace" \
  -H "Content-Type: application/json"
```

### 3. Get Products on Sale

**Endpoint:** `GET /products/on-sale`

**Description:** Retrieves all products that are currently on sale (have a salePrice).

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/products/on-sale" \
  -H "Content-Type: application/json"
```

### 4. Get Best Seller Products

**Endpoint:** `GET /products/best-seller`

**Description:** Retrieves best seller products (sorted by stock quantity and creation date).

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/products/best-seller" \
  -H "Content-Type: application/json"
```

### 5. Get Top Rated Products

**Endpoint:** `GET /products/top-rated`

**Description:** Retrieves top rated products (sorted by creation date, newest first).

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/products/top-rated" \
  -H "Content-Type: application/json"
```

### 6. Get Single Product

**Endpoint:** `GET /products/:id`

**Description:** Retrieves a single product by its ID.

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/products/60d21b4667d0d8992e610c85" \
  -H "Content-Type: application/json"
```

### 7. Create Product (Admin Only)

**Endpoint:** `POST /products/admin`

**Description:** Creates a new product (requires admin authentication).

**cURL Example:**
```bash
curl -X POST "http://localhost:5000/api/products/admin" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "name=Diamond Necklace" \
  -F "sku=DIAMOND-NECKLACE-001" \
  -F "categoryName=necklace" \
  -F "size=medium" \
  -F "stock=10" \
  -F "regularPrice=1999.99" \
  -F "salePrice=1799.99" \
  -F "metalVariations[0][type]=gold" \
  -F "metalVariations[0][color]=yellow" \
  -F "metalVariations[0][karat]=18k" \
  -F "metalVariations[0][regularPrice]=2199.99" \
  -F "metalVariations[0][salePrice]=1999.99" \
  -F "metalVariations[1][type]=platinum" \
  -F "metalVariations[1][color]=white" \
  -F "metalVariations[1][regularPrice]=2499.99" \
  -F "metalVariations[1][salePrice]=2299.99" \\
  -F "images[0][alt]=Diamond Necklace Front View" \
  -F "images[1][alt]=Diamond Necklace Side View" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "videoUrl=@/path/to/video.mp4" \
  -F "description=Beautiful diamond necklace with 18k gold chain."
```

### 8. Update Product (Admin Only)

**Endpoint:** `PATCH /products/admin/:id`

**Description:** Updates an existing product (requires admin authentication).

**cURL Example:**
```bash
curl -X PATCH "http://localhost:5000/api/products/admin/60d21b4667d0d8992e610c85" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "stock": 15,
    "salePrice": 1699.99
  }'
```

### 9. Delete Product (Admin Only)

**Endpoint:** `DELETE /products/admin/:id`

**Description:** Deletes a product (requires admin authentication).

**cURL Example:**
```bash
curl -X DELETE "http://localhost:5000/api/products/admin/60d21b4667d0d8992e610c85" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Wishlist Endpoints

### 1. Add Product to Wishlist

**Endpoint:** `POST /products/wishlist`

**Description:** Adds a product to the user's wishlist (requires authentication).

**cURL Example:**
```bash
curl -X POST "http://localhost:5000/api/products/wishlist" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "60d21b4667d0d8992e610c85"
  }'
```

### 2. Get User's Wishlist

**Endpoint:** `GET /products/wishlist/me`

**Description:** Retrieves the user's wishlist (requires authentication).

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/products/wishlist/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Remove Product from Wishlist

**Endpoint:** `DELETE /products/wishlist/:productId`

**Description:** Removes a product from the user's wishlist (requires authentication).

**cURL Example:**
```bash
curl -X DELETE "http://localhost:5000/api/products/wishlist/60d21b4667d0d8992e610c85" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Responses

All endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `204 No Content`: Request succeeded, no content returned
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "status": "fail",
  "message": "Error message details"
}
```