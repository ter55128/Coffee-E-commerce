import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/PaymentReturn.css"; // 記得引入 CSS

const PaymentCallback = () => {
  const [status, setStatus] = useState("processing");
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // 監聽表單提交
    const handleFormSubmit = async (event) => {
      event.preventDefault(); // 阻止表單預設提交行為

      // 從表單中取得藍新回傳的資料
      const formData = new FormData(event.target);
      const paymentData = {
        Status: formData.get("Status"),
        MerchantID: formData.get("MerchantID"),
        Version: formData.get("Version"),
        TradeInfo: formData.get("TradeInfo"),
        TradeSha: formData.get("TradeSha"),
      };

      // 如果 Status 是 SUCCESS，處理後續邏輯
      if (paymentData.Status === "SUCCESS") {
        setStatus("success");
        setPaymentData(paymentData);
      } else {
        setStatus("failed");
      }
    };

    // 添加表單監聽器
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", handleFormSubmit);
    }

    // 清理監聽器
    return () => {
      if (form) {
        form.removeEventListener("submit", handleFormSubmit);
      }
    };
  }, []);

  return (
    <div className="payment-container">
      {/* 藍新會 POST 到這個表單 */}
      <form method="POST">
        <input type="" name="Status" />
        <input type="" name="MerchantID" />
        <input type="" name="Version" />
        <input type="" name="TradeInfo" />
        <input type="" name="TradeSha" />
      </form>

      {/* 顯示處理結果 */}
      {status === "processing" && (
        <div className="processing">
          <div className="processing-spinner"></div>
          <div>正在處理付款結果，請稍候...</div>
        </div>
      )}

      {status === "success" && (
        <div className="success-container">
          <h2>✓ 付款成功！</h2>
          {paymentData && (
            <div className="payment-info">
              <p>商店代號：{paymentData.MerchantID}</p>
              <p>交易狀態：{paymentData.Status}</p>
              <p>交易資訊：{paymentData.TradeInfo}</p>
              <p>交易SHA：{paymentData.TradeSha}</p>
            </div>
          )}
        </div>
      )}

      {status === "failed" && (
        <div className="failed-container">
          <h2>× 付款失敗</h2>
          <p>很抱歉，您的付款未能完成。</p>
        </div>
      )}
    </div>
  );
};

export default PaymentCallback;
