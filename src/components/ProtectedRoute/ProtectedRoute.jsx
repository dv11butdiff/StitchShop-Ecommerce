import { Navigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const BASE_URL = "http://localhost:8000/api";

  const authAxios = axios.create({
    baseURL: BASE_URL,
  });

  const authCheck = async () => {
    console.log("ProtectedRoute: Initiating authentication check...");
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        console.warn("ProtectedRoute: No access token found in localStorage. Setting unauthorized.");
        setIsAuthorized(false);
        return;
      }

      const res = await authAxios.get(`${BASE_URL}/protected/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.status === 200) {
        console.log("ProtectedRoute: Auth check successful. User is authorized.");
        setIsAuthorized(true);
      } else {
        console.warn("ProtectedRoute: Auth check failed with non-200 status:", res.status, res.data);
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error(
        "ProtectedRoute: Authentication Check Error:",
        error.response?.status,
        error.response?.data?.detail || error.message || "Network Error"
      );

      if (error.response && error.response.status === 401) {
        console.log("ProtectedRoute: Access token expired. Attempting to refresh...");
        refreshAuthTokens(() => authCheck());
      } else {
        setIsAuthorized(false);
      }
    }
  };

  const refreshAuthTokens = async (callback) => {
    console.log("ProtectedRoute: Attempting to refresh tokens...");
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.warn("ProtectedRoute: No refresh token available to refresh. Setting unauthorized.");
        setIsAuthorized(false);
        return;
      }

      const res = await authAxios.post(
        `${BASE_URL}/auth/token/refresh/`,
        { refresh: refreshToken }
      );

      if (res.data && res.data.access) {
        localStorage.setItem('accessToken', res.data.access);
        if (res.data.refresh) {
          localStorage.setItem('refreshToken', res.data.refresh);
        }
        console.log("ProtectedRoute: Tokens refreshed successfully.");
        if (callback) {
          callback();
        } else {
        }
      } else {
        console.warn("ProtectedRoute: Token refresh failed or no new access token returned. Setting unauthorized.");
        setIsAuthorized(false);
      }
    } catch (error) {
      console.error(
        "ProtectedRoute: Refresh token failed:",
        error.response?.data?.detail || error.message
      );
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthorized(false);
    }
  };

  useEffect(() => {
    authCheck();
  }, []);

  if (isAuthorized === null) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-700">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mr-3"></div>
        Checking authentication status...
      </div>
    );
  }

  return isAuthorized ? children : <Navigate to="/login" replace />;
}
