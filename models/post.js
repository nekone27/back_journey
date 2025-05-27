import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    authors: {  // Добавлено поле "Авторы"
      type: String,
      required: true,
    },
    position: {  // Добавлено поле "Должность"
      type: String,
      required: true,
    },
    organization: {  // Добавлено поле "Организация"
      type: String,
      required: true,
    },
    email: {  // Добавлено поле "Email"
      type: String,
      required: true,
    },
    abstract: {  // Добавлено поле "Аннотация"
      type: String,
      required: true,
    },
    keywords: {  // Изменено на массив ключевых слов
      type: [String],
      default: [],
    },
    content: {  // Переименовано из "text"
      type: String,
      required: true,
    },
    literature: {  // Добавлено поле "Литература"
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

export default mongoose.model('Post', PostSchema);