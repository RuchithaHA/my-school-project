import axios from "axios";

const base = import.meta.env.VITE_API_URL ?? "";

export const api = axios.create({
  baseURL: base || undefined,
});
