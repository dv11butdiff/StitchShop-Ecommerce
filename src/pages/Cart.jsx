// Cart.jsx
import { useContext, useEffect } from "react";
import { DataContainer } from "../App";
import { Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { CartItem, setCartItem, addToCart, decreaseQty, deleteProduct } =
    useContext(DataContainer);
  const navigate = useNavigate();
  const formatToPHP = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  const totalPrice = Array.isArray(CartItem)
    ? CartItem.reduce(
        (price, item) => price + item.quantity * item.product_price,
        0
      )
    : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (CartItem) {
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

      const processedProducts = CartItem.map(product => {
        // Process the product name to create a clean string for the image file name
        const processedNameForUrl = processString(product.product_name);
        
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

      setCartItem(processedProducts);
    }

    console.log(CartItem); // This will log the *previous* state due to closure
                               // To see the updated state, log outside useEffect or
                               // in another useEffect dependent on allProducts.
  }, []);

  return (
    <section className="cart-items">
      <Container>
        <Row className="justify-content-center">
          <Col md={8}>
            {Array.isArray(CartItem) && CartItem.length === 0 && (
              <h1 className="no-items product">No Items are added in Cart</h1>
            )}
            {Array.isArray(CartItem) &&
              CartItem.map((item) => {
                const productQty = item.product_price * item.quantity;
                return (
                  <div className="cart-list" key={item.cart_item_id}>
                    <Row>
                      <Col className="image-holder" sm={4} md={3}>
                        <img src={item.image_url} alt="" />
                      </Col>
                      <Col sm={8} md={9}>
                        <Row className="cart-content justify-content-center">
                          <Col xs={12} sm={9} className="cart-details">
                            <h3>{item.product_name}</h3>
                            <h4>
                              {formatToPHP(item.product_price)} *{" "}
                              {item.quantity}
                              <span>{formatToPHP(productQty)}</span>
                            </h4>
                          </Col>
                          <Col xs={12} sm={3} className="cartControl">
                            <button
                              className="incCart"
                              onClick={() => addToCart(item)}
                            >
                              <i className="fa-solid fa-plus"></i>
                            </button>
                            <button
                              className="desCart"
                              onClick={() => decreaseQty(item)}
                            >
                              <i className="fa-solid fa-minus"></i>
                            </button>
                          </Col>
                        </Row>
                      </Col>
                      <button
                        className="delete"
                        onClick={() => deleteProduct(item)}
                      >
                        <ion-icon name="close"></ion-icon>
                      </button>
                    </Row>
                  </div>
                );
              })}
          </Col>
          <Col md={4}>
            <div className="cart-total">
             <h2>Cart Summary</h2>
              <div className="d_flex mb-3">
                <h4>Total Price :</h4>
                <h3>{formatToPHP(totalPrice)}</h3>
              </div>
                <button className="btn btn-primary w-100" onClick={() => navigate("/checkout")}>
                  Proceed to Checkout
                </button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Cart;
