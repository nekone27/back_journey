import express from 'express';
import Article from '../models/Article.js';
import { upload } from '../utils/upload.js';
const router = express.Router();

router.post('/upload', upload.fields([
  { name: 'review', maxCount: 1 },
  { name: 'content', maxCount: 1 },
  { name: 'abstractRu', maxCount: 1 },
  { name: 'abstractEn', maxCount: 1 }
]), async (req, res) => {
  const { prniVak } = req.body;
  const article = new Article({
    review: req.files.review[0].path,
    content: req.files.content[0].path,
    abstract: [
      { lang: 'ru', file: req.files.abstractRu[0].path },
      { lang: 'en', file: req.files.abstractEn[0].path }
    ],
    prniVak
  });
  await article.save();
  res.status(201).json(article);
});

export default router;