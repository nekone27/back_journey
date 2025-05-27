import PostModel from '../models/post.js';
import mongoose from 'mongoose';

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

    // Проверка валидности ID
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Неверный ID статьи" });
    }

    // Используем async/await без колбэка
    const post = await PostModel.findOneAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } },
      { new: true } // Возвращает обновленный документ
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

// Controllers/PostController.js
export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    // Проверка валидности ID
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Неверный формат ID" });
    }

    // Найти пост и проверить, что пользователь является автором
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Статья не найдена" });
    }

    // Проверка прав доступа: только автор может удалить пост
    if (post.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Нет прав для удаления" });
    }

    // Удаление поста
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
  try {
    // Создаем документ статьи
    const doc = new PostModel({
      title: req.body.title,
      authors: req.body.authors,
      position: req.body.position,
      organization: req.body.organization,
      email: req.body.email,
      abstract: req.body.abstract,
      keywords: req.body.keywords,
      content: req.body.content,
      literature: req.body.literature,
      user: req.userId // Привязка к автору
    });

    // Сохраняем статью в базе
    const post = await doc.save();
    
    // Возвращаем созданную статью
    res.status(201).json(post);
    
  } catch (err) {
    // Обработка ошибок
    console.error('Ошибка создания статьи:', err);
    res.status(500).json({
      message: 'Не удалось создать статью',
      error: err.message
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