import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useData from "../utils/dataUtil"; // Import the custom hook

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState(1); // New state to manage the current step
  const navigate = useNavigate();

  const { createData, error, loading } = useData("auth/register/");

  const handleNextStep = () => {
    // Client-side validation for Step 1 before moving to Step 2
    if (step === 1) {
      if (!username || !email || !password || !confirmPassword) {
        toast.error("Please fill in all required fields for account details.");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match!");
        return;
      }
      // You can add more complex validation for email/username here if needed
    }
    setStep(step + 1);
  };

  const handlePreviousStep = () => {
    setStep(step - 1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // The backend submission logic remains the same, as all data is gathered before final submit
    try {
      const responseData = await createData({
        username,
        email,
        password,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        phone,
        role: "user",
      });

      if (responseData) {
        toast.success("Registration successful! Please login.");
        navigate("/login");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration submission error:", err);
    }
  };

  React.useEffect(() => {
    if (error) {
      const errorMessages = error.data
        ? Object.values(error.data).flat().join(" ")
        : error.message || "Registration failed. Please try again.";
      toast.error(errorMessages);
    }
  }, [error]);

  return (
    <section
      className="register-page py-5"
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={7}>
            <div
              className="register-form p-4 shadow-lg rounded"
              style={{ backgroundColor: "white" }}
            >
              <h2 className="text-center mb-4" style={{color: '#483C51'}}>USER REGISTRATION</h2>
              <hr />
              <Form onSubmit={step === 2 ? handleRegister : handleNextStep}>
                {/* Step 1: Account Details */}
                {step === 1 && (
                  <>
                    <h4 className="mb-3">Account Details</h4>
                    <Row>
                      <Col md={6}>
                        <Form.Group
                          className="mb-3"
                          controlId="formRegisterUsername"
                        >
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group
                          className="mb-3"
                          controlId="formRegisterEmail"
                        >
                          <Form.Label>Email address</Form.Label>
                          <Form.Control
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group
                          className="mb-3"
                          controlId="formRegisterPassword"
                        >
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group
                          className="mb-3"
                          controlId="formRegisterConfirmPassword"
                        >
                          <Form.Label>Confirm Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button
                      variant="primary"
                      className="w-100 mt-3 rounded-pill"
                      style={{
                        background: '#483C51',
                        border: "none",
                        padding: "10px 0",
                        fontWeight: "bold",
                      }}
                      onClick={handleNextStep}
                    >
                      Next
                    </Button>
                  </>
                )}

                {/* Step 2: Personal Information */}
                {step === 2 && (
                  <>
                    <h4 className="mb-3" style={{color: '#483C51'}}>Personal Information</h4>
                    <Row>
                      <Col md={6}>
                        <Form.Group
                          className="mb-3"
                          controlId="formRegisterFirstName"
                        >
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group
                          className="mb-3"
                          controlId="formRegisterMiddleName"
                        >
                          <Form.Label>Middle Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter middle name (optional)"
                            value={middleName}
                            onChange={(e) => setMiddleName(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group
                          className="mb-3"
                          controlId="formRegisterLastName"
                        >
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3" controlId="formRegisterPhone">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </Form.Group>

                    <Row className="mt-3">
                      <Col>
                        <Button
                          variant="secondary"
                          className="w-100 rounded-pill"
                          onClick={handlePreviousStep}
                        >
                          Previous
                        </Button>
                      </Col>
                      <Col>
                        <Button
                          variant="primary"
                          type="submit" // This button will now submit the form
                          className="w-100 rounded-pill"
                          style={{
                            background: '#483C51',
                            border: "none",
                            padding: "10px 0",
                            fontWeight: "bold",
                          }}
                          disabled={loading}
                        >
                          {loading ? "Registering..." : "Register"}
                        </Button>
                      </Col>
                    </Row>
                  </>
                )}
              </Form>
              <p className="text-center mt-3">
                Already have an account? <a href="/login">Login here</a>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Register;