import axios from "axios";

const API_URL = "http://localhost:8080/api/payment";

class PaymentService {
  static async createPayment(cartItems, totalAmount) {
    const response = await axios.post(`${API_URL}/create`, {
      cartItems,
      totalAmount,
      userEmail: localStorage.getItem("userEmail"),
    });
    return response.data;
  }
}

export default PaymentService;
