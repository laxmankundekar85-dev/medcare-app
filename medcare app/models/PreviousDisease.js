import mongoose from 'mongoose';

const previousDiseaseSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  diseaseName: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    default: 'Chronic Condition' 
  },
  diagnosedDate: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    default: 'Ongoing' // Ongoing, Cured, Managed, In Remission
  },
  treatingDoctor: { 
    type: String 
  },
  notes: { 
    type: String 
  }
}, { timestamps: true });

export default mongoose.model('PreviousDisease', previousDiseaseSchema);