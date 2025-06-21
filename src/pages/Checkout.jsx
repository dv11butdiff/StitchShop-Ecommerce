import { useContext, useState, useEffect } from "react";
import { DataContainer } from "../App"; // Assuming DataContainer is in App.js
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import axios from "axios"; // Ensure axios is imported
import "../components/Checkout/checkout.css";
import { toast } from "react-toastify";
import useData from "../utils/dataUtil";

const Checkout = () => {
  // Destructure clearUserCart from DataContainer
  const { CartItem, setCartItem, UserInfo, clearUserCart } = useContext(DataContainer); // Get clearUserCart
  const navigate = useNavigate();
  const {
    data: orderData,
    error: orderError,
    loading: orderLoading,
    getData: fetchOrderData,
    createData: addOrderData,
  } = useData("orders/");

  const [form, setForm] = useState({
    fullName:
      UserInfo.firstName +
      " " +
      (UserInfo.middleName || "") +
      " " +
      UserInfo.lastName,
    email: UserInfo.email,
    buildingHouseNo: UserInfo.address?.buildingHouseNo || "",
    streetName: UserInfo.address?.streetName || "",
    barangay: UserInfo.address?.barangay || "",
    cityMunicipality: UserInfo.address?.cityMunicipality || "",
    province: UserInfo.address?.province || "",
    postalCode: UserInfo.address?.postalCode || "",
    country: UserInfo.address?.country || "",
    paymentMethod: "", // Ensure this is set by the form
  });

  console.log("Form: ", form);

  useEffect(() => {
    if (
      UserInfo &&
      (!UserInfo.address || Object.keys(UserInfo.address).length === 0)
    ) {
      toast.dismiss();
      toast.error(
        "Please update your address information in your profile to proceed with checkout."
      );
      navigate("/profile");
    }
  }, [UserInfo, navigate]);

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
      billing_address: UserInfo.address.addressId,
      shipping_address: UserInfo.address.addressId,
      items: Array.isArray(CartItem)
        ? CartItem.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          }))
        : [],
      total_amount: totalPrice,
      payment_method: form.paymentMethod, // Ensure this is correctly picked from form
      user: UserInfo.id,
    };

    try {
      await addOrderData(order);
      toast.dismiss();
      toast.success("Order placed successfully!");
      
      // IMPORTANT: Clear the old cart and create a new empty one
      await clearUserCart(); // Call the combined function from DataContainer

      // Then navigate to the orders page or home
      navigate("/orders");
    } catch (error) {
      console.error("Order submission failed", error.response?.data || error.message);
      toast.dismiss();
      toast.error("Failed to place order. Please try again.");
      // You might want to handle specific error cases or not navigate on error
      navigate("/orders"); // Temporary navigation for error case
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-form">
        <h2>Customer Information</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              readOnly
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              readOnly
              required
            />
          </Form.Group>

          {/* Address Fields */}
          <h3>Shipping Address</h3>
          <Form.Group className="mb-3">
            <Form.Label>Building/House No.</Form.Label>
            <Form.Control
              type="text"
              name="buildingHouseNo"
              value={form.buildingHouseNo}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Street Name</Form.Label>
            <Form.Control
              type="text"
              name="streetName"
              value={form.streetName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Barangay</Form.Label>
            <Form.Control
              type="text"
              name="barangay"
              value={form.barangay}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>City/Municipality</Form.Label>
            <Form.Control
              type="text"
              name="cityMunicipality"
              value={form.cityMunicipality}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Province</Form.Label>
            <Form.Control
              type="text"
              name="province"
              value={form.province}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              type="text"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Country</Form.Label>
            <Form.Control
              type="text"
              name="country"
              value={form.country}
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
        {/* Payment Method Selection */}
        <Form.Group className="mb-3">
          <Form.Label>Payment Method</Form.Label>
          <Form.Select
            name="paymentMethod"
            value={form.paymentMethod}
            onChange={handleChange}
            required
          >
            <option value="">-- Select Payment Method --</option>
            <option value="Cash On Delivery">Cash on Delivery</option>
            <option value="GCash">GCash</option>
          </Form.Select>
        </Form.Group>

        <h2>Order Summary</h2>
        {Array.isArray(CartItem) && CartItem.length > 0 ? (
          CartItem.map((item) => (
            <div key={item.cart_item_id} className="summary-item mb-2">
              <p>
                <strong>{item.product_name}</strong>
              </p>
              <p>
                {item.quantity} x {formatToPHP(item.product_price)} ={" "}
                {formatToPHP(item.quantity * item.product_price)}
              </p>
            </div>
          ))
        ) : (
          <p>Your cart is empty.</p>
        )}
        <div className="total-price mt-3">
          <h5>Total: {formatToPHP(totalPrice)}</h5>
        </div>
      </div>
    </div>
  );
};

export default Checkout;