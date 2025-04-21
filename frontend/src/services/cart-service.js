import axios from "axios";
const API_URL = `${process.env.REACT_APP_API_URL}/api/cart`;

class CartService {
  // 獲取購物車內容
  getToken() {
    const token = JSON.parse(localStorage.getItem("user"))?.token;
    if (!token) throw new Error("未登入");
    return token;
  }

  getCart() {
    let token = this.getToken();

    return axios.get(API_URL, {
      headers: {
        Authorization: token,
      },
    });
  }

  // 添加商品到購物車
  addToCart(beanID) {
    let token = this.getToken();

    try {
      return axios.post(
        API_URL,
        { beanID }, // 只需要傳送 beanID
        {
          headers: {
            Authorization: token, // token 會包含用戶信息
          },
        }
      );
    } catch (e) {
      console.error("Add to cart error:", e);
      throw e;
    }
  }

  // 更新購物車商品數量
  updateQuantity(beanID, quantity) {
    let token = this.getToken();

    return axios.put(
      API_URL + `/update/${beanID}`,
      { quantity },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  }

  // 從購物車移除商品
  removeFromCart(beanID) {
    let token = this.getToken();

    return axios.delete(API_URL + `/remove/${beanID}`, {
      headers: {
        Authorization: token,
      },
    });
  }

  // 清空購物車
  clearCart() {
    let token = this.getToken();

    return axios.delete(API_URL + "/clear", {
      headers: {
        Authorization: token,
      },
    });
  }
}

export default new CartService();
