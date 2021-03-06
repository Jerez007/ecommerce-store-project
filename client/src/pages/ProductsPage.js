import React, { useEffect } from "react";
import styled from "styled-components";
import { ProductHero, Filters, Sort, ProductList } from "../components";

const ProductsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <ProductHero title="products" />
      <Container>
        <div className="products">
          <Filters/>

          <div>
            <Sort/>
            <ProductList />
          </div>
        </div>
      </Container>
    </main>
  );
};

const Container = styled.div`
  margin-bottom: 100px;
  
`;

export default ProductsPage;
