import axios from "axios";
import { useState, useCallback } from "react";

const BASE_URL = "http://127.0.0.1:8000/api";

const useData = (endpointPath) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const axiosInstance = axios.create({
    baseURL: BASE_URL,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (err) => {
      const originalRequest = err.config;
      
      if (err.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/token/refresh/')) {
        originalRequest._retry = true;
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            
            console.warn("No refresh token found in localStorage. Redirecting to login.");
            window.location.href = '/login';
            return Promise.reject(err); 
          }

          const res = await axios.post(`${BASE_URL}/auth/token/refresh/`, { refresh: refreshToken });

          if (res.data && res.data.access) {
            localStorage.setItem('accessToken', res.data.access);
            
            if (res.data.refresh) {
              localStorage.setItem('refreshToken', res.data.refresh);
            }
            
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return axiosInstance(originalRequest); // Retry the original request
          }
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError.response?.data || refreshError.message);
          
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login'; 
          return Promise.reject(refreshError); 
        }
      }
      
      return Promise.reject(err);
    }
  );

  const endpoint = `${BASE_URL}/${endpointPath}`;

  // Fetch data
  const getData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(endpoint);
      setData(response.data);
      return response.data;
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, axiosInstance]);

  // Create data (POST)
  const createData = async (newData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(endpoint, newData);
      setData(response.data);
      return response.data;
    } catch (err) {
      handleError(err);
      return err?.response;
    } finally {
      setLoading(false);
    }
  };

  // Update data (PUT)
  const updateData = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const targetEndpoint = `${endpointPath.endsWith('/') ? endpoint : `${endpoint}/`}${id}/`;
      const response = await axiosInstance.put(targetEndpoint, updatedData);
      setData(response.data);
      return response.data;
    } catch (err) {
      handleError(err);
      return err?.response;
    } finally {
      setLoading(false);
    }
  };

  // Delete data (DELETE)
  const deleteData = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const targetEndpoint = `${endpointPath.endsWith('/') ? endpoint : `${endpoint}/`}${id}/`;
      await axiosInstance.delete(targetEndpoint);
      setData(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // Error handling function
  const handleError = (err) => {
    if (err?.response) {
      setError(err?.response);
      console.error("API Error:", err?.response?.data || err.message);
      console.log("API Error(2.0): ", err);
    } else {
      setError({
        status: null,
        message: "Network error, please try again later.",
      });
      console.error("Network Error:", err);
    }
  };

  return { data, error, loading, getData, createData, updateData, deleteData };
};

export default useData;
