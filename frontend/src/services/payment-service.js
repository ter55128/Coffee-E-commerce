import axios from "axios";
const API_URL = `${process.env.REACT_APP_API_URL}/api/payment`;

class PaymentService {
  createOrder(cartItems, totalAmount) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }
    console.log(cartItems, totalAmount);
    return axios.post(
      `${API_URL}/createOrder`,
      {
        cartItems,
        totalAmount,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }
  getOrders(userId) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
    } else {
      token = "";
    }
    return axios.get(`${API_URL}/orders/${userId}`, {
      headers: {
        Authorization: token,
      },
    });
  }
  continuePayment(orderId) {
    let token;
    if (localStorage.getItem("user")) {
      token = JSON.parse(localStorage.getItem("user")).token;
      console.log("token", token);
    } else {
      token = "";
    }
    return axios.post(
      `${API_URL}/continuePayment`,
      {
        orderId,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }
}

export default new PaymentService();
