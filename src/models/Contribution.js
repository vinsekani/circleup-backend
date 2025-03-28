const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  group: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Upcoming', 'Paid', 'Failed'], 
    default: 'Upcoming' 
  },
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contribution', contributionSchema);