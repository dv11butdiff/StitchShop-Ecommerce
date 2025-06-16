import { Fragment, useContext, useEffect, useState } from "react"
import Wrapper from "../components/wrapper/Wrapper"
import Section from "../components/Section"
import { DataContainer } from "../App"
import SliderHome from "../components/Slider"

const Home = () => {
  const { addToCart, allProducts } = useContext(DataContainer);

  const newArrivalData = [...allProducts]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  const discountProducts = [...allProducts]
    .filter(item => parseFloat(item.discount) > 0)
    .sort((a, b) => parseFloat(b.discount) - parseFloat(a.discount));

  const bestSales = [...allProducts]
    .sort((a, b) => b.purchase_quantity - a.purchase_quantity)
    .slice(0, 8);

  useEffect(()=> {
    window.scrollTo(0,0);
  },[])

  return (
    <Fragment>
      <SliderHome/>
      <Wrapper />
      {discountProducts.length > 0 && (
        <Section title="Big Discount" bgColor="#f6f9fc" productItems={discountProducts} addToCart={addToCart}/>
      )}
      {newArrivalData.length > 0 && (
        <Section title="New Arrivals" bgColor="white" productItems={newArrivalData} addToCart={addToCart}/>
      )}
      {bestSales.length > 0 && (
        <Section title="Best Sales" bgColor="#f6f9fc" productItems={bestSales} addToCart={addToCart}/>
      )}
      {allProducts.length === 0 && (
          <div className="flex justify-center items-center h-screen text-lg text-gray-700">
              <p>No products available at the moment.</p>
          </div>
      )}
    </Fragment>
  )
}

export default Home
