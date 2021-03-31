import {
  ADD_TO_CART,
  CLEAR_CART,
  COUNT_CART_TOTALS,
  REMOVE_CART_ITEM,
  TOGGLE_CART_ITEM_AMOUNT,
} from "../actions";

const cart_reducer = (state, action) => {
  if (action.type === ADD_TO_CART) {
    const { id, amount, product } = action.payload;
    const tempItem = state.cart.find((i) => i.id === id);

    // if item is already in the cart
    if (tempItem) {
    } else {
      const newItem = {
        id,
        name: product.name,
        amount,
        image: product.images[0].url,
        price: product.price,
        max: product.stock, // ensures that users can't toggle the amount button beyond the stock number
      };
      return { ...state, cart: [...state.cart, newItem] };
    }
  }

  throw new Error(`The action type "${action.type}" was not found`);
};

export default cart_reducer;
