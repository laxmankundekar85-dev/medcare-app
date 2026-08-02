const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  patientId: { type: String, default: '#MC-98442' },
  bloodGroup: { type: String, default: 'O+' },
  age: { type: String, default: '20' },
  weight: { type: String, default: '64' },
  avatar: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);