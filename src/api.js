// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5173/', // Change if your backend uses a different URL or port
});

export default api;
