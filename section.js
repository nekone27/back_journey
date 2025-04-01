const sectionSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  name: { type: String, required: true },
  manager: { type: String, required: true }, // Имя редактора
  articles: [{ type: String }] // UUID статей
});