import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthService from "../services/auth-service";
import "../css/login.css";
import Message from "./common/Message";

const LoginComponent = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();
  let [email, setEmail] = useState("");
  let [password, setPassword] = useState("");
  let [message, setMessage] = useState("");
  let [messageType, setMessageType] = useState("info");
  useEffect(() => {
    if (currentUser) {
      setMessage("您已經登入，將導向至個人頁面");
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    }
  }, [navigate]);

  const handleLogin = async () => {
    try {
      let response = await AuthService.login(email, password);
      localStorage.setItem("user", JSON.stringify(response.data));
      setMessage("登入成功，即將前往個人頁面");
      setMessageType("success");
      setCurrentUser(AuthService.getCurrentUser());
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (e) {
      setMessage("登入失敗，請檢查密碼是否正確");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  };

  const handleGoogleLogin = async () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/user/google`;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="login">
      <h2 className="login__title">會員登入</h2>

      <div className="login__oauth">
        <button
          onClick={handleGoogleLogin}
          className="login__oauth-button login__oauth-button--google"
        >
          <i className="fab fa-google login__oauth-icon"></i>
          使用 Google 登入
        </button>
      </div>

      <div className="login__divider">
        <span className="login__divider-text">或</span>
      </div>

      <div className="login__form-group">
        <label className="login__label" htmlFor="email">
          電子信箱
        </label>
        <input
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="login__input"
          name="email"
          placeholder="請輸入您的電子信箱"
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="login__form-group">
        <label className="login__label" htmlFor="password">
          密碼
        </label>
        <input
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="login__input"
          name="password"
          placeholder="請輸入您的密碼"
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="login__forgot">
        <Link to="/forgot-password" className="login__link">
          忘記密碼？
        </Link>
      </div>

      <button onClick={handleLogin} className="login__button">
        登入
      </button>

      <div className="login__register">
        <p className="login__register-text">還沒有帳號？</p>
        <Link to="/register" className="login__link">
          立即註冊新帳號
        </Link>
      </div>
      {message && (
        <Message
          message={message}
          type={messageType}
          onClose={() => setMessage("")}
        />
      )}
    </div>
  );
};

export default LoginComponent;
