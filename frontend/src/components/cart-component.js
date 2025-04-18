import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CartService from "../services/cart-service";
import "../css/cart.css";
import { useCart } from "../context/CartContext";

const CartComponent = ({ currentUser, setCurrentUser }) => {
  const [cartItems, setCartItems] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
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
      setMessage("獲取購物車失敗: " + err.response?.data?.message);
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
        const isConfirmed = window.confirm(
          `是否要將 ${currentItem.beanID.title} 從購物車中移除？`
        );
        if (isConfirmed) {
          await CartService.removeFromCart(beanID._id);
        } else {
          return;
        }
      } else {
        // 數量大於1，減少數量
        await CartService.updateQuantity(beanID._id, currentItem.quantity - 1);
      }

      await loadCart();
      setMessage("數量更新成功");
    } catch (err) {
      console.error("更新失敗:", err);
      setMessage("減少數量失敗: " + err.response?.data?.message);
    }
  };
  const handletoplus = async (beanID) => {
    try {
      // 找到當前商品
      const currentItem = cartItems.items.find(
        (item) => item.beanID._id === beanID._id
      );

      // 數量大於1，增加數量
      await CartService.updateQuantity(beanID._id, currentItem.quantity + 1);

      await loadCart();
      setMessage("數量更新成功");
    } catch (err) {
      console.error("更新失敗:", err);
      setMessage("增加數量失敗: " + err.response?.data?.message);
    }
  };

  const handleRemoveItem = async (beanID) => {
    try {
      // 找到當前商品
      const currentItem = cartItems.items.find(
        (item) => item.beanID._id === beanID._id
      );

      // 詢問是否確定要移除商品
      const isConfirmed = window.confirm(
        `確定要將 ${currentItem.beanID.title} 從購物車中移除嗎？`
      );

      if (!isConfirmed) {
        return; // 如果用戶取消，則不進行任何操作
      }

      await CartService.removeFromCart(beanID._id);
      await loadCart();
      setMessage("商品已移除");
    } catch (err) {
      setMessage("移除商品失敗: " + err.response?.data?.message);
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
                    src={`http://localhost:8080${item.beanID.image}`}
                    alt={item.beanID.title}
                    className="cart__product-card__image"
                    onClick={() => navigate(`/beandetail/${item.beanID._id}`)}
                    onError={(e) => {
                      e.target.src = "/default-bean.jpg";
                      e.target.onerror = null;
                    }}
                  />
                </div>
                <div className="cart__product-card__body">
                  <h5 className="cart__product-card__title">
                    {item.beanID.title} {item.beanID.weight}g
                  </h5>
                  <span className="cart__product-card__store">
                    {item.beanID.store.username}
                  </span>
                  <div className="quantity">
                    <div className="quantity__controls">
                      <button
                        className="quantity__button"
                        onClick={() => handletominus(item.beanID)}
                        disabled={loading}
                      >
                        -
                      </button>
                      <span className="quantity__display">{item.quantity}</span>
                      <button
                        className="quantity__button"
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
                    onClick={() => handleRemoveItem(item.beanID)}
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
        <div className="summary">
          <div className="summary__content">
            <div className="summary__info">
              <span className="summary__label">總件數：</span>
              <span className="summary__value">
                {calculateTotalQuantity()} 件
              </span>
            </div>
            <div className="summary__info">
              <span className="summary__label">商品總額：</span>
              <span className="summary__value summary__value--price">
                $ {calculateTotal()}
              </span>
            </div>
            <button
              className="summary__checkout"
              onClick={() => window.alert("金流串接還在研究中 ...")}
            >
              前往結帳
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartComponent;
