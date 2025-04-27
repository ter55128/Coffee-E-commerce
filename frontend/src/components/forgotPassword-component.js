import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthService from "../services/auth-service";
import "../css/forgotPassword.css";
import Message from "./common/message";

const ForgotPasswordComponent = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await AuthService.forgotPassword(email);
      console.log(response);
      setMessage("重設密碼連結已發送到您的信箱，請查收！");
      setMessageType("success");
    } catch (error) {
      setMessage(error.response?.data || "發送重設密碼郵件失敗，請稍後再試");
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgotpassword">
      <div className="forgotpassword__card">
        <h2 className="forgotpassword__title">忘記密碼</h2>
        <p className="forgotpassword__description">
          請輸入您的電子郵件地址，我們將發送重設密碼的連結給您。
        </p>

        <form onSubmit={handleSubmit} className="forgotpassword__form">
          <div className="forgotpassword__form-group">
            <label htmlFor="email" className="forgotpassword__label">
              電子郵件
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="forgotpassword__input"
              required
              placeholder="請輸入您的電子郵件"
            />
          </div>

          <div className="forgotpassword__actions">
            <button
              type="submit"
              className={`forgotpassword__button ${
                loading ? "forgotpassword__button--disabled" : ""
              }`}
              disabled={loading}
            >
              {loading ? "處理中..." : "發送重設連結"}
            </button>
            <Link to="/login" className="forgotpassword__back">
              返回登入
            </Link>
          </div>
        </form>
      </div>
      <Message message={message} type={messageType} />
    </div>
  );
};

export default ForgotPasswordComponent;
