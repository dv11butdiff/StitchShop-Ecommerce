import { Navigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";

export default function ProtectedRoute({ children }) { // Removed 'group' prop
  const [isAuthorized, setIsAuthorized] = useState(null);
  const BASE_URL = "http://localhost:8000/api"; // Local Django backend URL

  const auth = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken'); // Assuming you store accessToken in localStorage

      if (!accessToken) {
        setIsAuthorized(false);
        return;
      }

      // Send a request to a protected endpoint to validate the access token
      // This endpoint should ideally be a lightweight check, like a /verify-token/ or a user info endpoint.
      // For this example, we'll hit a generic protected endpoint (you might need to adjust this on your backend).
      const res = await axios.get(`${BASE_URL}/protected-route/`, { // Changed to GET as it's a validation
        headers: {
          Authorization: `Bearer ${accessToken}`, // Send access token as Bearer
        },
        withCredentials: true, // If your backend also relies on session cookies
      });

      if (res.status === 200) { // Assuming a 200 OK means authorized
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.log(
        "Authorization Error:",
        error.response?.data?.detail || error.message
      );

      // If the error is 401 Unauthorized, it might mean the access token is expired
      if (error.response && error.response.status === 401) {
        refresh(); // Try refreshing the token
      } else {
        setIsAuthorized(false);
      }
    }
  };

  const refresh = async () => {
    try {
      // Send a request to the refresh token endpoint.
      // The refresh token is typically sent via an HTTP-only cookie,
      // so `withCredentials: true` is important.
      const res = await axios.post(
        `${BASE_URL}/auth/token/refresh/`,
        {}, // No explicit body data needed if refresh token is in cookie
        { withCredentials: true }
      );

      if (res.data && res.data.access) {
        // If refresh is successful, update the new access token in localStorage
        localStorage.setItem('accessToken', res.data.access);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    } catch (error) {
      console.log(
        "Refresh Error:",
        error.response?.data?.detail || error.message
      );
      // If refresh fails, clear tokens and set as unauthorized
      localStorage.removeItem('accessToken');
      // You might also want to clear the refresh token cookie if it's explicitly managed client-side
      setIsAuthorized(false);
    }
  };

  useEffect(() => {
    auth();
  }, []); // Run auth once on component mount

  if (isAuthorized === null) {
    // Optionally, you can show a loading spinner or placeholder until the auth check is complete
    return <div>Loading...</div>;
  }

  // Redirect to a generic login page if not authorized
  return isAuthorized ? children : <Navigate to="/login" />;
}

// Usage to App.js
        //   <Routes>
        //     <Route path='/login' element={<Login/>}/>
        //     <Route path='/register' element={<Register/>}/>
        //     <Route path='/' element={<Home/>}/>
        //     <Route path='/shop' element={<ProtectedRoute><Shop/></ProtectedRoute>}/>
        //     <Route path='/shop/:id' element={<ProtectedRoute><ProductDetails/></ProtectedRoute>}/>
        //     <Route path='/cart' element={<ProtectedRoute><Cart/></ProtectedRoute>}/>
        //   </Routes>