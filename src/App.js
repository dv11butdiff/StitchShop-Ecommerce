import { useState, createContext, useEffect, lazy, Suspense } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Loader from "./components/Loader/Loader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import useData from "./utils/dataUtil";
import { toast } from "react-toastify";

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

  // Update allProducts state when productsData changes
  useEffect(() => {
    if (productsData) {
      setAllProducts(productsData);
    }
  }, [productsData]);

  // Update UserInfo state when userData changes
  useEffect(() => {
    console.log(userData);
      if (userData) {
        const primaryAddress =
          userData.address && userData.address.length > 0 ? userData.address[0] : null;
  
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
    }
  }, [cartData, cartLoading]); // Added cartLoading to ensure data is stable

  const deletion = async (product) => {
    try {
      await removeItemToCart(product.cart_item_id);
      // Trigger cart refresh after successful deletion
      setCartNeedsRefresh(true);
      toast.info(`${product.product_name} completely removed from cart.`);
    } catch (error) {
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
      toast.info(
        `${product.product_name} quantity updated in cart.`
      );
    } catch (error) {
      toast.error(
        `Failed to update quantity of ${product.product_name} from cart.`
      );
      console.error("Error updating cart item:", error);
    }
  };

  const addToCart = async (product, num = 1) => {
    const productExit = CartItem.find(
      (item) => item.product === product.product_id
    );

    if (productExit) {
      // If product exists in cart, update its quantity
      update(productExit, productExit.quantity + num);
    } else {
      // If product does not exist, add it to cart
      try {
        const payload = {
          cart: parseInt(localStorage.getItem("cart"), 10), // Ensure cart ID is an integer
          product: product.product_id,
          quantity: num,
        };
        console.log("Adding new item to cart with payload:", payload);
        await addItemToCart(payload);
        // Trigger cart refresh after successful addition
        setCartNeedsRefresh(true);
        // Only show toast if cart data isn't actively loading to avoid double notifications
        if (!cartLoading) toast.info(`${product.product_name} added to the cart.`);
      } catch (error) {
        // This catch block should only handle errors during *creation* of a new item
        // not logic for updating. The previous code had the update logic here, which was incorrect.
        toast.error(`Failed to add ${product.product_name} to cart.`);
        console.error("Error adding new cart item:", error);
      }
    }
  };

  const decreaseQty = (product) => {
    const productExit = CartItem.find(
      (item) => item.product_id === product.product_id
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
    const productToDelete = CartItem.find(
      (item) => item.product && item.product.product_id === product.product_id
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
