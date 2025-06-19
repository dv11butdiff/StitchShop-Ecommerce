import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Container, Row, Col } from "react-bootstrap";
import "../components/Checkout/orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/orders/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setOrders(response.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
        toast.error("Unable to fetch orders.");
      }
    };

    fetchOrders();
  }, []);

  return (
    <Container className="py-5">
      <h2 className="mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order, index) => (
          <div key={index} className="order-card mb-4 p-3 border rounded">
            <h5>Order #{order.id}</h5>
            <p>Total: ₱{order.total_price}</p>
            <p>Payment Method: {order.payment_method}</p>
            <h6>Items:</h6>
            <ul>
              {order.items?.map((item, idx) => (
                <li key={idx}>
                  Product ID: {item.product_id}, Quantity: {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </Container>
  );
};

export default Orders;
