# Chart.js Installation Instructions

## Required Dependencies

Install the following packages to enable analytics dashboard:

```bash
npm install chart.js react-chartjs-2
```

## Package Versions
- chart.js: ^4.4.0
- react-chartjs-2: ^5.2.0

## After Installation

1. The Analytics component is ready at: `src/pages/admin/Analytics.js`
2. Add the route to your router configuration
3. The dashboard will automatically load and display charts

## Features Included
- Daily Orders Chart (Line Chart)
- Daily Revenue Chart (Bar Chart)
- Stock Levels Chart (Bar Chart with color coding)
- Revenue Breakdown (Doughnut Chart)
- Live stats cards with gradients
- Automatic data refresh

## Note
All data is fetched from Firebase Firestore in real-time. No backend API changes needed.
