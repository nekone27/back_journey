import { body } from 'express-validator';

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