import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CartService from "../services/cart-service";
import AuthService from "../services/auth-service";
import axios from "axios";
import "../css/productDetail.css";
import { useCart } from "../context/CartContext";
import Message from "./common/message";

const ProductDetailComponent = ({ currentUser, setCurrentUser }) => {
  const { beanId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [beanData, setBeanData] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const { updateCartItemCount } = useCart();

  useEffect(() => {
    const loadBeanData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/beans/public/${beanId}`
        );
        setBeanData(response.data);
        setLoading(false);
      } catch (error) {
        setMessage("載入商品資料失敗");
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 2000);
        setLoading(false);
      }
    };
    loadBeanData();
  }, [beanId]);

  const handleAddToCart = async () => {
    try {
      if (!currentUser) {
        setMessage("請先登入");
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
          navigate("/login");
        }, 2000);
        return;
      }
      if (currentUser.user.role === "store") {
        setMessage("商家無法使用此功能，請使用一般帳號登入");
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
          navigate("/login");
        }, 2000);
        AuthService.logout();
        setCurrentUser(null);
        return;
      }

      const response = await CartService.addToCart(beanId);
      if (response.data) {
        setMessage("成功加入購物車！");
        setMessageType("success");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
          navigate("/products");
        }, 2000);

        try {
          const cartResponse = await CartService.getCart();
          const total = cartResponse.data.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          updateCartItemCount(total);
        } catch (error) {
          console.error("更新購物車數量失敗:", error);
          setMessage("更新購物車數量失敗");
          setMessageType("error");
          setTimeout(() => {
            setMessage("");
            setMessageType("");
          }, 2000);
        }
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setMessage(error.response.data.message);
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 2000);
      } else {
        setMessage("加入購物車失敗，請稍後再試");
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 2000);
      }
    }
  };

  if (loading) {
    return <div className="productDetail__loading">載入中...</div>;
  }

  return (
    <div className="productDetail">
      <div className="productDetail__card">
        <div className="productDetail__main">
          <div className="productDetail__image-container">
            <img
              src={`${process.env.REACT_APP_API_URL}${beanData.image}`}
              alt={beanData.title}
              className="productDetail__image"
            />
          </div>
          <div className="productDetail__content">
            <div className="productDetail__header">
              <div className="productDetail__title-wrapper">
                <div className="productDetail__title">{beanData.title}</div>
                <div className="productDetail__title productDetail__price">
                  $ {beanData.price}
                </div>
              </div>
              <div className="productDetail__store">
                <span className="productDetail__store-name">
                  店家：{beanData.store?.username || "未知店家"}
                </span>
                <span className="productDetail__sales">
                  已售出：{beanData.customers?.length || 0} 件
                </span>
              </div>
            </div>
            <div className="productDetail__info-grid">
              <div className="productDetail__info-item">
                <i className="fas fa-weight productDetail__info-icon"></i>
                <span className="productDetail__info-label">重量</span>
                <span className="productDetail__info-value">
                  {beanData.weight}g
                </span>
              </div>

              <div className="productDetail__info-item">
                <i className="fas fa-seedling productDetail__info-icon"></i>
                <span className="productDetail__info-label">品種</span>
                <span className="productDetail__info-value">
                  {beanData.cultivar}
                </span>
              </div>

              <div className="productDetail__info-item">
                <i className="fas fa-mortar-pestle productDetail__info-icon"></i>
                <span className="productDetail__info-label">處理法</span>
                <span className="productDetail__info-value">
                  {beanData.processing}
                </span>
              </div>

              <div className="productDetail__info-item">
                <i className="fas fa-fire productDetail__info-icon"></i>
                <span className="productDetail__info-label">烘焙程度</span>
                <span className="productDetail__info-value">
                  {beanData.roast}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="productDetail__description">
          <h3 className="productDetail__description-title">商品描述</h3>
          <p className="productDetail__description-text">
            {beanData.description}
          </p>
        </div>

        <div className="productDetail__actions">
          {currentUser && currentUser.user.role === "store" ? (
            <button
              className="productDetail__button productDetail__button--login"
              onClick={() => {
                AuthService.logout();
                setCurrentUser(null);
                navigate("/login");
              }}
            >
              使用一般會員登入並購買
            </button>
          ) : (
            <button
              className="productDetail__button productDetail__button--cart"
              onClick={handleAddToCart}
            >
              加入購物車
            </button>
          )}
          <button
            className="productDetail__button productDetail__button--back"
            onClick={() => navigate("/products")}
          >
            返回商品列表
          </button>
        </div>
      </div>
      <Message message={message} type={messageType} />
    </div>
  );
};

export default ProductDetailComponent;
