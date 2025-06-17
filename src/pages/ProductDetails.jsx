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
  const { allProducts, addToCart } = useContext(DataContainer);
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
    setQuantity(Math.max(1, parseInt(event.target.value) || 1));
  };

  const handelAdd = (product, qty) => {
    addToCart(product, qty);
    toast.success("Product has been added to cart!");
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
              />
              <button
                aria-label="Add"
                type="submit"
                className="add"
                onClick={() => handelAdd(selectedProduct, quantity)}
              >
                Add To Cart
              </button>
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