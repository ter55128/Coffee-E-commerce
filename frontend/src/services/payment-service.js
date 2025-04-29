import axios from "axios";
const API_URL = `${process.env.REACT_APP_API_URL}/api/payment`;

class PaymentService {
  createOrder(cartItems, totalAmount) {
    console.log("收到訂單資料");
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
}

export default new PaymentService();
