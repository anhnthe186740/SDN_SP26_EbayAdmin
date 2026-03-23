import React, { useContext, useState, useEffect } from "react";
import { ProductsContext } from "../contexts/ProductsContext";
import { CartContext } from "../contexts/CartContext";
import { useParams, Link } from "react-router-dom";
import { Card, Button, Form } from "react-bootstrap";

function ProductDetail() {
  const { products } = useContext(ProductsContext);
  const { id } = useParams();
  const product = products.find((prod) => prod.id === parseInt(id));
  const { addToCart } = useContext(CartContext);
  const [quantity, setQuantity] = useState(1);
  const [ selectedImage, setSelectedImage ] = useState(product.images[0]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!product) {
    return <h2>Product not found</h2>;
  }

  const handleQuantityChange = (e) => {
    const value = Math.max(1, Math.min(e.target.value, product.stock || 10));
    setQuantity(value);
  };

  const handleAddToCart = () => {
    addToCart(product, parseInt(quantity));
    alert(`${quantity} item(s) added to cart!`);
  };

  return (
    <div className="container mt-4">
  <div className="row">

    <div className="col-md-6">
      <div className="mb-4 d-flex justify-content-center">
      <div className="justify-content-center">
        {product.images.map((image, idx) => (
          <Button
            key={idx}
            variant="light"
            onClick={() => setSelectedImage(image)}
            className="m-1 p-0 rounded"
          >
            <img
              src={image}
              alt={`${product.title} ${idx}`}
              className="img-thumbnail"
              style={{
                width: "90px",
                height: "90px",
                border: selectedImage === image ? "2px solid grey" : "none",
              }}
            />
          </Button>
        ))}
      </div>
        <img
          src={selectedImage}
          alt={product.title}
          className="img-fluid border rounded shadow-sm"
          style={{ maxWidth: "80%" }}
        />
      </div>
      <div className="mt-4">
        <h4 className="mb-3">Reviews</h4>
        {product.reviews && product.reviews.length > 0 ? (
          product.reviews.map((review, idx) => (
            <Card key={idx} className="mb-3">
              <Card.Body>
                <Card.Title>
                  <strong>{review.reviewerName}</strong> ({review.rating}⭐)
                </Card.Title>
                <Card.Text>{review.comment}</Card.Text>
                <Card.Footer className="text-muted">
                  {new Date(review.date).toLocaleDateString()}
                </Card.Footer>
              </Card.Body>
            </Card>
          ))
        ) : (
          <p>No reviews yet.</p>
        )}
      </div>
    </div>

    {/* Right Column */}
    <div className="col-md-6">
      <div className="mb-3">
        <h2 className="fw-bold">{product.title}</h2>
        <Card.Text>
                  <strong>SKU: </strong>{product.sku}
                </Card.Text>
        <h3 style={{ color: "green", fontWeight: "bold" }}>
          ${product.price}
        </h3>
      </div>
      
      <p>
        <strong>Description:</strong> {product.description}
      </p>
      <p>
        <strong>Brand:</strong> {product.brand}
      </p>
      <p>
        <strong>Category:</strong> {product.category}
      </p>
      <p>
        <strong>Tags:</strong> {product.tags.join(", ")}
      </p>
      <p>
        <strong>Dimensions:</strong> {product.dimensions.width } x {product.dimensions.height} x {product.dimensions.depth}
      </p>
      <p>
        <strong>Rating:</strong> {product.rating}⭐
      </p>
      <p>
        <strong>Stock:</strong>{" "}
        <span
          className={`fw-bold ${
            product.stock > 0 ? "text-success" : "text-danger"
          }`}
        >
          {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
        </span>
      </p>

      {/* Add to Cart Section */}
      <div className="p-3 border rounded bg-light">
        <Form.Group controlId="quantity" className="mb-3">
          <Form.Label className="fw-bold">Quantity:</Form.Label>
          <Form.Control
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
            max={product.stock || 10}
            style={{ width: "100px", display: "inline-block" }}
          />
        </Form.Group>
        <Button
          as={Link}
          to={`/cart`}
          variant="primary"
          className="w-100"
          onClick={handleAddToCart}
          disabled={product.stock < 1}
        >
          Add to Cart
        </Button>
      </div>

      {/* Reviews Section */}
      <div className="mt-4">
        {/* <h4 className="mb-3"></h4> */}
        
     
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>
                  <strong>{product.warrantyInformation}</strong> 
                </Card.Title>
                <Card.Text>{product.shippingInformation}</Card.Text>
                <Card.Text>
                  {product.availabilityStatus}
                </Card.Text>
              </Card.Body>
            </Card>
      
        
          {/* <p>No reviews yet.</p> */}
       
      </div>
    </div>
  </div>
</div>

  );
}

export default ProductDetail;
