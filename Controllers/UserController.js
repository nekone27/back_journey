import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';

import UserModel from '../models/users.js';

export const register = async (req, res) => {      // регистрация
  try {                                        // проверка условия регистрации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    const password = req.body.password; // шифруем пароль [хэш]
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const doc = new UserModel({       // модель юзера
      email: req.body.email,
      passwordHash,
      fullName: req.body.fullName,
      role: req.body.role,
    });

    const user = await doc.save(); // сохраняем док в бд 

    const token = jwt.sign({
      _id: user._id,
    }, 'secret123', { expiresIn: '30d' });

    res.json({
      ...user._doc,
      token
    });
  } catch (err) {         // при неудачной попытке
    console.log(err);    // логи для себя либо в json либо в mongo ошибка
    res.status(500).json({
      message: 'Не удалось зарегистрироваться',
    });
  }
};    

export const login = async (req, res) => {     // логин
  try {
    const user = await UserModel.findOne({ email: req.body.email });   // поиск по email
  
    if (!user) {                                // почта не найдена 
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash); // проверка пароля

    if (!isValidPass) {
      return res.status(404).json({
        message: 'Неверный логин или пароль', 
      });
    }

    // Если всё успешно - создаем и возвращаем токен
    const token = jwt.sign({
      _id: user._id,
    }, 'secret123', { expiresIn: '30d' });

    res.json({
      ...user._doc,
      token
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нет доступа',
    });
  }
};


export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден',
      });
    }

    const { passwordHash, ...userData } = user._doc;
    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Нет доступа',
    });
  }
};