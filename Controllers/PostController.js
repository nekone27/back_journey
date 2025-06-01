import PostModel from '../models/post.js';
import mongoose from 'mongoose';
import DocumentModel from '../models/document.js';

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts
      .map((obj) => obj.tags)
      .flat()
      .slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить тэги',
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate('user').exec();
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

   
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Неверный ID статьи" });
    }

    // Используем async/await без колбэка
    const post = await PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } },
      { new: true } 
    ).populate('user');

    if (!post) {
      return res.status(404).json({ message: "Статья не найдена" });
    }

    res.json(post);
  } catch (err) {
    console.error("Ошибка в getOne:", err);
    res.status(500).json({ 
      message: "Не удалось получить статью",
      error: err.message 
    });
  }
};


export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Неверный формат ID" });
    }

    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Статья не найдена" });
    }

    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Нет прав для удаления" });
    }

    // Освобождаем документ
    await DocumentModel.findByIdAndUpdate(
      post.documentId,
      { postId: null }
    );

    // Удаляем статью
    await PostModel.findByIdAndDelete(postId);
    res.json({ success: true });

  } catch (err) {
    console.error("Ошибка удаления:", err);
    res.status(500).json({ 
      message: "Не удалось удалить статью",
      error: err.message 
    });
  }
};

export const create = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Проверяем наличие файла
    if (!req.file) {
      return res.status(400).json({
        message: 'Необходимо загрузить файл статьи в формате .docx'
      });
    }

    // Декодируем имя файла
    const decodedFilename = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    // Создаем документ
    const document = new DocumentModel({
      filename: decodedFilename,
      path: req.file.path,
      author: req.userId,
    });
    const savedDocument = await document.save({ session });

    // Парсим массивы из строк (так как multipart отправляет все как строки)
    let keywords = [];
    let literature = [];
    
    try {
      keywords = req.body.keywords ? JSON.parse(req.body.keywords) : [];
      literature = req.body.literature ? JSON.parse(req.body.literature) : [];
    } catch (e) {
      // Если не JSON, пробуем разделить по запятым
      keywords = req.body.keywords ? req.body.keywords.split(',').map(k => k.trim()) : [];
      literature = req.body.literature ? req.body.literature.split(',').map(l => l.trim()) : [];
    }
    // Создаем документ статьи
    const post = new PostModel({
      title: req.body.title,
      authors: req.body.authors,
      position: req.body.position,
      organization: req.body.organization,
      email: req.body.email,
      abstract: req.body.abstract,
      keywords: keywords,
      documentId: savedDocument._id,
      literature: literature,
      user: req.userId
    });

    const savedPost = await post.save({ session });

    // Обновляем документ
    savedDocument.postId = savedPost._id;
    await savedDocument.save({ session });

    await session.commitTransaction();
    
    res.status(201).json({
      success: true,
      post: savedPost,
      document: savedDocument
    });
    } catch (err) {
    await session.abortTransaction();
    // Удаляем файл при ошибке
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.error('Ошибка удаления файла:', e);
      }
    }
    
    console.error('Ошибка создания статьи:', err);
    res.status(500).json({
      message: 'Не удалось создать статью',
      error: err.message
    });
  } finally {
    session.endSession();
  }
};

   
export const search = async (req, res) => {
  try {
    const { query, author, keywords } = req.query;
    let searchQuery = {};

    // Полнотекстовый поиск
    if (query) {
      searchQuery.$text = { $search: query };
    }

    // Поиск по автору
    if (author) {
      searchQuery.authors = { $regex: author, $options: 'i' };
    }

    // Поиск по ключевым словам
    if (keywords) {
      const keywordArray = keywords.split(',').map(k => k.trim());
      searchQuery.keywords = { $in: keywordArray };
    }
    const posts = await PostModel
      .find(searchQuery)
      .populate('user')
      .populate('documentId')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Ошибка поиска',
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    // Валидация ID статьи
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Некорректный ID статьи" });
    }

    // Поиск статьи и проверка прав
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Статья не найдена" });
    }
    
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Доступ запрещен" });
    }

    // Обновление данных
    const updatedPost = await PostModel.findByIdAndUpdate(
      postId,
      {
        $set: {
          title: req.body.title,
          authors: req.body.authors,
          position: req.body.position,
          organization: req.body.organization,
          email: req.body.email,
          abstract: req.body.abstract,
          keywords: req.body.keywords,
          content: req.body.content,
          literature: req.body.literature
        }
      },
      { new: true } // Возвращаем обновленную версию
    );

    res.json(updatedPost);
    
  } catch (err) {
    console.error('Ошибка обновления:', err);
    res.status(500).json({
      message: 'Ошибка при обновлении статьи',
      error: err.message
    });
  }
};