import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const articleSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  review: { type: String, required: true }, // Путь к .doc/.docx
  content: { type: String, required: true },
  abstract: [{ lang: String, file: String }],
  prniVak: String,
  readyForIssue: { type: Boolean, default: false }
});
export default mongoose.model('Article', articleSchema);