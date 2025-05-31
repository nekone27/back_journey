
import DocumentModel from '../models/document.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

export const uploadDocument = async (req, res) => {
  try {
    // Проверяем, что это .docx файл
    if (!req.file || !req.file.originalname.endsWith('.docx')) {
      return res.status(400).json({ 
        message: 'Необходимо загрузить файл в формате .docx' 
      });
    }
    
    // Декодируем имя файла из latin1 в UTF-8
    const decodedFilename = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
    
    const document = new DocumentModel({
      filename: decodedFilename, // Используем декодированное имя
      path: req.file.path,
      author: req.userId,
    });

    await document.save();
    res.json({ 
      success: true, 
      document,
      message: 'Документ статьи загружен. Используйте его ID при создании статьи.' 
    });
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    res.status(500).json({ message: 'Ошибка загрузки' });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Нет подключения к MongoDB");
    }

    // Получаем только документы текущего пользователя
    const documents = await DocumentModel
      .find({ author: req.userId })
      .populate("author", "fullName email");
    
    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: "Документы не найдены" });
    }

    res.json(documents);
  } catch (err) {
    console.error("Ошибка в getAllDocuments:", err.message);
    res.status(500).json({ 
      message: "Ошибка получения документов",
      error: err.message 
    });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const document = await DocumentModel.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Документ не найден' });

    const filePath = path.resolve(document.path);
    res.download(filePath, document.filename);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка скачивания' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await DocumentModel.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Документ не найден' });

    if (document.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Нет прав для удаления' });
    }

    // Проверяем, не привязан ли документ к статье
    if (document.postId) {
      return res.status(400).json({ 
        message: 'Невозможно удалить документ, привязанный к статье' 
      });
    }

    fs.unlinkSync(document.path);
    await DocumentModel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления' });
  }
};