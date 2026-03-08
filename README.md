# THARA Men's Wear - eCommerce Platform

A premium dark-themed eCommerce web application for men's fashion built with React and Firebase.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or MongoDB Compass)
- Firebase account

### Installation

1. **Install dependencies**
```bash
npm install
cd server && npm install
```

2. **Configure Firebase**
   - Create a Firebase project
   - Enable Authentication (Email/Password & Google)
   - Create Firestore Database
   - Update `src/firebase.js` with your config

3. **Setup MongoDB**
   - Install MongoDB locally or use MongoDB Compass
   - Update `server/.env` with connection string
   - Default: `mongodb://localhost:27017/thara`

4. **Start the application**
```bash
# Terminal 1 - Start MongoDB backend
cd server
npm start

# Terminal 2 - Start React app
npm start
```

5. **Deploy Firestore Rules**
```bash
firebase deploy --only firestore:rules
```

## 🔑 Admin Access

**Email:** thara@gmail.com  
**Password:** abbu007

## 📁 Project Structure

```
THARA/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin panel pages
│   │   └── user/       # User pages
│   ├── context/        # React Context (Auth, Cart)
│   ├── services/       # API services
│   └── firebase.js     # Firebase configuration
├── server/             # MongoDB backend for images
│   ├── models/         # MongoDB schemas
│   └── index.js        # Express server
└── firestore.rules     # Firebase security rules
```

## ✨ Features

### Admin Features
- Product Management (Add, Edit, Delete)
- Category Management
- Banner Management (Landing/Home page)
- Order Management
- User Management
- Coupon System
- Inventory Tracking
- Kids Collection
- Accessories Management
- Product Reviews Management

### User Features
- Product Browsing & Search
- Shopping Cart
- Favorites/Wishlist
- Product Ratings
- Order Tracking
- User Profile
- Checkout System
- Responsive Design

## 🎨 Theme

- Background: `#0B0C10` / `#000000`
- Cards: `#111111`
- Border: `#1F2833`
- Primary Accent: `#FF2E2E` (Red)
- Secondary Accent: `#66FCF1` (Cyan)
- Text: `#FFFFFF` / `#C5C6C7`

## 🔥 Firebase Collections

- **users** - User profiles and roles
- **products** - Product catalog
- **categories** - Product categories
- **cart** - Shopping cart items
- **favorites** - User wishlists
- **orders** - Active orders
- **orderHistory** - Completed orders
- **ratings** - Product ratings
- **banners** - Homepage banners
- **coupons** - Discount coupons

## 📦 Technologies

- React 18.2.0
- Firebase 10.7.1
- MongoDB (local)
- Express.js
- React Router DOM 6.20.0
- React Hot Toast 2.4.1

## 🔒 Security

- Firebase Authentication
- Firestore Security Rules
- Role-based access control
- Protected routes
- Secure image storage

---

Built with ❤️ for THARA Men's Wear
