import axios from "axios";

const API_BASE = "http://localhost:8080/api";

const instance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 1000,
  headers: {'X-Custom-Header': 'foobar'}
});

export default instance;