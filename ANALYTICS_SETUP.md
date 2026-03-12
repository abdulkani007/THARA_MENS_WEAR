# Analytics Dashboard Setup Guide

## New Features Added

### 1. Animated Charts with ApexCharts
- **Orders Analytics Chart**: Line chart showing daily orders for the last 7 days
- **Revenue Analytics Chart**: Area chart with gradient showing daily revenue
- **Login Activity Chart**: Bar chart showing user logins for the last 7 days

### 2. New Dashboard Cards
- **Users Today**: Shows total users logged in today with percentage change
- **Orders Today**: Existing card with enhanced styling
- **Revenue Today**: Existing card with enhanced styling

### 3. Chart Animations
All charts include:
- Smooth animations on load
- Interactive hover effects
- Tooltip information with date and value
- Animated transitions when data updates
- Gradient effects and smooth curves

## Setup Instructions

### 1. Install Dependencies (Already Done)
The required packages are already in package.json:
- apexcharts
- react-apexcharts
- axios

### 2. Start MongoDB Server
```bash
# Make sure MongoDB is running
mongod
```

### 3. Start Backend Server
```bash
cd server
npm start
```

### 4. Start React App
```bash
npm start
```

## API Endpoints Added

### Track Login
**POST** `/api/admin/track-login`
- Automatically called when user logs in
- Increments daily login count

### Get Today's Login Stats
**GET** `/api/admin/login-stats`
- Returns: `{ todayLogins: 25, yesterdayLogins: 18 }`

### Get Weekly Login Stats
**GET** `/api/admin/login-stats/weekly`
- Returns last 7 days of login data
- Format: `{ data: [{ date: 'Mon', count: 10 }, ...] }`

## Chart Configuration

All charts use the following animation settings:
```javascript
animations: {
  enabled: true,
  easing: 'easeinout',
  speed: 800,
  animateGradually: {
    enabled: true,
    delay: 150
  },
  dynamicAnimation: {
    enabled: true,
    speed: 350
  }
}
```

## Features

### Interactive Elements
- **Hover Effects**: Cards lift up on hover with enhanced shadows
- **Chart Tooltips**: Display detailed information on hover
- **Smooth Transitions**: All animations are smooth and professional
- **Responsive Design**: Charts adapt to different screen sizes

### Dark Theme
All components match THARA's dark theme:
- Background: `#111111`
- Border: `#1F2833`
- Primary: `#ff2e2e`
- Secondary: `#66FCF1`
- Text: `#C5C6C7`

## Testing

1. **Login Tracking**: Log in with different users to see login count increase
2. **Orders Chart**: Create orders to see the chart update
3. **Revenue Chart**: Orders will automatically update revenue data
4. **Animations**: Refresh the page to see smooth chart animations

## Notes

- Login tracking starts from the first login after server restart
- Historical data is stored in MongoDB `loginstats` collection
- Charts automatically refresh when component loads
- All animations are GPU-accelerated for smooth performance
