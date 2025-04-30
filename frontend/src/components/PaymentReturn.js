import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/PaymentReturn.css";

const PaymentReturn = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  return (
    <div className="payment-container">
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h2>付款成功！</h2>
        <p>感謝您的購買</p>

        <div className="action-buttons">
          <button
            className="view-order-btn"
            onClick={() => navigate(`/orders/${userId}`)}
          >
            查看訂單
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReturn;
