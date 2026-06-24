import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const apiClient = axios.create({
  baseURL: API,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export async function submitServiceRequest(payload) {
  const { data } = await apiClient.post('/service-requests', payload);
  return data;
}
