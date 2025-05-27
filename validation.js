import { body, validationResult } from 'express-validator';

export const loginValidator = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Пароль минимум пять символов').isLength({ min: 5 }),
];

export const RegisterValidator = [
  body('email', 'Неверный формат почты').isEmail(),
  body('password', 'Пароль минимум пять символов').isLength({ min: 5 }),
  body('fullName', 'Укажите имя').isLength({ min: 3 }),
  body('role', 'Неверная роль')
    .optional() // Поле не обязательно, если не передано
    .isString() // Проверяем, что это строка
    .isIn(['admin', 'editor', 'reader']) // Проверяем, что значение находится в списке допустимых
    .withMessage('Роль должна быть одной из: admin, editor, reader'), 
];

export const postCreateValidation = [
  body('title', 'Введите заголовок статьи (мин. 3 символа)').isLength({ min: 3 }).isString(),
  body('authors', 'Укажите авторов').isString().notEmpty(),
  body('position', 'Укажите должность').isString().notEmpty(),
  body('organization', 'Укажите организацию').isString().notEmpty(),
  body('email', 'Неверный формат email').isEmail(),
  body('abstract', 'Добавьте аннотацию').isString().notEmpty(),
  body('keywords', 'Ключевые слова должны быть массивом').optional().isArray(),
  body('content', 'Текст статьи обязателен').isString().notEmpty(),
  body('literature', 'Список литературы обязателен').isArray(),
];


