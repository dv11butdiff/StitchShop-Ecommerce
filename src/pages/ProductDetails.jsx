import { Fragment, useContext, useEffect, useState } from "react";
import Banner from "../components/Banner/Banner";
import { DataContainer } from "../App";
import { Col, Container, Row } from "react-bootstrap";
import ShopList from "../components/ShopList";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ProductDetails = () => {
  const [listSelected, setListSelected] = useState("desc");
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { allProducts, addToCart, UserInfo } = useContext(DataContainer);
  const { id } = useParams();

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const storedProduct = localStorage.getItem(`selectedProduct-${id}`);
    
    if (!selectedProduct && storedProduct) {
      try {
        setSelectedProduct(JSON.parse(storedProduct));
      } catch (e) {
        console.error("Error parsing stored product:", e);
      }
    }
  }, [id, selectedProduct]);

  const formatToPHP = (amount) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);

  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (event) => {
    const value = event.target.value;
    // Get max from selectedProduct, default to 1 if null/undefined/0 to prevent issues
    const maxAllowedQuantity = selectedProduct?.stock_quantity > 0 ? selectedProduct.stock_quantity : 1;

    if (value === '' || isNaN(value)) {
      setQuantity('');
    } else {
      let newQuantity = parseInt(value, 10);
      if (newQuantity < 1) {
        newQuantity = 1;
      } else if (newQuantity > maxAllowedQuantity) {
        newQuantity = maxAllowedQuantity;
        toast.dismiss();
        toast.warn(`Maximum quantity for this product is ${maxAllowedQuantity}`);
      }
      setQuantity(newQuantity);
    }
    console.log("Quantity Change: ", value);
  };

  const handelAdd = (product, qty) => {
    // Only proceed if product and a valid quantity exist
    console.log("Product: ", product.stock_quantity)
    if (!product || product.stock_quantity === null || product.stock_quantity === 0 || typeof product.stock_quantity === 'undefined') {
      toast.dismiss();
      toast.error("This product is currently out of stock.");
      return; // Stop the function if product is not available
    }

    addToCart(product, qty);  
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    if (selectedProduct && allProducts && allProducts.length > 0) {
      const prod = allProducts.filter(
          (item) =>
            item.category_name === selectedProduct.category_name &&
            item.product_id !== selectedProduct.product_id
        );
      setRelatedProducts(prod);
    } else {
      setRelatedProducts([]);
    }
  }, [selectedProduct, allProducts]);

  if (!selectedProduct) {
    return <h1 className="not-found">Product details are loading or not found.</h1>;
  }

  // Determine if the add to cart button should be disabled
  const isAddToCartDisabled = selectedProduct?.stock_quantity === null ||
                             selectedProduct?.stock_quantity === 0 ||
                             typeof selectedProduct?.stock_quantity === 'undefined';                         

  return (
    <Fragment>
      <Banner title={selectedProduct?.name} />
      <section className="product-page">
        <Container>
          <Row className="justify-content-center">
            <Col md={6}>
              <img
                loading="lazy"
                src={selectedProduct?.image_url || 'https://placehold.co/400x400?text=No Image'}
                alt={selectedProduct?.name || "Product Image"}
              />
            </Col>
            <Col md={6}>
              <h2>{selectedProduct?.name}</h2>
              <div className="rate">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fa fa-star ${
                        selectedProduct?.reviews && selectedProduct.reviews.length > 0 &&
                        i < Math.floor(selectedProduct.reviews.reduce((acc, curr) => acc + curr.rating, 0) / selectedProduct.reviews.length)
                          ? 'checked'
                          : ''
                      }`}
                    ></i>
                  ))}
                </div>
                <span>{selectedProduct?.reviews ? selectedProduct.reviews.length : 0} Reviews</span>
              </div>
              <div className="info">
                <span className="price">
                  {formatToPHP(selectedProduct?.price)}
                </span>
                <span>Category: {selectedProduct?.category_name}</span>
              </div>
              <p>SKU: {selectedProduct?.sku}</p>
              <p>{selectedProduct?.description}</p>
              <input
                className="qty-input"
                type="number"
                placeholder="Qty"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={selectedProduct?.stock_quantity || 1000}
                disabled={isAddToCartDisabled}
              />
              <button
                aria-label="Add"
                type="submit"
                className="add"
                onClick={() => handelAdd(selectedProduct, quantity)}
                disabled={isAddToCartDisabled}
              >
                Add To Cart
              </button>
              {isAddToCartDisabled && (
                <p style={{ color: 'red', marginTop: '10px' }}>This product is currently out of stock.</p>
              )}
            </Col>
          </Row>
        </Container>
      </section>
      <section className="product-reviews">
        <Container>
          <ul>
            <li
              style={{ color: listSelected === "desc" ? "black" : "#9c9b9b" }}
              onClick={() => setListSelected("desc")}
            >
              Description
            </li>
            <li
              style={{ color: listSelected === "rev" ? "black" : "#9c9b9b" }}
              onClick={() => setListSelected("rev")}
            >
              Reviews ({selectedProduct?.reviews ? selectedProduct.reviews.length : 0})
            </li>
          </ul>
          {listSelected === "desc" ? (
            <p>{selectedProduct?.description}</p>
          ) : (
            <div className="rates">
              {selectedProduct?.reviews && selectedProduct.reviews.length > 0 ? (
                selectedProduct.reviews.map((rate, index) => (
                  <div className="rate-comment" key={index}>
                    <span>Jhon Doe</span>
                    <span>{rate.rating} (rating)</span>
                    <p>{rate.text}</p>
                  </div>
                ))
              ) : (
                <p>No reviews yet.</p>
              )}
            </div>
          )}
        </Container>
      </section>
      <section className="related-products">
        <Container>
          <h3>You might also like</h3>
        </Container>
        {relatedProducts.length > 0 ? (
          <ShopList productItems={relatedProducts} addToCart={addToCart} />
        ) : (
          <p className="not-found">No related products found.</p>
        )}
      </section>
    </Fragment>
  );
};

export default ProductDetails;