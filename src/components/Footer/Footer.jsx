import React from "react"
import "./style.css"
import { Col, Container, Row } from "react-bootstrap"

const Footer = () => {
  return (
    <footer>
        <Container>
          <Row className="footer-row">
            <Col md={3} sm={5} className='box'>
              <div className="logo">
                  <ion-icon name="bag"></ion-icon>
                  <h1>Stitch Shop</h1>
              </div>
              <p>Discover a unique blend of creativity and craftsmanship at Stitch Shop - your one stop destination for beautiful stylish garments, elegent floral arrangements and more.</p>
            </Col>
            <Col md={3} sm={5} className='box'>
              <h2>Secure Payment</h2>
              <ul>
                <li>Enjoy a seamless and secure shopping experience with trusted payment gateways and customer protection.</li>
              </ul>
            </Col>
            <Col md={3} sm={5} className='box'>
              <h2>Friendly Customer Support</h2>
              <ul>
                <li>Our team is here to help with your questions, special requests, or order tracking — always with a smile.</li>
              </ul>
            </Col>
            <Col md={3} sm={5} className='box'>
              <h2>Excellent Service</h2>
              <ul>
                <li>At Stitch Shop, we believe every detail matters — from the fabric we choose to the way your order is packaged. We’re more than just a shop — we’re a creative experience you can enjoy from the comfort of your home.</li>
              </ul>
            </Col>
          </Row>
        </Container>
    </footer>
  )
}

export default Footer
