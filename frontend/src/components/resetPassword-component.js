import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AuthService from "../services/auth-service";
import "../css/resetPassword.css";

const ResetPasswordComponent = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validToken, setValidToken] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 驗證密碼
    if (newPassword.length < 6) {
      setMessage("密碼長度必須至少為6個字符");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("兩次輸入的密碼不一致");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await AuthService.resetPassword(token, newPassword);
      setMessage("密碼重設成功！即將跳轉到登入頁面...");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      if (error.response?.status === 401) {
        setValidToken(false);
        setMessage("重設密碼連結已過期，請重新申請");
      } else {
        setMessage(error.response?.data || "重設密碼失敗，請稍後再試");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resetPassword">
      <div className="resetPassword__container">
        <div className="resetPassword__card">
          <h2 className="resetPassword__title">重設密碼</h2>

          {!validToken ? (
            <div className="resetPassword__expired">
              <p>重設密碼連結已過期或無效</p>
              <Link to="/forgot-password" className="resetPassword__link">
                重新申請重設密碼
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="resetPassword__form">
              <div className="resetPassword__group">
                <label className="resetPassword__label">新密碼</label>
                <div className="resetPassword__input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="resetPassword__input"
                    placeholder="請輸入新密碼"
                    required
                  />
                  <button
                    type="button"
                    className="resetPassword__toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`fas fa-eye${showPassword ? "-slash" : ""}`}
                    ></i>
                  </button>
                </div>
              </div>

              <div className="resetPassword__group">
                <label className="resetPassword__label">確認密碼</label>
                <div className="resetPassword__input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="resetPassword__input"
                    placeholder="請再次輸入新密碼"
                    required
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`resetPassword__message ${
                    message.includes("成功")
                      ? "resetPassword__message--success"
                      : "resetPassword__message--error"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="resetPassword__actions">
                <button
                  type="submit"
                  className="resetPassword__button resetPassword__button--submit"
                  disabled={loading}
                >
                  {loading ? "處理中..." : "確認重設"}
                </button>
                <Link
                  to="/login"
                  className="resetPassword__button resetPassword__button--cancel"
                >
                  返回登入
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordComponent;
