import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartService from "../services/cart-service";
import "../css/cart.css";
import { useCart } from "../context/CartContext";
import PaymentService from "../services/payment-service";
import Message from "./common/Message";
import Modal from "./common/Modal";

const CartComponent = ({ currentUser, setCurrentUser }) => {
  const [cartItems, setCartItems] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState({ title: "", _id: "" });
  const navigate = useNavigate();
  const { updateCartItemCount } = useCart();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
    if (currentUser.user.role !== "customer") {
      navigate("/");
    }

    loadCart();
  }, [currentUser, navigate]);

  const loadCart = async () => {
    try {
      const response = await CartService.getCart();
      setCartItems(response.data);
      setLoading(false);
    } catch (err) {
      setMessage("獲取購物車失敗");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2000);
      setLoading(false);
    }
  };

  const handletominus = async (beanID) => {
    try {
      // 找到當前商品
      const currentItem = cartItems.items.find(
        (item) => item.beanID._id === beanID._id
      );

      if (currentItem.quantity === 1) {
        setIsModalOpen(true);
        setCurrentItem({
          title: currentItem.beanID.title,
          _id: currentItem.beanID._id,
        });
      } else {
        // 數量大於1，減少數量
        await CartService.updateQuantity(beanID._id, currentItem.quantity - 1);
      }
      await loadCart();
    } catch (err) {
      setMessage("減少數量失敗，請稍後再試");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2000);
    }
  };
  const handletoplus = async (beanID) => {
    try {
      // 找到當前商品
      const currentItem = cartItems.items.find(
        (item) => item.beanID._id === beanID._id
      );

      await CartService.updateQuantity(beanID._id, currentItem.quantity + 1);

      await loadCart();
    } catch (err) {
      setMessage("增加數量失敗，請稍後再試");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2000);
    }
  };

  const handleRemoveItem = async (beanID) => {
    try {
      await CartService.removeFromCart(beanID);
      await loadCart();
      setIsModalOpen(false);
      setMessage("商品已移除");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2000);
    } catch (err) {
      setIsModalOpen(false);
      setMessage("移除商品失敗");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2000);
    }
  };

  const calculateTotal = () => {
    return cartItems.items.reduce((total, item) => {
      return total + item.beanID.price * item.quantity;
    }, 0);
  };

  const calculateTotalQuantity = () => {
    const count = cartItems.items.reduce((total, item) => {
      return total + item.quantity;
    }, 0);
    // 更新購物車計數器
    updateCartItemCount(count);
    return count;
  };

  // 在載入購物車和更新後都調用
  useEffect(() => {
    if (cartItems.items.length > 0) {
      calculateTotalQuantity();
    } else {
      updateCartItemCount(0);
    }
  }, [cartItems, updateCartItemCount]);

  const handleCheckout = async () => {
    try {
      const paymentData = await PaymentService.createPayment(
        cartItems.items,
        calculateTotal()
      );

      // 創建並提交表單到藍新金流
      const form = document.createElement("form");
      form.method = "post";
      form.action = paymentData.paymentUrl;

      for (let key in paymentData.paymentFormData) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = paymentData.paymentFormData[key];
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("結帳失敗:", error);
      window.alert("結帳過程發生錯誤，請稍後再試");
    }
  };

  if (loading) {
    return <div>載入中...</div>;
  }

  return (
    <div className="cart">
      <h2 className="cart__title">購物車</h2>
      {cartItems.items.length === 0 ? (
        <div className="cart__empty">
          <p>購物車是空的</p>
        </div>
      ) : (
        <div className="row cart__row">
          {cartItems.items.map((item) => (
            <div
              key={item.beanID._id}
              className="col-lg-3 col-md-4 col-sm-6 mb-3"
            >
              <div className="cart__product-card">
                <div className="cart__product-card__image-container">
                  <img
                    src={`${process.env.REACT_APP_API_URL}${item.beanID.image}`}
                    alt={item.beanID.title}
                    className="cart__product-card__image"
                    onClick={() => navigate(`/products/${item.beanID._id}`)}
                    onError={(e) => {
                      e.target.src = "/default-bean.jpg";
                      e.target.onerror = null;
                    }}
                  />
                </div>
                <div className="cart__product-card__body">
                  <h5
                    className="cart__product-card__title"
                    onClick={() => navigate(`/products/${item.beanID._id}`)}
                  >
                    {item.beanID.title} {item.beanID.weight}g
                  </h5>
                  <span className="cart__product-card__store">
                    {item.beanID.store.username}
                  </span>
                  <div className="cart__quantity">
                    <div className="cart__quantity__controls">
                      <button
                        className="cart__quantity__button"
                        onClick={() => handletominus(item.beanID)}
                        disabled={loading}
                      >
                        -
                      </button>
                      <span className="cart__quantity__display">
                        {item.quantity}
                      </span>
                      <button
                        className="cart__quantity__button"
                        onClick={() => handletoplus(item.beanID)}
                        disabled={loading}
                      >
                        +
                      </button>
                    </div>
                    <p className="cart__product-card__price">
                      $ {item.beanID.price}
                    </p>
                  </div>

                  <button
                    className="cart__product-card__remove"
                    onClick={() => {
                      setIsModalOpen(true);
                      setCurrentItem({
                        title: item.beanID.title,
                        _id: item.beanID._id,
                      });
                    }}
                  >
                    移除商品
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {cartItems.items.length > 0 && (
        <div className="cart__summary">
          <div className="cart__summary__content">
            <div className="cart__summary__info">
              <span className="cart__summary__label">總件數：</span>
              <span className="cart__summary__value">
                {calculateTotalQuantity()} 件
              </span>
            </div>
            <div className="cart__summary__info">
              <span className="cart__summary__label">商品總額：</span>
              <span className="cart__summary__value cart__summary__value--price">
                $ {calculateTotal()}
              </span>
            </div>
            <button
              className="cart__summary__checkout"
              onClick={handleCheckout}
            >
              前往結帳
            </button>
          </div>
        </div>
      )}
      {message && <Message message={message} type={messageType} />}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={`是否要將 ${currentItem.title} 從購物車中移除？`}
        onConfirm={() => handleRemoveItem(currentItem._id)}
        onCancel={() => setIsModalOpen(false)}
        confirmText="確定"
        cancelText="取消"
      />
    </div>
  );
};

export default CartComponent;
