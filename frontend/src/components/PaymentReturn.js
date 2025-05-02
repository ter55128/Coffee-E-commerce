import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/PaymentReturn.css";
import AuthService from "../services/auth-service";
import Message from "./common/Message";

const PaymentReturn = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      setMessage("請先登入");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
        navigate("/login");
      }, 2000);
    } else {
      console.log(message);
      setUserId(currentUser.user._id);
    }
  }, [navigate]);

  if (!userId) {
    return (
      <div className="payment-container">
        <Message message={message} type={messageType} />
      </div>
    );
  }

  return (
    <div className="payment-return">
      <div className="payment-container">
        <div className="success-container">
          <div className="success-icon">✓</div>
          <h2>付款成功！</h2>
          <p>感謝您的購買</p>

          <div className="action-buttons">
            <button
              className="view-order-btn"
              onClick={() => navigate(`/orders`)}
            >
              查看訂單
            </button>
          </div>
        </div>
      </div>
      <Message message={message} type={messageType} />
    </div>
  );
};

export default PaymentReturn;
