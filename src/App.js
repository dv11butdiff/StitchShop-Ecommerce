import { useState, createContext, useEffect, lazy, Suspense, useMemo } from "react"; // Added useMemo
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Loader from "./components/Loader/Loader";
import { ToastContainer, toast } from "react-toastify"; // Ensure toast is imported
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import useData from "./utils/dataUtil";
import axios from "axios"; // Import axios for direct instance creation

const Home = lazy(() => import("./pages/Home"));
const Shop = lazy(() => import("./pages/Shop"));
const Cart = lazy(() => import("./pages/Cart"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Postal = lazy(() => import("./pages/Postal"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Checkout = lazy(() => import("./pages/Checkout"));

const OrderItem = lazy(() => import("./pages/OrderItem"));

export const DataContainer = createContext();

// Define BASE_URL consistent with dataUtil.js
const BASE_URL = "http://127.0.0.1:8000/api";

function App() {
  const [CartItem, setCartItem] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [UserInfo, setUserInfo] = useState([]);
  // New state to explicitly trigger cart data refresh
  const [cartNeedsRefresh, setCartNeedsRefresh] = useState(false);

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    getData: fetchAllProducts,
  } = useData("products/");
  const {
    data: cartData,
    loading: cartLoading,
    error: cartError,
    getData: fetchAllCartItems,
    createData: addItemToCart,
    deleteData: removeItemToCart,
    updateData: updateItemToCart,
  } = useData("cartitems/");
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    getData: fetchUserData,
  } = useData("auth/me/");

  // Create an Axios instance that mirrors the authentication logic in dataUtil.js
  // This instance will be used by the helper functions defined below
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: BASE_URL,
    });

    instance.interceptors.request.use(
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

    instance.interceptors.response.use(
      (response) => response,
      async (err) => {
        const originalRequest = err.config;
        
        // Handle 401 Unauthorized errors to refresh token
        // Exclude refresh token endpoint itself from retry logic to prevent infinite loops
        if (err.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/token/refresh/')) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
              console.warn("No refresh token found in localStorage. Redirecting to login.");
              window.location.href = '/login'; // Redirect to login if no refresh token
              return Promise.reject(err);
            }

            // Attempt to refresh the token
            const refreshResponse = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
              refresh: refreshToken,
            });

            const newAccessToken = refreshResponse.data.access;
            localStorage.setItem('accessToken', newAccessToken); // Store new access token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`; // Set new token for original request

            // Re-run the original failed request with the new token
            return instance(originalRequest);

          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
            // Clear all auth-related local storage items on refresh failure
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('UserInfo');
            localStorage.removeItem('cartItem');
            // Reset frontend state
            setCartItem([]);
            setUserInfo({});
            toast.error("Session expired. Please log in again.");
            window.location.href = '/login'; // Redirect to login on refresh failure
            return Promise.reject(refreshError);
          }
        }
        // For any other non-401 error, or if retry logic fails/is not applicable, reject the promise
        return Promise.reject(err);
      }
    );
    return instance;
  }, []); // Empty dependency array means this axios instance is created once and reused

  // Helper function to create a new empty cart using the configured axiosInstance
  const createNewEmptyCart = async () => {
    try {
      // POST request to the shoppingcarts endpoint to create a new cart
      // The backend will automatically link it to the authenticated user.
      const response = await axiosInstance.post(`/shoppingcarts/`, {});
      const newCartId = response.data.cart_id;
      console.log("New empty shopping cart created with ID:", newCartId);

      // Clear CartItem state and localStorage for cart items
      setCartItem([]);
      localStorage.removeItem("cartItem");

      // Update UserInfo state and localStorage with the new cart ID
      setUserInfo(prevInfo => {
        // Ensure prevInfo is an object before spreading, if it could be an array initially
        const currentInfo = Array.isArray(prevInfo) && prevInfo.length > 0 ? prevInfo[0] : prevInfo;
        const updatedInfo = { ...currentInfo, cart: newCartId };
        localStorage.setItem("UserInfo", JSON.stringify(updatedInfo)); // Persist updated UserInfo
        return updatedInfo;
      });

      toast.info("A new empty cart has been created for you.");
      return newCartId; // Return new cart ID if needed by caller
    } catch (error) {
      console.error("Failed to create new empty shopping cart:", error.response?.data || error.message);
      toast.error("Failed to set up new cart.");
      throw error; // Propagate error
    }
  };

  // Main function to clear the old cart and create a new one
  const clearUserCartAndCreateNew = async () => {
    const oldCartId = UserInfo.cart; // Get the current user's cart ID from UserInfo state

    // No need for explicit accessToken check here as axiosInstance handles authentication/token refresh
    // and will inherently fail if no token is present/valid.

    try {
      if (oldCartId) { // Only attempt to delete if an old cart ID exists
        // 1. Delete the old shopping cart using the configured axiosInstance
        await axiosInstance.delete(`/shoppingcarts/${oldCartId}/`);
        console.log("Old shopping cart deleted from database.");
      } else {
        console.warn("No old cart ID found to delete. Proceeding to create a new one.");
      }
      
      // 2. Create a new, empty shopping cart
      await createNewEmptyCart(); // Call the helper function

    } catch (error) {
      console.error("Error clearing/recreating user's shopping cart:", error.response?.data || error.message);
      toast.error("Failed to clear and set up new shopping cart.");
    }
  };


  // Fetch all products once on component mount
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Fetch user data once on component mount if access token exists
  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      fetchUserData();
    }
  }, []);

  // Fetch cart items when the component mounts or when cartNeedsRefresh is true
  // This replaces the problematic `[CartItem]` dependency
  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      fetchAllCartItems();
    }
    // Reset the flag after fetching to prevent infinite loop
    setCartNeedsRefresh(false);
  }, [cartNeedsRefresh]); // Only re-run when cart needs a refresh

useEffect(() => {
    if (productsData) {
      // Revised processString function
      const processString = (inputString) => {
        let result = inputString.toLowerCase();

        // 1. Remove content inside parentheses and the parentheses themselves
        // This regex matches an opening parenthesis, followed by any characters
        // that are not a closing parenthesis (non-greedy *?), and then a closing parenthesis.
        // It also handles optional whitespace around the parentheses.
        result = result.replace(/\s*\([^)]*\)\s*/g, ''); // Removes content within ()
        
        // 2. Remove apostrophes (if still desired, as they were in your last regex)
        result = result.replace(/[’']/g, ''); // Only apostrophes, as () are handled above

        // 3. Replace spaces with underscores
        result = result.replace(/ /g, "_");

        return result;
      };

      const processedProducts = productsData.map(product => {
        // Process the product name to create a clean string for the image file name
        const processedNameForUrl = processString(product.name);
        
        // Construct the full image path using the processed name
        // Assuming your images are in 'public/images/' and named after the product.
        // If the original product.image_url already contains a path like 'spool_of_thread.png'
        // and you want to process that existing URL, let me know.
        // Based on your previous code snippet, you're using `processedName` here.
        const fullImagePath = `/products/${processedNameForUrl}.jpg`; 
        // ^^^ IMPORTANT: Changed from `/products/` to `/images/` based on your file structure image.

        return {
          ...product,
          image_url: fullImagePath // Set the processed path to image_url
        };
      });

      setAllProducts(processedProducts);
    }

    console.log(allProducts); // This will log the *previous* state due to closure
                            // To see the updated state, log outside useEffect or
                            // in another useEffect dependent on allProducts.
  }, [productsData]);

  // Update UserInfo state when userData changes
  useEffect(() => {
    console.log(userData);
    if (userData) {
      const primaryAddress =
        userData.address && userData.address.length > 0
          ? userData.address[0]
          : null;

      setUserInfo({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        firstName: userData.first_name,
        middleName: userData.middle_name,
        lastName: userData.last_name,
        phoneNumber: userData.phone,
        role: userData.role,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        profilePicture: "https://placehold.co/150x150/0f3460/FFFFFF?text=JD",
        bio: "Passionate shopper and tech enthusiast. Always looking for the best deals!",
        cart: userData.cart?.cart_id, // Use optional chaining for cart
        address: primaryAddress
          ? {
              addressId: primaryAddress.address_id,
              streetName: primaryAddress.street_name,
              buildingHouseNo: primaryAddress.building_house_no,
              barangay: primaryAddress.barangay,
              cityMunicipality: primaryAddress.city_municipality,
              province: primaryAddress.province,
              postalCode: primaryAddress.postal_code,
              country: primaryAddress.country,
              addressType: primaryAddress.address_type,
            }
          : null,
      });
    }
  }, [userData]);

  // Update CartItem state when cartData changes and is not loading
  useEffect(() => {
    if (!cartLoading && cartData) {
      setCartItem(cartData);
      console.log("Available Cart Data: ", cartData);
    }
  }, [cartData, cartLoading]); // Added cartLoading to ensure data is stable

  const deletion = async (product) => {
    try {
      await removeItemToCart(product.cart_item_id);
      // Trigger cart refresh after successful deletion
      setCartNeedsRefresh(true);
      toast.dismiss();
      toast.info(`${product.product_name} completely removed from cart.`);
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to delete ${product.product_name} from cart.`);
      console.error("Error deleting cart item:", error);
    }
  };

  const update = async (product, quantity) => {
    try {
      const payload = { product: product.product, quantity: quantity };
      await updateItemToCart(product.cart_item_id, payload);
      // Trigger cart refresh after successful update
      setCartNeedsRefresh(true);
      toast.dismiss();
      toast.info(`${product.product_name} quantity updated in cart.`);
    } catch (error) {
      toast.dismiss();
      toast.error(
        `Failed to update quantity of ${product.product_name} from cart.`
      );
      console.error("Error updating cart item:", error);
    }
  };

  const addToCart = async (product, num = 1) => {
    setCartNeedsRefresh(true);

    const productExit = CartItem.find(
      (item) =>
        (item?.product || item?.product_id) ===
        (product?.product || product.product_id)
    );

    if (productExit) {
      // If product exists in cart, update its quantity
      console.log("Updating...");
      update(product, product.quantity + num);
      setCartNeedsRefresh(true);
      return;
    }
    console.log("Adding...");
    try {
      const payload = {
        cart: UserInfo.cart, // Use UserInfo.cart instead of localStorage.getItem("cart")
        product: product?.product_id || product?.product,
        quantity: num,
      };
      console.log("Adding new item to cart with payload:", payload);
      const res = await addItemToCart(payload);
      // Trigger cart refresh after successful addition
      setCartNeedsRefresh(true);
      // Only show toast if cart data isn't actively loading to avoid double notifications
      if (!cartLoading) {
        toast.dismiss();
        toast.info(
          `${product?.name || product?.product_name} added to the cart.`
        );
      }

      if (cartError?.data) {
        // This block might need re-evaluation based on exact error handling requirements
        // update(productExit, productExit.quantity + num); // This line was problematic
        console.log("Got some error on add item to cart:", cartError);
      }
    } catch (error) {
      // This catch block should only handle errors during *creation* of a new item
      toast.dismiss();
      toast.error(`Failed to add ${product.product_name} to cart.`);
      console.error("Error adding new cart item:", error);
    }
  };

  const decreaseQty = (product) => {
    setCartNeedsRefresh(true);

    const productExit = CartItem.find(
      (item) =>
        (item?.product || item?.product_id) ===
        (product?.product || product.product_id)
    );

    if (productExit.quantity === 1) {
      // delete
      deletion(productExit);
    } else {
      // update
      update(productExit, productExit.quantity - 1);
    }
  };

  const deleteProduct = (product) => {
    setCartNeedsRefresh(true);

    const productToDelete = CartItem.find(
      (item) =>
        (item?.product || item?.product_id) ===
        (product?.product || product.product_id)
    );
    if (!productToDelete) return;
    deletion(productToDelete);
  };
  

  return (
    <DataContainer.Provider
      value={{
        CartItem,
        setCartItem,
        addToCart,
        decreaseQty,
        deleteProduct,
        selectedProduct,
        setSelectedProduct,
        allProducts,
        UserInfo,
        setUserInfo,
        clearUserCart: clearUserCartAndCreateNew // Add the new helper function here
      }}
    >
      <Suspense fallback={<Loader />}>
        <Router>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/postal" element={<Postal />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              }
            />
            <Route path="/shop" element={<Shop />} />
            <Route path="/shop/:id" element={<ProductDetails />} />
            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <Cart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <OrderItem />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Footer />
        </Router>
      </Suspense>
    </DataContainer.Provider>
  );
}

export default App;