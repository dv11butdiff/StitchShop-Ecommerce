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

export const DataContainer = createContext();
function App() {
  const [CartItem, setCartItem] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [UserInfo, setUserInfo] = useState([]);

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

  useEffect(() => {
    fetchAllProducts();
    if (localStorage.getItem("accessToken")) fetchAllCartItems();
  }, []);

  useEffect(() => {
    if (productsData) {
      setAllProducts(productsData);
    }
  }, [productsData]);

  const deletion = async (product) => {
    try {
      await removeItemToCart(product.cart_item_id);
      fetchAllCartItems();
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
      fetchAllCartItems();
      toast.info(
        `${product.product_name} completely updated quantity from cart.`
      );
    } catch (error) {
      toast.error(
        `Failed to update quantity of ${product.product_name} from cart.`
      );
      console.error("Error updating cart item:", error);
    }
  };

  const addToCart = (product, num = 1) => {
    let productExit = [];
    if (UserInfo.cart) {
      productExit = CartItem.find(
        (item) => item.product_id === product.product_id
      );
    }

    console.log("selected: ", selectedProduct);
    console.log("Item: ", productExit);
    console.log("Product: ", product);

    if (productExit && UserInfo.cart) {
      // update
      update(productExit, productExit.quantity + 1);
    } else {
      // create
      try {
        const payload = {
          cart: localStorage.getItem("cart"),
          product: product.product_id,
          quantity: num,
        };
        addItemToCart(payload);
        fetchAllCartItems();
        toast.info(`${product.product_name} added to the cart.`);
      } catch (error) {
        toast.error(`Failed to add ${product.product_name} to cart.`);
        console.error("Error adding cart item:", error);
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
      console.log("Delete ID: ", productExit.cart_item_id);
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
  useEffect(() => {
    console.log(cartData);
    if (!cartLoading && cartData) {
      console.log("cartData received:", cartData); // <--- is this an array?
      setCartItem(cartData);
    }
  }, [cartData]);
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
          </Routes>
          <Footer />
        </Router>
      </Suspense>
    </DataContainer.Provider>
  );
}

export default App;
