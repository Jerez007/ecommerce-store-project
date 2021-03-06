import React, { useContext, useEffect, useReducer } from "react";
import reducer from "../reducers/products_reducer";
import axios from "axios";
import {
  TOGGLE_SIDEBAR,
  GET_PRODUCTS_START,
  GET_PRODUCTS_SUCCESS,
  GET_PRODUCTS_ERROR,
  GET_SINGLE_PRODUCT_START,
  GET_SINGLE_PRODUCT_SUCCESS,
  GET_SINGLE_PRODUCT_ERROR,
  GET_PRODUCT_REVIEWS_START,
  GET_PRODUCT_REVIEWS_SUCCESS,
  GET_PRODUCT_REVIEWS_ERROR,
} from "../actions";
import { products_url as url } from "../utils/constants";


const initialState = {
  isSidebarOpen: false,
  products: [],
  featured_products: [],
  products_loading: false,
  products_error: false,
  single_product_loading: false,
  single_product_error: false,
  single_product: {},
  product_reviews_loading: false,
  product_reviews_error: false,
  product_reviews: [],

};

const ProductsContext = React.createContext();

export const ProductsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // toggles the sidebar on smaller screens
  const toggleSidebar = () => {
    dispatch({ type: TOGGLE_SIDEBAR });
  };

  // gets the products
  const fetchProducts = async (url) => {
    dispatch({ type: GET_PRODUCTS_START });
    try {
      const response = await axios.get(url);

      const products = response.data;
      dispatch({ type: GET_PRODUCTS_SUCCESS, payload: products });
    } catch (error) {
      dispatch({ type: GET_PRODUCTS_ERROR });
    }
  };

  // gets a single product
  const fetchSingleProduct = async (url) => {
    dispatch({ type: GET_SINGLE_PRODUCT_START });

    try {
      const response = await axios.get(url);
      const singleProduct = response.data;
      dispatch({ type: GET_SINGLE_PRODUCT_SUCCESS, payload: singleProduct });
    } catch (error) {
      dispatch({ type: GET_SINGLE_PRODUCT_ERROR });
    }
  };

  // gets reviews for a single product from the database
  const fetchProductReviews = async (url, id) => {
    dispatch({ type: GET_PRODUCT_REVIEWS_START})

    try {
      const response = await axios.get(process.env.REACT_APP_SERVER_URL);
      const reviews = response.data
      dispatch({type: GET_PRODUCT_REVIEWS_SUCCESS, payload: reviews})
    } catch (error) {
      dispatch({ type: GET_PRODUCT_REVIEWS_ERROR})
    }
  }

  //gets the products at initial render only
  useEffect(() => {
    fetchProducts(url);
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        ...state,
        toggleSidebar,
        fetchSingleProduct,
        fetchProductReviews,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProductsContext = () => {
  return useContext(ProductsContext);
};
