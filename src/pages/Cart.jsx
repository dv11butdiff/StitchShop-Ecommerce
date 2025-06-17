// Cart.jsx
import { useContext, useEffect } from "react";
import { DataContainer } from "../App";
import { Col, Container, Row } from "react-bootstrap";

const Cart = () => {
  const { CartItem, setCartItem, addToCart, decreaseQty, deleteProduct } =
    useContext(DataContainer);

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
                        <img src={item.imgUrl} alt="" />
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
              <div className="d_flex">
                <h4>Total Price :</h4>
                <h3>{formatToPHP(totalPrice)}</h3>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Cart;
