import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../css/PaymentCallback.css";

const PaymentCallback = () => {
  const [status, setStatus] = useState("processing"); // 'processing', 'success', 'failed'
  const [orderInfo, setOrderInfo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get("Status");
    const merchantOrderNo = searchParams.get("MerchantOrderNo");

    if (status === "SUCCESS") {
      handlePaymentSuccess(merchantOrderNo);
    } else {
      setStatus("failed");
    }
  }, [location]);

  const handlePaymentSuccess = async (orderNumber) => {
    try {
      // 向後端確認訂單狀態
      const response = await axios.get(`/api/orders/${orderNumber}`);
      setOrderInfo(response.data);
      setStatus("success");

      // 清空購物車
      // 假設您有一個清空購物車的 service
      await axios.post("/api/cart/clear");
    } catch (error) {
      console.error("訂單確認失敗:", error);
      setStatus("failed");
    }
  };

  const renderContent = () => {
    switch (status) {
      case "processing":
        return (
          <div className="payment-processing">
            <div className="spinner"></div>
            <p>正在處理您的付款，請稍候...</p>
          </div>
        );

      case "success":
        return (
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h2>付款成功！</h2>
            {orderInfo && (
              <div className="order-details">
                <p>訂單編號：{orderInfo.orderNumber}</p>
                <p>付款金額：${orderInfo.totalAmount}</p>
                <p>
                  付款時間：
                  {new Date(orderInfo.paymentInfo.paymentTime).toLocaleString()}
                </p>
              </div>
            )}
            <div className="action-buttons">
              <button onClick={() => navigate("/orders")}>查看訂單</button>
              <button onClick={() => navigate("/products")}>繼續購物</button>
            </div>
          </div>
        );

      case "failed":
        return (
          <div className="payment-failed">
            <div className="failed-icon">×</div>
            <h2>付款失敗</h2>
            <p>很抱歉，您的付款未能完成。</p>
            <div className="action-buttons">
              <button onClick={() => navigate("/cart")}>返回購物車</button>
              <button onClick={() => window.location.reload()}>重試付款</button>
            </div>
          </div>
        );
    }
  };

  return <div className="payment-callback-container">{renderContent()}</div>;
};

export default PaymentCallback;
