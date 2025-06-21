import React, { useEffect, useState } from "react";
import axios from "axios"; // Keep axios import
import { toast } from "react-toastify";
import { Container, Row, Col } from "react-bootstrap";
import "../components/Checkout/orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]); // Keep state initialized as empty array

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/orders/", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setOrders(response.data); // Set orders with data from API
      } catch (err) {
        console.error("Failed to fetch orders", err);
        toast.dismiss();
        toast.error("Unable to fetch orders.");
      }
    };

    fetchOrders();
  }, []); // Dependency array remains empty to fetch once on mount

  console.log(orders); // This will log the fetched orders

  return (
    <Container className="py-5">
      <h2 className="mb-4">My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order, index) => (
          <div key={index} className="order-card mb-4 p-3 border rounded">
            <h5>Order #{order.order_id}</h5>
            {/* Displaying new fields from your sample data */}
            <p><strong>Username:</strong> {order.user_username}</p>
            <p><strong>Status:</strong> {order.order_status_display}</p>
            <p><strong>Order Date:</strong> {new Date(order.order_date).toLocaleString()}</p>
            <p><strong>Total:</strong> ₱{order.total_amount}</p>
            {/* Conditionally display payment method, handling null */}
            <p><strong>Payment Method:</strong> {order.payment_details || 'N/A'}</p>
            <p><strong>Shipping Address:</strong> {order.shipping_address_display}</p>
            <p><strong>Billing Address:</strong> {order.billing_address_display}</p>

            <h6>Items:</h6>
            <ul>
              {/* Check if order.items exists and has length before mapping */}
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <li key={idx}>
                    Product ID: {item.product_id}, Quantity: {item.quantity}
                  </li>
                ))
              ) : (
                <li>No items found for this order.</li>
              )}
            </ul>
          </div>
        ))
      )}
    </Container>
  );
};

export default Orders;