fetch('http://localhost:4444/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fullName: 'Иван Иванов',
    email: 'ivan@example.com',
    password: 'securepassword123',
    role: 'reader',
    avatarUrl: 'https://example.com/avatar.jpg',
  }),
})
  .then((response) => response.json())
  .then((data) => console.log('Успешная регистрация:', data))
  .catch((error) => console.error('Ошибка:', error));
  