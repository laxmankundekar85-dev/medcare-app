import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    default: 'Lab Report' 
  },
  date: { 
    type: String, 
    required: true 
  },
  doctor: { 
    type: String 
  },
  summary: { 
    type: String 
  },
  fileUrl: { 
    type: String 
  }
}, { timestamps: true });

export default mongoose.model('Record', recordSchema);