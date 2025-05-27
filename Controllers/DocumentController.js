import DocumentModel from '../models/document.js';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

export const uploadDocument = async (req, res) => {
  try {
    const document = new DocumentModel({
      filename: req.file.originalname,
      path: req.file.path,
      author: req.userId,
    });

    await document.save();
    res.json({ success: true, document });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка загрузки' });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    // Проверка подключения к базе
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Нет подключения к MongoDB");
    }

    // Запрос документов с информацией об авторе
    const documents = await DocumentModel.find().populate("author", "fullName email");
    
    if (!documents || documents.length === 0) {
      return res.status(404).json({ message: "Документы не найдены" });
    }

    res.json(documents);
  } catch (err) {
    console.error("Ошибка в getAllDocuments:", err.message); // Подробное логирование
    res.status(500).json({ 
      message: "Ошибка получения документов",
      error: err.message // Отправка деталей клиенту
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

    fs.unlinkSync(document.path);
    await DocumentModel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка удаления' });
  }
};