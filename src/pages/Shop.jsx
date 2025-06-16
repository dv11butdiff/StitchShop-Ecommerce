import { Col, Container, Row } from "react-bootstrap";
import FilterSelect from "../components/FilterSelect";
import SearchBar from "../components/SeachBar/SearchBar";
import { Fragment, useContext, useEffect, useState } from "react";
import ShopList from "../components/ShopList";
import Banner from "../components/Banner/Banner";
import { DataContainer } from "../App";
import useData from "../utils/dataUtil";
import { toast } from "react-toastify";

const Shop = () => {
  const { addToCart, allProducts } = useContext(DataContainer);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (allProducts) {
      setDisplayedProducts(allProducts);
    } else {
      toast.error("Failed to load products. Please try again.");
    }
  }, [allProducts]);

  useEffect(() => {
    let filteredAndSearchedProducts = allProducts;

    if (selectedCategory) {
      filteredAndSearchedProducts = filteredAndSearchedProducts.filter(
        (item) => item.category_name === selectedCategory
      );
    }

    if (searchTerm) {
      filteredAndSearchedProducts = filteredAndSearchedProducts.filter((item) =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setDisplayedProducts(filteredAndSearchedProducts);
  }, [selectedCategory, searchTerm, allProducts]);

  return (
    <Fragment>
      <Banner title="product" />
      <section className="filter-bar">
        <Container className="filter-bar-contianer">
          <Row className="justify-content-center">
            <Col md={4}>
              <FilterSelect setSelectedCategory={setSelectedCategory} />
            </Col>
            <Col md={8}>
              <SearchBar setSearchTerm={setSearchTerm} />
            </Col>
          </Row>
        </Container>
        <Container>
          <ShopList productItems={displayedProducts} addToCart={addToCart} />
        </Container>
      </section>
    </Fragment>
  );
};

export default Shop;
