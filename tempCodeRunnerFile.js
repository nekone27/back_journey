import express from "express";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import { RegisterValidator, loginValidator, postCreateValidation } from './validation.js';
import UserModel from "./models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import checkAuth from './utils/checkAuth.js';
import * as  UserController from './Controllers/UserController.js';
import * as  PostController from './Controllers/PostController.js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as DocumentController from './Controllers/DocumentController.js';


mongoose.connect('mongodb+srv://admin:wwwww@cluster0.pituu.mongodb.net/journey?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('DB OK'))
.catch((err) => console.log('DB error', err));

const app = express();




// Конфигурация Multer для документов
const documentStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads/documents');
  },
  filename: (_, file, cb) => {
    const uniqueName = `${uuidv4()}.${file.originalname.split('.').pop()}`;
    cb(null, uniqueName);
  },
});

const uploadDocument = multer({ 
  storage: documentStorage,
  fileFilter: (_, file, cb) => {
    if (file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Только .doc и .docx файлы разрешены'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});
app.use(express.json({ strict: true, limit: '10kb' }));



app.get('/', (req, res) => {  
  res.send('Hello yo World');
}); 

app.post('/auth/login', loginValidator, UserController.login);

app.post('/auth/register', RegisterValidator, UserController.register);

app.post('/auth/me', checkAuth, UserController.getMe );



app.get('/posts', PostController.getAll);     //vse stati
app.get('/posts/:id', PostController.getOne);  //odna statya
app.post('/posts', checkAuth, postCreateValidation, PostController.create);  //sozdanie ststi

app.delete('/posts/:id', checkAuth, PostController.remove);  //udalenie
app.patch('/posts/:id', checkAuth, PostController.update); // obnovlenie


app.post('/documents', checkAuth, uploadDocument.single('file'), DocumentController.uploadDocument);
app.get('/documents', checkAuth, DocumentController.getAllDocuments);
app.get('/documents/:id', checkAuth, DocumentController.downloadDocument);
app.delete('/documents/:id', checkAuth, DocumentController.deleteDocument);


app.listen(4444, (err) => {  
  if (err) {
    return console.log(err);
  }
  console.log('Server OK');
});