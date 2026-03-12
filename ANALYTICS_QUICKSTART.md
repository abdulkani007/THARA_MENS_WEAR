# Analytics Dashboard - Quick Start Guide

## 🚀 Installation (3 Steps)

### Step 1: Install Chart.js
```bash
npm install chart.js react-chartjs-2
```

### Step 2: Verify Files
All files are already created:
- ✅ `src/pages/admin/Analytics.js`
- ✅ `src/App.js` (updated)
- ✅ `src/pages/admin/AdminDashboard.js` (updated)

### Step 3: Start Application
```bash
npm start
```

## 📊 Access Dashboard

1. Login as admin: `thara@gmail.com` / `abbu007`
2. Navigate to: `/admin/analytics`
3. Or click "Analytics" in admin sidebar

## ✨ Features Available

### Live Stats Cards (5)
- 📦 Orders Today
- 💰 Revenue Today
- 📊 Total Products
- 👥 Total Customers
- ⚠️ Low Stock Alert

### Charts (4)
1. **Daily Orders** - Line chart (last 7 days)
2. **Daily Revenue** - Bar chart (last 7 days)
3. **Stock Levels** - Color-coded bar chart (top 10)
4. **Revenue Breakdown** - Doughnut chart (profit analysis)

## 🎨 Design
- Dark theme matching THARA
- Gradient stat cards
- Responsive grid layout
- Mobile-friendly

## 📦 Data Source
- Firebase Firestore (no backend API needed)
- Real-time data
- Auto-calculated metrics

## 🔧 Troubleshooting

### If charts don't appear:
1. Check console for errors
2. Verify Chart.js installed: `npm list chart.js`
3. Clear cache: `npm start` with Ctrl+C first

### If data is empty:
1. Ensure orders exist in Firestore
2. Check products collection has data
3. Verify user role is 'admin'

## 📝 Notes

- No backend changes required
- All data from Firestore
- Profit calculation: 30% margin (simplified)
- Stock alert threshold: < 10 units

## 🎯 Next Steps

After installation works:
1. Test with real order data
2. Customize colors if needed
3. Add real-time updates (optional)
4. Export functionality (optional)

---

**Ready to use after `npm install`!** 🚀
