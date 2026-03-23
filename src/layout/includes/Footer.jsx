import React from 'react'
import { Container, Row, Col } from 'react-bootstrap';

function Footer() {
  return (
    <div>
       <footer className="bg-light text-muted py-5 border-top">
      <Container>
        {/* Footer Columns */}
        <Row>
          <Col xs={6} md={2}>
            <h6 className="text-uppercase font-weight-bold">Buy</h6>
            <ul className="list-unstyled">
              <li><p href="#">Registration</p></li>
              <li><p href="#">eBay Money Back Guarantee</p></li>
              <li><p href="#">Bidding & buying help</p></li>
              <li><p href="#">Stores</p></li>
            </ul>
          </Col>

          <Col xs={6} md={2}>
            <h6 className="text-uppercase font-weight-bold">Sell</h6>
            <ul className="list-unstyled">
              <li><p href="#">Start selling</p></li>
              <li><p href="#">Learn to sell</p></li>
              <li><p href="#">Affiliates</p></li>
            </ul>
          </Col>

          <Col xs={6} md={2}>
            <h6 className="text-uppercase font-weight-bold">Tools & Apps</h6>
            <ul className="list-unstyled">
              <li><p href="#">Developers</p></li>
              <li><p href="#">Security Center</p></li>
              <li><p href="#">Site Map</p></li>
            </ul>
          </Col>

          <Col xs={6} md={2}>
            <h6 className="text-uppercase font-weight-bold">Stay Connected</h6>
            <ul className="list-unstyled">
              <li><p href="#">eBay's Blogs</p></li>
              <li><p href="#">Facebook</p></li>
              <li><p href="#">Twitter</p></li>
            </ul>
          </Col>

          <Col xs={6} md={2}>
            <h6 className="text-uppercase font-weight-bold">About eBay</h6>
            <ul className="list-unstyled">
              <li><p href="#">Company Info</p></li>
              <li><p href="#">Careers</p></li>
              <li><p href="#">Policies</p></li>
              <li><p href="#">Investors</p></li>
            </ul>
          </Col>

          <Col xs={6} md={2}>
            <h6 className="text-uppercase font-weight-bold">Help & Contact</h6>
            <ul className="list-unstyled">
              <li><p href="#">Seller Information Center</p></li>
              <li><p href="#">Contact Us</p></li>
            </ul>
          </Col>
        </Row>

        {/* Footer Bottom Section */}
        <Row className="mt-4 pt-3 border-top">
          <Col md={6}>
            <p>&copy; 1995-2024 eBay Inc. All Rights Reserved.</p>
            <ul className="list-inline">
              <li className="list-inline-item"><p href="#">Accessibility</p></li>
              <li className="list-inline-item"><p href="#">User Agreement</p></li>
              <li className="list-inline-item"><p href="#">Privacy</p></li>
              <li className="list-inline-item"><p href="#">Cookies</p></li>
              <li className="list-inline-item"><p href="#">Payments Terms of Use</p></li>
            </ul>
          </Col>
          <Col md={6} className="text-md-right">
            <p href="#" className="mr-2">AdChoice</p>
            <select className="custom-select d-inline-block w-auto">
              <option value="united-states">United States</option>
              {/* Add more countries if needed */}
            </select>
          </Col>
        </Row>
      </Container>
    </footer>
    </div>
  )
}

export default Footer