import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize error message
    const message =
      error?.response?.data?.detail ??
      error?.message ??
      "Something went wrong while communicating with the server.";
    return Promise.reject(new Error(message));
  }
);

export { api };

