import axios from 'axios';

// Base URL backend Go
const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Energy endpoints
export const fetchEnergyData = async (params) => {
  try {
    const response = await api.get('/energy', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching energy data:', error);
    throw error;
  }
};

export const fetchEnergyStats = async () => {
  try {
    const response = await api.get('/energy/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

export const fetchHouseSummary = async () => {
  try {
    const response = await api.get('/energy/summary/houses');
    return response.data;
  } catch (error) {
    console.error('Error fetching house summary:', error);
    throw error;
  }
};

export const fetchDailySummary = async () => {
  try {
    const response = await api.get('/energy/summary/daily');
    return response.data;
  } catch (error) {
    console.error('Error fetching daily summary:', error);
    throw error;
  }
};

export const createEnergyData = async (data) => {
  try {
    const response = await api.post('/energy', data);
    return response.data;
  } catch (error) {
    console.error('Error creating energy data:', error);
    throw error;
  }
};

export const fetchHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};

export default api;