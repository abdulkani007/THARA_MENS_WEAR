# Troubleshooting Guide

## Common Issues and Solutions

### 1. Firebase Permission Errors

**Error:** `Missing or insufficient permissions`

**Solutions:**
- Deploy Firestore rules: `firebase deploy --only firestore:rules`
- Check if user is logged in
- Verify admin role for admin operations
- Clear browser cache and re-login

### 2. Image Upload Fails

**Error:** Images not uploading or displaying

**Solutions:**
- Check if MongoDB backend is running: `cd server && npm start`
- Verify MongoDB connection in `server/.env`
- Check backend URL in `src/services/imageService.js`
- Look for errors in browser console and server logs

### 3. Cannot Add to Cart

**Error:** `Missing or insufficient permissions` when adding to cart

**Solutions:**
- Make sure you're logged in
- Deploy latest Firestore rules
- Check cart collection rules allow user creation
- Clear cart and try again

### 4. Login/Register Not Working

**Error:** Authentication fails

**Solutions:**
- Check Firebase config in `src/firebase.js`
- Verify Email/Password auth is enabled in Firebase Console
- Check if Google sign-in is configured (if using Google login)
- Clear browser cookies and try again

### 5. Admin Panel Not Accessible

**Error:** Redirected to user dashboard

**Solutions:**
- Verify you're using admin email: `thara@gmail.com`
- Check user role in Firestore `users` collection
- Manually update role to `admin` in Firestore
- Re-login after role change

### 6. MongoDB Connection Failed

**Error:** `MongoServerError: connect ECONNREFUSED`

**Solutions:**
- Start MongoDB: `brew services start mongodb-community` (Mac) or check Windows services
- Verify connection string in `server/.env`
- Try: `mongodb://127.0.0.1:27017/thara` instead of `localhost`
- Check if port 27017 is available

### 7. Port Already in Use

**Error:** `Port 3000/5000 is already in use`

**Solutions:**

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

Or change port in `package.json` or `server/.env`

### 8. Build Errors

**Error:** Build fails with module errors

**Solutions:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear cache
npm cache clean --force
```

### 9. Products Not Displaying

**Error:** Empty product list

**Solutions:**
- Check if products exist in Firestore
- Verify Firestore rules allow public read for products
- Check browser console for errors
- Test Firestore connection

### 10. Order Status Not Updating

**Error:** Admin cannot update order status

**Solutions:**
- Deploy latest Firestore rules with orderHistory collection
- Check if admin is logged in
- Verify orders collection rules allow admin updates
- Check browser console for specific error

## Debug Mode

Enable detailed logging:

1. **Firebase Debug:**
```javascript
// In src/firebase.js
import { enableIndexedDbPersistence } from 'firebase/firestore';
enableIndexedDbPersistence(db).catch((err) => {
  console.error('Persistence error:', err);
});
```

2. **Backend Debug:**
```javascript
// In server/index.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

## Check Firestore Rules

Test rules in Firebase Console:
1. Go to Firestore → Rules
2. Click "Rules Playground"
3. Test read/write operations

## Clear All Data (Reset)

**Warning:** This deletes all data!

```bash
# Clear Firestore (in Firebase Console)
# Go to Firestore → Delete all documents

# Clear MongoDB
mongo
use thara
db.dropDatabase()
```

## Get Help

1. Check browser console (F12)
2. Check server logs
3. Check Firebase Console logs
4. Review Firestore rules
5. Verify all environment variables

## Useful Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check Firebase CLI
firebase --version

# Check MongoDB status
mongo --version

# View running processes
# Windows: tasklist
# Mac/Linux: ps aux | grep node
```

---

Still having issues? Check the error message carefully and search for it in the Firebase/MongoDB documentation.
