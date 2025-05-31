import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    authors: { 
      type: String,
      required: true,
    },
    position: {  
      type: String,
      required: true,
    },
    organization: {  
      type: String,
      required: true,
    },
    email: {  
      type: String,
      required: true,
    },
    abstract: {  
      type: String,
      required: true,
    },
    keywords: {  
      type: [String],
      default: [],
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    literature: {  
      type: [String],
      required: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
  },
  {
    timestamps: true,
  },
);
PostSchema.index({ title: 'text', authors: 'text', abstract: 'text', keywords: 'text' });

export default mongoose.model('Post', PostSchema);