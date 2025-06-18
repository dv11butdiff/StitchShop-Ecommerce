import { useContext, useState } from "react";
import { DataContainer } from "../App";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import axios from "axios";
import "../components/Checkout/checkout.css";

const Checkout = () => {
  const { CartItem, setCartItem } = useContext(DataContainer);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const order = {
      customer: form,
      items: Array.isArray(CartItem)
        ? CartItem.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          }))
        : [],
      total_price: totalPrice,
    };

    try {
      await axios.post("http://localhost:8000/api/orders/", order);
      alert("Order placed successfully!");
      setCartItem([]);
      navigate("/");
    } catch (error) {
      console.error("Order submission failed", error);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-form">
        <h2>Customer Information</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <h2>Billing Address</h2>

          <Form.Group>
            <Form.Label>Address</Form.Label>
            <Form.Control
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>City</Form.Label>
            <Form.Control
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              type="text"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Button type="submit" className="submit-button">
            Place Order
          </Button>
        </Form>
      </div>

      <div className="cart-summary">
        <h2>Order Summary</h2>
        {Array.isArray(CartItem) &&
          CartItem.map((item) => (
            <div key={item.cart_item_id}>
              <p>
                <strong>{item.product_name}</strong>
              </p>
              <p>
                {item.quantity} x {formatToPHP(item.product_price)} = {" "}
                {formatToPHP(item.quantity * item.product_price)}
              </p>
            </div>
          ))}
        <h3>Total: {formatToPHP(totalPrice)}</h3>
      </div>
    </div>
  );
};

export default Checkout;