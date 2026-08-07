import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  fullName: { 
    type: String, 
    default: 'Laxman' 
  },
  patientId: { 
    type: String, 
    default: '#MC8829' 
  },
  email: { 
    type: String 
  },
  phone: { 
    type: String, 
    default: '+91 98765 43210' 
  },
  bloodGroup: { 
    type: String, 
    default: 'O+' 
  },
  allergies: { 
    type: [String], 
    default: ['Penicillin'] 
  },
  emergencyContact: {
    name: { type: String, default: 'Emergency Contact' },
    relation: { type: String, default: 'Family' },
    phone: { type: String, default: '+91 91234 56789' }
  },
  weight: { 
    type: Number, 
    default: 64 
  },
  height: { 
    type: Number, 
    default: 175 
  }
}, { timestamps: true });

export default mongoose.model('UserProfile', userProfileSchema);