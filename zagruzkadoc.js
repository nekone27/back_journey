import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const UploadForm = () => {
  const [files, setFiles] = useState({});
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    onDrop: (acceptedFiles) => {
      const [review, content, abstractRu, abstractEn] = acceptedFiles;
      setFiles({ review, content, abstractRu, abstractEn });
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(files).forEach(([key, file]) => formData.append(key, file));

    try {
      await axios.post('/api/articles/upload', formData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Статья загружена!');
    } catch (err) {
      alert('Ошибка загрузки: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Перетащите файлы: рецензию, статью, аннотации (ru/en)</p>
      </div>
      <button type="submit">Отправить</button>
    </form>
  );
};

export default UploadForm;