import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/PaymentReturn.css"; // 記得引入 CSS

const PaymentReturn = () => {
  const [status, setStatus] = useState("processing");
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    // 監聽表單提交
    const handleFormSubmit = async (e) => {
      e.preventDefault(); // 阻止表單預設提交行為

      // 從表單中取得藍新回傳的資料
      const formData = new FormData(e.target);
      const paymentData = {
        Status: formData.get("Status"),
        MerchantID: formData.get("MerchantID"),
        Version: formData.get("Version"),
        TradeInfo: formData.get("TradeInfo"),
        TradeSha: formData.get("TradeSha"),
      };
      console.log(paymentData);

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
      <form method="POST" action="/payment/return">
        <input type="hidden" name="Status" />
        <input type="hidden" name="MerchantID" />
        <input type="hidden" name="Version" />
        <input type="hidden" name="TradeInfo" />
        <input type="hidden" name="TradeSha" />
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

export default PaymentReturn;
