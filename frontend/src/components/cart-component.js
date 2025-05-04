import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartService from "../services/cart-service";
import "../css/cart.css";
import { useCart } from "../context/CartContext";
import Message from "./common/Message";
import Modal from "./common/Modal";
import PaymentService from "../services/payment-service";

const CartComponent = ({ currentUser, setCurrentUser }) => {
  const [cartItems, setCartItems] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [currentItem, setCurrentItem] = useState({ title: "", _id: "" });
  const navigate = useNavigate();
  const { updateCartItemCount } = useCart();
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [tempQuantity, setTempQuantity] = useState("");

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
      console.log(response.data);
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
        openModal("remove", {
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

  const handleQuantityChange = async (beanID, value) => {
    // 先更新臨時輸入值
    setTempQuantity(value);

    // 如果是空值，直接返回
    if (value === "") return;

    const quantity = parseInt(value);

    // 驗證數量
    if (isNaN(quantity) || quantity < 1) {
      setMessage("請輸入有效的數量");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2000);
      return;
    }

    try {
      await CartService.updateQuantity(beanID._id, quantity);
      await loadCart();
    } catch (err) {
      setMessage("更新數量失敗，請稍後再試");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2000);
    }
  };

  const handleQuantityFocus = (item) => {
    setEditingQuantity(item.beanID._id);
    setTempQuantity(item.quantity.toString());
  };

  const handleQuantityBlur = () => {
    setEditingQuantity(null);
    setTempQuantity("");
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
    updateCartItemCount(count);
    return count;
  };

  useEffect(() => {
    if (cartItems.items.length > 0) {
      calculateTotalQuantity();
    } else {
      updateCartItemCount(0);
    }
  }, [cartItems, updateCartItemCount]);

  const openModal = (type, item = null) => {
    setModalType(type);
    if (item) {
      setCurrentItem(item);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(null);
    setCurrentItem({ title: "", _id: "" });
  };

  const handleCheckout = () => {
    openModal("checkout");
  };

  const processCheckout = async () => {
    try {
      console.log(cartItems);
      const response = await PaymentService.createOrder(
        cartItems.items,
        calculateTotal()
      );
      try {
        const response = await CartService.clearCart(currentUser.user._id);
        console.log("清空購物車", response);
      } catch (e) {
        console.error("清空購物車失敗:", e);
      }

      const { paymentFormData, paymentUrl } = response.data;
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl;
      form.style.display = "none";

      Object.entries(paymentFormData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("結帳失敗:", error);
      setMessage("結帳過程發生錯誤，請稍後再試");
      setMessageType("error");
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
                        className="cart__quantity__button cart__quantity__button--minus"
                        onClick={() => handletominus(item.beanID)}
                        disabled={loading}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        className="cart__quantity__display"
                        value={
                          editingQuantity === item.beanID._id
                            ? tempQuantity
                            : item.quantity
                        }
                        onFocus={() => handleQuantityFocus(item)}
                        onBlur={handleQuantityBlur}
                        onChange={(e) =>
                          handleQuantityChange(item.beanID, e.target.value)
                        }
                      />
                      <button
                        className="cart__quantity__button cart__quantity__button--plus"
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
                      openModal("remove", {
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
      <div className="cart__test-list-container">
        <ul className="cart__test-list-title">
          金流串接測試網站之規範
          <li className="cart__test-list">
            1. 目前提供測試之付款服務為 WebATM、Apple Pay、Google Pay、Samsung
            Pay{" "}
          </li>
          <li className="cart__test-list">2. WebATM 僅支援華南銀行</li>
          <li className="cart__test-list">
            3. Apple Pay 請使用真實之信用卡號，至 Apple 裝置上進行綁定與支付測試
          </li>
          <li className="cart__test-list">
            4. Google Pay 請使用真實之信用卡號，至 Android
            裝置上進行綁定與支付測試
          </li>
          <li className="cart__test-list">
            5. Samsung Pay 請使用真實之信用卡號，至 Samsung
            裝置上進行綁定與支付測試
          </li>
          <li className="cart__test-list">
            6. 測試過WebATM、Apple Pay 功能均可正常使用，Google Pay、Samsung Pay
            若有問題，請聯繫 linkuanhan8811@gmail.com ，謝謝！
          </li>
          <li className="cart__test-list">
            7.
            提醒！測試區「不會真的收款」！但為確保您的權益及避免使用此支付工具付款所生之所有爭議款項，商品建議使用「購物車測試專用」($1)，再進行後續服務
          </li>
        </ul>
      </div>
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
              onClick={processCheckout}
            >
              前往結帳
            </button>
          </div>
        </div>
      )}
      {message && <Message message={message} type={messageType} />}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        message={`是否要將 ${currentItem.title} 從購物車中移除？`}
        onConfirm={() => handleRemoveItem(currentItem._id)}
        onCancel={closeModal}
        confirmText="確定"
        cancelText="取消"
      />
    </div>
  );
};

export default CartComponent;
