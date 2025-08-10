# Yami Jewels API - Postman cURL Examples

This document provides cURL examples for all API endpoints that can be imported into Postman.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Many endpoints require authentication. To authenticate, include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## User API Endpoints

### 1. Register User

```bash
curl --location 'http://localhost:5000/api/users/register' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Test User",
    "email": "user@example.com",
    "password": "password123",
    "phone": "1234567890",
    "address": "123 Test Street, Test City"
}'
```

### 2. Login User

```bash
curl --location 'http://localhost:5000/api/users/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "user@example.com",
    "password": "password123"
}'
```

### 3. Forgot Password

```bash
curl --location 'http://localhost:5000/api/users/forgotPassword' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "user@example.com"
}'
```

### 4. Reset Password

```bash
curl --location --request PATCH 'http://localhost:5000/api/users/resetPassword/YOUR_RESET_TOKEN' \
--header 'Content-Type: application/json' \
--data-raw '{
    "password": "newpassword123",
    "passwordConfirm": "newpassword123"
}'
```

### 5. Get User Profile

```bash
curl --location 'http://localhost:5000/api/users/profile' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 6. Update User Profile

```bash
curl --location --request PATCH 'http://localhost:5000/api/users/updateProfile' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN' \
--data-raw '{
    "name": "Updated Name",
    "phone": "9876543210",
    "address": "456 New Street, New City"
}'
```

### 7. Update Password

```bash
curl --location --request PATCH 'http://localhost:5000/api/users/updatePassword' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN' \
--data-raw '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
}'
```

### 8. Get All Users (Admin Only)

```bash
curl --location 'http://localhost:5000/api/users/admin/users' \
--header 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN'
```

### 9. Register Admin (Admin Only)

```bash
curl --location 'http://localhost:5000/api/users/admin/register' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN' \
--data-raw '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "adminpassword123",
    "passwordConfirm": "adminpassword123",
    "phone": "1234567890",
    "address": "123 Admin Street, Admin City"
}'
```

## Product API Endpoints

### 1. Get All Products

```bash
curl --location 'http://localhost:5000/api/products' \
--header 'Content-Type: application/json'
```

With query parameters:

```bash
curl --location 'http://localhost:5000/api/products?categoryName=necklace&sort=-createdAt&page=1&limit=10' \
--header 'Content-Type: application/json'
```

### 2. Get Products by Category

```bash
curl --location 'http://localhost:5000/api/products/category/necklace' \
--header 'Content-Type: application/json'
```

### 3. Get Products on Sale

```bash
curl --location 'http://localhost:5000/api/products/on-sale' \
--header 'Content-Type: application/json'
```

### 4. Get Best Seller Products

```bash
curl --location 'http://localhost:5000/api/products/best-seller' \
--header 'Content-Type: application/json'
```

### 5. Get Top Rated Products

```bash
curl --location 'http://localhost:5000/api/products/top-rated' \
--header 'Content-Type: application/json'
```

### 6. Get Single Product

```bash
curl --location 'http://localhost:5000/api/products/60d21b4667d0d8992e610c85' \
--header 'Content-Type: application/json'
```

### 7. Create Product (Admin Only)

```bash
curl --location 'http://localhost:5000/api/products/admin' \
--header 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN' \
--form 'name="Diamond Necklace"' \
--form 'sku="DIAMOND-NECKLACE-001"' \
--form 'categoryName="necklace"' \
--form 'size="medium"' \
--form 'stock="10"' \
--form 'regularPrice="1999.99"' \
--form 'salePrice="1799.99"' \
--form 'metalVariations[0][type]="gold"' \
--form 'metalVariations[0][color]="yellow"' \
--form 'metalVariations[0][karat]="18k"' \
--form 'metalVariations[0][regularPrice]="2199.99"' \
--form 'metalVariations[0][salePrice]="1999.99"' \
--form 'metalVariations[1][type]="platinum"' \
--form 'metalVariations[1][color]="white"' \
--form 'metalVariations[1][regularPrice]="2499.99"' \
--form 'metalVariations[1][salePrice]="2299.99"' \
--form 'images[0][alt]="Diamond Necklace Front View"' \
--form 'images[1][alt]="Diamond Necklace Side View"' \
--form 'images=@"/path/to/image1.jpg"' \
--form 'images=@"/path/to/image2.jpg"' \
--form 'videoUrl=@"/path/to/video.mp4"' \
--form 'description="Beautiful diamond necklace with 18k gold chain."'
```

### 8. Update Product (Admin Only)

```bash
curl --location --request PATCH 'http://localhost:5000/api/products/admin/60d21b4667d0d8992e610c85' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN' \
--data-raw '{
    "stock": 15,
    "salePrice": 1699.99
}'
```

### 9. Delete Product (Admin Only)

```bash
curl --location --request DELETE 'http://localhost:5000/api/products/admin/60d21b4667d0d8992e610c85' \
--header 'Authorization: Bearer YOUR_ADMIN_JWT_TOKEN'
```

## Wishlist API Endpoints

### 1. Add Product to Wishlist

```bash
curl --location 'http://localhost:5000/api/products/wishlist' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN' \
--data-raw '{
    "productId": "60d21b4667d0d8992e610c85"
}'
```

### 2. Get User's Wishlist

```bash
curl --location 'http://localhost:5000/api/products/wishlist/me' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN'
```

### 3. Remove Product from Wishlist

```bash
curl --location --request DELETE 'http://localhost:5000/api/products/wishlist/60d21b4667d0d8992e610c85' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN'
```

## Importing to Postman

1. Open Postman
2. Click on "Import" button
3. Select "Raw text" tab
4. Copy the cURL command
5. Paste it into the text area
6. Click "Continue" and then "Import"

This will create a new request in Postman with all the headers, parameters, and body already set up.

## Environment Variables

For easier testing, create a Postman environment with the following variables:

- `base_url`: http://localhost:5000/api
- `token`: Your JWT token after login
- `admin_token`: Your admin JWT token after admin login

Then replace the hardcoded values in the requests with:

- `{{base_url}}` instead of http://localhost:5000/api
- `{{token}}` instead of YOUR_JWT_TOKEN
- `{{admin_token}}` instead of YOUR_ADMIN_JWT_TOKEN