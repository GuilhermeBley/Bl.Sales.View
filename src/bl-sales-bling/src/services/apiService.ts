import axios from 'axios';

const resolveApiUrl = () => {
  try {
    return process.env.REACT_APP_API_URL ?? 'http://localhost:8080'
  } catch {
    return 'http://localhost:8080';
  }
};

const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;