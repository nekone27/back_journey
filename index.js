import express from "express";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import { RegisterValidator } from './validation/auth.js';
import UserModel from "./models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

mongoose.connect('mongodb+srv://admin:wwwww@cluster0.pituu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('DB OK'))
.catch((err) => console.log('DB error', err));

const app = express();

app.use(express.json());

app.get('/', (req, res) => {  
  res.send('Hello yo World');
}); 

app.post('/auth/login', async (req, res) => {     // логин
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
});

app.post('/auth/register', RegisterValidator, async (req, res) => {      // регистрация
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
});    

app.listen(4444, (err) => {  
  if (err) {
    return console.log(err);
  }
  console.log('Server OK');
});