// models/document.js
import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

export default mongoose.model('Document', DocumentSchema);