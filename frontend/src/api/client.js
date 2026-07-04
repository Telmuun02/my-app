import axios from "axios";

// Laravel back-end рүү хандах төвлөрсөн axios instance.
// Хаягийг .env доторх VITE_API_URL-ээс авна.
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default client;
