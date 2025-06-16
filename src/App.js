import { useState ,createContext, useEffect, lazy, Suspense } from "react"
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import NavBar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Loader from "./components/Loader/Loader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import useData from "./utils/dataUtil";
const Home =lazy(()=> import("./pages/Home"))
const Shop =lazy(()=> import("./pages/Shop"))
const Cart =lazy(()=> import("./pages/Cart"))
const ProductDetails =lazy(()=> import("./pages/ProductDetails"));
const Postal =lazy(()=> import("./pages/Postal"));
const Login =lazy(()=> import("./pages/Login"));
const Register =lazy(()=> import("./pages/Register"));
const UserProfile =lazy(()=> import("./pages/UserProfile"));
export const DataContainer = createContext();
function App() {
  const [CartItem, setCartItem] = useState([])
  const [selectedProduct,setSelectedProduct]=useState(null);

  const [allProducts, setAllProducts] = useState([]);

    const { data: productsData, loading: productsLoading, error: productsError, getData: fetchAllProducts } = useData("products/");

    useEffect(() => {
        fetchAllProducts(); 
    }, []);

    useEffect(() => {
        if (productsData) {
            setAllProducts(productsData);
        }
    }, [productsData]);

  const addToCart = (product,num=1) => {
    const productExit = CartItem.find((item) => item.product_id === product.product_id)
    if (productExit) {
      setCartItem(CartItem.map((item) => (item.product_id === product.product_id ? { ...productExit, qty: productExit.qty + num } : item)))
    } else {
      setCartItem([...CartItem, { ...product, qty: num }])
    }
  }

  const decreaseQty = (product) => {
    const productExit = CartItem.find((item) => item.product_id === product.product_id)
    
    if (productExit.qty === 1) {
      setCartItem(CartItem.filter((item) => item.product_id !== product.product_id))
    } else {
      setCartItem(CartItem.map((item) => (item.product_id === product.product_id ? { ...productExit, qty: productExit.qty - 1 } : item)))
    }
  }

  const deleteProduct = (product)=> {
      setCartItem(CartItem.filter((item) => item.product_id !== product.product_id))
  }
  useEffect(()=> {
      localStorage.setItem("cartItem",JSON.stringify(CartItem));
  },[CartItem])
  return (
    <DataContainer.Provider value={{CartItem,setCartItem,addToCart,decreaseQty,deleteProduct,selectedProduct,setSelectedProduct, allProducts}}>
      <Suspense fallback={<Loader/>}>
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
          <NavBar/>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/postal' element={<Postal/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/register' element={<Register/>}/>
            <Route path='/profile' element={<ProtectedRoute><UserProfile/></ProtectedRoute>}/>
            <Route path='/shop' element={<Shop/>}/>
            <Route path='/shop/:id' element={<ProductDetails/>}/>
            <Route path='/cart' element={<Cart/>}/>
          </Routes>
          <Footer />
        </Router>
      </Suspense>
    </DataContainer.Provider>
  )
}

export default App
