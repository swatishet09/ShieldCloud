
import axios from 'axios';

//const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const BASE_URL = "https://oq8l79wl3m.execute-api.ap-south-1.amazonaws.com/store";
export default axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
