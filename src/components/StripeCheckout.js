import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  useStripe,
  Elements,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { useCartContext } from "../context/cart_context";
import { useUserContext } from "../context/user_context";
import { formatPrice } from "../utils/helpers";
import { useHistory } from "react-router-dom";

// load Stripe
const promise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// stripe checkout, states, variabels and styling are as per stripe doc
// https://stripe.com/docs/payments/integration-builder
const CheckoutForm = () => {
  const { cart, total_amount, clearCart } = useCartContext();
  const { myUser } = useUserContext();
  const history = useHistory();

  // stripe states and variables
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState(""); // from netlify servless functions
  const stripe = useStripe(); //invoke Stripe
  const elements = useElements(); // stripe hook

  const cardStyle = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: "Arial, sans-serif",
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#32325d",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  // communicates with stripe and send cart data
  const createPaymentIntent = async () => {
    try {
      const { data } = await axios.post(
        "/.netlify/functions/create-payment-intent",
        JSON.stringify({ cart, total_amount })
      );
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.log(error.response);
    }
  };

  useEffect(() => {
    createPaymentIntent();
    // eslint-disabled-next-line
  }, []);

  // taken from stripe api
  const handleChange = async (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  // taken from stripe api
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setProcessing(true);
    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (payload.error) {
      setError(`Payment failed ${payload.error.message}`);
      setProcessing(false);
    } else {
      // when payment is successful
      setError(null);
      setProcessing(false);
      setSucceeded(true);

      // clears the cart and sends to the home page
      setTimeout(() => {
        clearCart();

        history.push("/");
      }, 7000);
    }
  };

  return (
    <div>
      {succeeded ? (
        <article>
          <h3>Thank you!</h3>
          <h3>Your payment was successful!</h3>
          <h3>Redirecting to the home page shortly</h3>
        </article>
      ) : (
        <article>
          <h3>Hello, {myUser && myUser.name}</h3>
          <p>Your total is {formatPrice(total_amount)}</p>
        </article>
      )}

      {/* setup as per stripe doc */}
      <form id="payment-form" onSubmit={handleSubmit}>
        <CardElement
          id="card-elements"
          options={cardStyle}
          onChange={handleChange}
        />
        <button disabled={processing || disabled || succeeded} id="submit">
          <span id="button-text">
            {processing ? <div className="spinner" id="spinner"></div> : "Pay"}
          </span>
        </button>
        {/* Show any error that happens when processing payment */}
        {error && (
          <div className="card-error" role="alert">
            {error}
          </div>
        )}

        {/* Show success message upon completion */}
        <p className={succeeded ? "result-message" : "result-message hidden"}>
          Payment succeeded.
        </p>
      </form>
    </div>
  );
};

const StripeCheckout = () => {
  return (
    <Container>
      <Elements stripe={promise}>
        <CheckoutForm />
      </Elements>
    </Container>
  );
};

// styling from stripe website
const Container = styled.section`
  display: flex;
  justify-content: center;
  align-content: center;
  padding: 60px;

  /* styling for the messages when payment is successful */
  article {
    h3 {
      margin-bottom: 8px;
    }
    p {
      margin-bottom: 12px;
    }
  }

  /* end of stylin */

  form {
    width: 50vw;
    align-self: center;
    box-shadow: 0px 0px 0px 0.5px rgba(50, 50, 93, 0.1),
      0px 2px 5px 0px rgba(50, 50, 93, 0.1),
      0px 1px 1.5px 0px rgba(0, 0, 0, 0.07);
    border-radius: 7px;
    padding: 40px;
  }

  input {
    border-radius: 6px;
    margin-bottom: 6px;
    padding: 12px;
    border: 1px solid rgba(50, 50, 93, 0.1);
    max-height: 44px;
    font-size: 16px;
    width: 100%;
    background: white;
    box-sizing: border-box;
  }

  .result-message {
    line-height: 22px;
    font-size: 16px;
  }

  .result-message a {
    color: rgb(89, 111, 214);
    font-weight: 600;
    text-decoration: none;
  }

  .hidden {
    display: none;
  }

  #card-error {
    color: rgb(105, 115, 134);
    font-size: 16px;
    line-height: 20px;
    margin-top: 12px;
    text-align: center;
  }

  #card-element {
    border-radius: 4px 4px 0 0;
    padding: 12px;
    border: 1px solid rgba(50, 50, 93, 0.1);
    max-height: 44px;
    width: 100%;
    background: white;
    box-sizing: border-box;
  }

  #payment-request-button {
    margin-bottom: 32px;
  }

  /* Buttons and links */
  button {
    background: #5469d4;
    font-family: Arial, sans-serif;
    color: #ffffff;
    border-radius: 0 0 4px 4px;
    border: 0;
    padding: 12px 16px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: block;
    transition: all 0.2s ease;
    box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
    width: 100%;
  }

  button:hover {
    filter: contrast(115%);
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  /* spinner/processing state, errors */
  .spinner,
  .spinner:before,
  .spinner:after {
    border-radius: 50%;
  }

  .spinner {
    color: #ffffff;
    font-size: 22px;
    text-indent: -99999px;
    margin: 0px auto;
    position: relative;
    width: 20px;
    height: 20px;
    box-shadow: inset 0 0 0 2px;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
  }

  .spinner:before,
  .spinner:after {
    position: absolute;
    content: "";
  }

  .spinner:before {
    width: 10.4px;
    height: 20.4px;
    background: #5469d4;
    border-radius: 20.4px 0 0 20.4px;
    top: -0.2px;
    left: -0.2px;
    -webkit-transform-origin: 10.4px 10.2px;
    transform-origin: 10.4px 10.2px;
    -webkit-animation: loading 2s infinite ease 1.5s;
    animation: loading 2s infinite ease 1.5s;
  }

  .spinner:after {
    width: 10.4px;
    height: 10.2px;
    background: #5469d4;
    border-radius: 0 10.2px 10.2px 0;
    top: -0.1px;
    left: 10.2px;
    -webkit-transform-origin: 0px 10.2px;
    transform-origin: 0px 10.2px;
    -webkit-animation: loading 2s infinite ease;
    animation: loading 2s infinite ease;
  }

  @keyframes loading {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

  @media only screen and (max-width: 600px) {
    form {
      width: 80vw;
    }
  }
`;

export default StripeCheckout;
