import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useData from '../utils/dataUtil';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const { createData, error, loading } = useData('auth/token/');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await createData({ username, password });

      if (data && data.access && data.refresh) {
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);

        toast.success('Login successful!');
        navigate('/');
      } else {
        toast.error(error?.data?.detail || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login submission error:', err);
    }
  };

  React.useEffect(() => {
    if (error) {
      const errorMessages = error.data ?
        Object.values(error.data).flat().join(' ') :
        error.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessages);
    }
  }, [error]);

  return (
    <section className="login-page py-5" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <div className="login-form p-4 shadow-lg rounded" style={{ backgroundColor: 'white' }}>
              <h2 className="text-center mb-4">User Login</h2>
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3" controlId="formBasicUsername">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 mt-3 rounded-pill"
                  style={{
                      background: 'linear-gradient(to right, #6a11cb 0%, #2575fc 100%)',
                      border: 'none',
                      padding: '10px 0',
                      fontWeight: 'bold',
                  }}
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </Form>
              <p className="text-center mt-3">
                Don't have an account? <a href="/register">Register here</a>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Login;
