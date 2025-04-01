const issueSchema = new mongoose.Schema({
  id: { type: String, default: uuidv4, unique: true },
  articles: [{ type: String }], // UUID статей
  published: { type: Boolean, default: false },
  issueNumber: { type: String } // Формат: "ВС/NW 2025 №1 (1):1.1"
});