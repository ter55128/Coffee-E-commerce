import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/orderDetail.css";
import AuthService from "../services/auth-service";
import BeansService from "../services/beans-service";
import PaymentService from "../services/payment-service";
import Message from "./common/Message";

const OrderDetailComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderDetail = location.state?.orderDetail;
  const [currentUser, setCurrentUser] = useState(AuthService.getCurrentUser());
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [beans, setBeans] = useState(orderDetail?.items || []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleContinuePayment = async () => {
    try {
      const response = await PaymentService.continuePayment(orderDetail._id);
      console.log("繼續付款", response);
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
      console.error("繼續付款錯誤:", error);
      setMessage(error.response.data.error);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
        navigate("/orders");
      }, 2000);
    }
  };

  useEffect(() => {
    if (!currentUser || !orderDetail) {
      setMessage("請先登入");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
        navigate("/login");
      }, 2000);
      return;
    }
    setBeans(orderDetail.items || []);
  }, [currentUser, orderDetail, navigate]);

  if (!orderDetail) {
    return (
      <div>
        <Message message={message} type={messageType} />
      </div>
    );
  }

  return (
    <div className="orderDetail">
      <div className="orderDetail__container">
        <h2 className="orderDetail__title">訂單詳細資料</h2>

        <div className="orderDetail-header">
          <button
            className="orderDetail-header__back-button"
            onClick={() => navigate("/orders")}
          >
            返回訂單列表
          </button>
          <div className="orderDetail-status-container">
            <div
              className={`orderDetail-status ${
                orderDetail.status === "paid"
                  ? "orderDetail-paid"
                  : "orderDetail-unpaid"
              }`}
            >
              {orderDetail.status === "paid"
                ? "已付款"
                : orderDetail.status === "cancelled"
                ? "已取消"
                : "未付款"}
            </div>
            {orderDetail.status === "pending" && (
              <button
                className="orderDetail-continue-button"
                onClick={handleContinuePayment}
              >
                繼續付款
              </button>
            )}
          </div>
        </div>

        <div className="orderDetail-info__section">
          <h3 className="orderDetail-info__title">付款資訊</h3>
          <div className="orderDetail-info__grid">
            <div className="orderDetail-info__item">
              <span className="orderDetail-info__label">訂單編號：</span>
              <span>{orderDetail.orderNumber}</span>
            </div>
            <div className="orderDetail-info__item">
              <span className="orderDetail-info__label">更新時間：</span>
              <span>{formatDate(orderDetail.updatedAt)}</span>
            </div>
            <div className="orderDetail-info__item">
              <span className="orderDetail-info__label">付款方式：</span>
              <span>{orderDetail.paymentType || "尚未付款"}</span>
            </div>
            <div className="orderDetail-info__item">
              <span className="orderDetail-info__label">交易編號：</span>
              <span>{orderDetail.tradeNo || "尚未產生"}</span>
            </div>
          </div>
        </div>

        <div className="orderDetail-items__list">
          <h3>訂購商品</h3>
          {beans &&
            beans.map((bean) => (
              <div key={bean._id} className="orderDetail-items__card">
                <div className="orderDetail-items__image-container">
                  <img
                    className="orderDetail-items__image"
                    src={bean.image}
                    alt={bean.name}
                  />
                </div>
                <div className="orderDetail-items__info">
                  <h4 className="orderDetail-items__title">{bean.title}</h4>
                  <div className="orderDetail-items__store">
                    {bean.store.username}
                  </div>
                  <div className="orderDetail-items__details">
                    <span>數量: {bean.quantity}</span>
                    <span>${bean.price}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="orderDetail-summary">
          <div className="orderDetail-summary__total">
            <h3>訂單總計</h3>
            <span className="orderDetail-summary__amount">
              ${orderDetail.totalAmount}
            </span>
          </div>
          {orderDetail.description && (
            <div className="orderDetail-summary__description">
              <h3>備註</h3>
              <p>{orderDetail.description}</p>
            </div>
          )}
        </div>
      </div>
      <Message message={message} type={messageType} />
    </div>
  );
};

export default OrderDetailComponent;
