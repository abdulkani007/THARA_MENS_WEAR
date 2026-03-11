# THARA - Firebase vs MongoDB Usage Guide

## 🔥 Firebase Usage

### 1. **Firebase Authentication**
**Purpose**: User authentication and authorization

**Files**:
- `src/firebase.js` - Firebase configuration
- `src/context/AuthContext.js` - Authentication state management

**Features**:
- Email/Password authentication
- Google OAuth authentication
- User session management
- Role-based access control (admin/user)

**Admin Credentials**:
- Email: thara@gmail.com
- Password: abbu007

---

### 2. **Firestore Database** (Primary Database)
**Purpose**: Store all application data except images

#### Collections in Firestore:

##### **users**
- User profiles
- User roles (admin/user)
- User metadata
- **Used in**: AuthContext, AdminUsers, Profile pages

##### **products**
- Regular products (Shirts, T-Shirts, Jeans, Jackets)
- Product details (name, description, price, stock, category)
- Product metadata (sizes, colors)
- **Image URLs stored here** (references to MongoDB images)
- **Used in**: ManageProducts, UserHome, Collections, ProductDetail

##### **kidsProducts**
- Kids collection products
- Separate from main products
- Age groups, kids sizes
- **Used in**: KidsCollection (admin), UserKids (user)

##### **categories**
- Product categories
- Category metadata
- **Used in**: Category management, filters

##### **banners**
- Homepage banners
- Landing page banners
- Banner images (displayLocation: 'home' or 'landing')
- Active/inactive status
- **Used in**: HomeBannerSlider, Banners (admin)

##### **cart**
- User shopping cart items
- Product references
- Quantities, sizes, colors
- **Used in**: CartContext, Cart page

##### **favorites**
- User wishlist/favorites
- Product references
- **Used in**: CartContext, Favorites page

##### **orders**
- Active/pending orders
- Order details, status
- Shipping information
- **Used in**: Orders page, AdminOrders

##### **orderHistory**
- Completed/delivered orders
- Order archive
- **Used in**: Orders page (combined with active orders)

##### **ratings**
- Product ratings and reviews
- User feedback
- Star ratings
- **Used in**: ProductDetail, ratings management

##### **coupons**
- Discount coupons
- Coupon codes
- Discount percentages
- **Used in**: Checkout, coupon management

##### **settings**
- Application settings
- Configuration data
- **Used in**: Admin settings

##### **returns**
- Product return requests
- Return status tracking
- **Used in**: Returns management

---

## 🍃 MongoDB Usage

### **MongoDB Atlas** (Image Storage Only)
**Purpose**: Store product images as Base64 strings

**Backend**: 
- `server/index.js` - Express server
- Deployed on: https://thara-mens-wear.onrender.com

**Database**: MongoDB Atlas (cloud)

**Collection**: `images`

#### MongoDB Schema:
```javascript
{
  _id: ObjectId,
  imageData: String (Base64),
  contentType: String,
  uploadedAt: Date
}
```

#### API Endpoints:

##### **POST /api/upload-image**
- Upload product image
- Converts to Base64
- Stores in MongoDB
- Returns image URL

**Used in**:
- `src/services/imageService.js` - uploadImageToMongoDB()
- `src/components/ImageInput.js` - Image upload component
- Admin pages: ManageProducts, KidsCollection, AccessoriesManagement, Banners

##### **GET /api/images/:id**
- Retrieve single image by ID
- Returns Base64 image data
- Converts to displayable format

**Used in**:
- Product display pages
- Banner display
- All user-facing pages showing images

##### **GET /api/images**
- List all images
- Admin functionality
- Image management

**Used in**:
- Admin image management
- Debugging

##### **DELETE /api/images/:id**
- Delete image from MongoDB
- Called when product is deleted

**Used in**:
- `src/services/imageService.js` - deleteImageFromMongoDB()
- Product deletion in admin pages

---

## 📊 Data Flow Architecture

### Product Creation Flow:
```
1. Admin uploads image → MongoDB (via /api/upload-image)
2. MongoDB returns image URL
3. Product data + image URL → Firestore (products collection)
4. User views product → Firestore (product data) + MongoDB (image via URL)
```

### Image Storage Pattern:
```javascript
// In Firestore products collection:
{
  name: "Product Name",
  price: 1999,
  images: [
    "https://thara-mens-wear.onrender.com/api/images/abc123",
    "https://thara-mens-wear.onrender.com/api/images/def456"
  ],
  imageURL: "https://thara-mens-wear.onrender.com/api/images/abc123"
}
```

---

## 🔧 Configuration Files

### Firebase Config:
- `src/firebase.js` - Firebase initialization
- `firestore.rules` - Security rules
- `.firebaserc` - Firebase project config

### MongoDB Config:
- `server/.env` - MongoDB connection string
- `server/index.js` - Express server setup

### Environment Variables:

#### Frontend (Vercel):
```
REACT_APP_API_URL=https://thara-mens-wear.onrender.com
```

#### Backend (Render):
```
MONGO_URI=mongodb+srv://...
BASE_URL=https://thara-mens-wear.onrender.com
PORT=5000
```

---

## 📁 Key Files Using Firebase

### Authentication:
- `src/context/AuthContext.js`
- `src/pages/Login.js`
- `src/pages/Register.js`

### Firestore Operations:
- `src/pages/admin/ManageProducts.js`
- `src/pages/admin/KidsCollection.js`
- `src/pages/admin/AccessoriesManagement.js`
- `src/pages/admin/Banners.js`
- `src/pages/admin/AdminOrders.js`
- `src/pages/admin/AdminUsers.js`
- `src/pages/user/UserHome.js`
- `src/pages/user/Cart.js`
- `src/pages/user/Favorites.js`
- `src/pages/user/Orders.js`
- `src/context/CartContext.js`

---

## 📁 Key Files Using MongoDB

### Image Service:
- `src/services/imageService.js`
  - uploadImageToMongoDB()
  - deleteImageFromMongoDB()
  - deleteProductImages()
  - getAllImages()

### Image Upload Component:
- `src/components/ImageInput.js`

### Backend:
- `server/index.js` - Express API
- `server/models/Image.js` - Mongoose schema

---

## 🎯 Why This Architecture?

### Firebase Advantages:
✅ Real-time data synchronization
✅ Built-in authentication
✅ Security rules
✅ Automatic scaling
✅ Easy queries and filters
✅ No server management

### MongoDB Advantages:
✅ Better for large binary data (images)
✅ Cost-effective for image storage
✅ Flexible schema
✅ Direct Base64 storage
✅ Custom backend control

### Hybrid Approach Benefits:
✅ Firebase for structured data (fast queries)
✅ MongoDB for unstructured data (images)
✅ Best of both worlds
✅ Optimized costs
✅ Better performance

---

## 🚀 Deployment

### Frontend (Vercel):
- React app
- Firebase SDK
- Calls MongoDB API for images

### Backend (Render):
- Express server
- MongoDB connection
- Image API endpoints

### Databases:
- **Firebase**: Hosted by Google
- **MongoDB Atlas**: Cloud-hosted

---

## 📝 Summary

| Feature | Database | Purpose |
|---------|----------|---------|
| Authentication | Firebase Auth | User login/signup |
| User Profiles | Firestore | User data |
| Products | Firestore | Product metadata |
| Cart | Firestore | Shopping cart |
| Favorites | Firestore | Wishlist |
| Orders | Firestore | Order management |
| Banners | Firestore | Banner metadata |
| Coupons | Firestore | Discount codes |
| **Images** | **MongoDB** | **Product images (Base64)** |

**Key Point**: Firebase stores everything EXCEPT images. MongoDB stores ONLY images.
