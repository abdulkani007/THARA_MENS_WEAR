const mongoose = require('mongoose');

const loginStatsSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  count: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('LoginStats', loginStatsSchema);
