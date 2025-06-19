import { useContext, useState, useEffect } from "react";
import { DataContainer } from "../App";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap"; // Removed Container, Row, Col as they are not used
import axios from "axios";
import "../components/Checkout/checkout.css";
import { toast } from "react-toastify"; // Import toast for notifications

const Checkout = () => {
  const { CartItem, setCartItem, UserInfo } = useContext(DataContainer);
  const navigate = useNavigate();

  // Initialize form state using UserInfo.address
  const [form, setForm] = useState({
    fullName: UserInfo.firstName + " " + (UserInfo.middleName || "") + " " + UserInfo.lastName,
    email: UserInfo.email,
    // Populate address fields from UserInfo.address
    buildingHouseNo: UserInfo.address?.buildingHouseNo || "",
    streetName: UserInfo.address?.streetName || "",
    barangay: UserInfo.address?.barangay || "",
    cityMunicipality: UserInfo.address?.cityMunicipality || "",
    province: UserInfo.address?.province || "",
    postalCode: UserInfo.address?.postalCode || "",
    country: UserInfo.address?.country || "",
    paymentMethod: '', // ✅ add this line
  });

  // Effect to check for address presence
  useEffect(() => {
    // Check if UserInfo is loaded and if the address is missing
     if (UserInfo && (!UserInfo.address || Object.keys(UserInfo.address).length === 0)) {
      toast.error("Please update your address information in your profile to proceed with checkout.");
      navigate("/profile");
    } 
  }, [UserInfo, navigate]); // Depend on UserInfo and navigate

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

    // Construct the address object from the form state
    const shippingAddress = {
      buildingHouseNo: form.buildingHouseNo,
      streetName: form.streetName,
      barangay: form.barangay,
      cityMunicipality: form.cityMunicipality,
      province: form.province,
      postalCode: form.postalCode,
      country: form.country,
      // You might want to add addressType here, e.g., "shipping"
    };

    const order = {
      customer_info: { // Changed from 'customer' to 'customer_info' for clarity or based on API
        fullName: form.fullName,
        email: form.email,
        // Include the structured address here
        address: shippingAddress,
      },
      items: Array.isArray(CartItem)
        ? CartItem.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          }))
        : [],
      total_price: totalPrice,
      payment_method: form.paymentMethod,
    };
    
      try {
      // Replace alert with toast notification
      await axios.post("http://localhost:8000/api/orders/", order);
      toast.success("Order placed successfully!");
      setCartItem([]); // Clear cart after successful order
      navigate("/orders"); // Navigate to home or order confirmation page
    } catch (error) {
      console.error("Order submission failed", error);
      // Replace alert with toast notification
      toast.error("Failed to place order. Please try again.");
      
       navigate("/orders"); //temporary navigation to orders page
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
              readOnly // Make full name read-only as it comes from UserInfo
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
              readOnly // Make email read-only as it comes from UserInfo
              required
            />
          </Form.Group>

          <h2>Billing Address</h2>

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
            <option value="cod">Cash on Delivery</option>
            <option value="gcash">GCash</option>
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
        <h3>Total: {formatToPHP(totalPrice)}</h3>
      </div>
    </div>
  );
};

export default Checkout;
