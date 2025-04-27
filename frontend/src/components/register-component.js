import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth-service";
import "../css/register.css";
import Message from "./common/Message";

const RegisterComponent = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleUsername = (e) => {
    setUsername(e.target.value);
  };
  const handleEmail = (e) => {
    setEmail(e.target.value);
  };
  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleRegister = () => {
    AuthService.register(username, email, password, role)
      .then((response) => {
        setMessage("註冊成功！即將前往登入頁面...");
        setMessageType("success");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
          navigate("/login");
        }, 2000);
      })
      .catch((e) => {
        setMessage(e.response.data);
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 4000);
      });
  };

  return (
    <div className="register">
      <h2 className="register__title">會員註冊</h2>
      <div className="register__group">
        <label className="register__label" htmlFor="username">
          用戶名稱 / 商家名稱
        </label>
        <input
          onChange={handleUsername}
          type="text"
          className="register__input"
          name="username"
        />
      </div>

      <div className="register__group">
        <label className="register__label" htmlFor="email">
          電子信箱
        </label>
        <input
          onChange={handleEmail}
          type="email"
          className="register__input"
          name="email"
          placeholder="Ex : coffee2025@gmail.com"
        />
      </div>

      <div className="register__group">
        <label className="register__label" htmlFor="password">
          密碼
        </label>
        <input
          onChange={handlePassword}
          type="password"
          className="register__input"
          name="password"
          placeholder="至少6個字元"
        />
      </div>

      <div className="register__group">
        <label className="register__label">身份</label>
        <div className="register__role-selector">
          <div
            className={`register__role-option ${
              role === "customer" ? "register__role-option--selected" : ""
            }`}
            onClick={() => setRole("customer")}
          >
            一般會員
          </div>
          <div
            className={`register__role-option ${
              role === "store" ? "register__role-option--selected" : ""
            }`}
            onClick={() => setRole("store")}
          >
            商家會員
          </div>
        </div>
      </div>

      <button onClick={handleRegister} className="register__button">
        註冊會員
      </button>
      <Message message={message} type={messageType} />
    </div>
  );
};

export default RegisterComponent;
