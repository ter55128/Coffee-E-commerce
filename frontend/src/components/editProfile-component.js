import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth-service";
import "../css/editProfile.css";
import Message from "./common/Message";

const EditProfileComponent = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    introduction: "",
  });

  // 檢查用戶是否沒有設置密碼
  const hasNoPassword = !currentUser?.user?.password;

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setUserData({
      ...userData,
      username: currentUser.user.username,
      email: currentUser.user.email,
      introduction: currentUser.user.introduction || "",
    });
    setLoading(false);
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      setLoading(true);
      // 只更新選擇修改的欄位
      const updateData = {};

      if (userData.username !== currentUser.user.username) {
        updateData.username = userData.username;
      }

      if (userData.introduction !== currentUser.user.introduction) {
        updateData.introduction = userData.introduction;
      }

      if (!hasNoPassword && userData.newPassword) {
        if (userData.newPassword !== userData.confirmPassword) {
          setMessage("新密碼與確認密碼不匹配");
          setMessageType("error");
          setTimeout(() => {
            setMessage("");
          }, 2000);
          setLoading(false);
          return;
        }

        if (!userData.currentPassword) {
          setMessage("請輸入當前密碼");
          setMessageType("error");
          setTimeout(() => {
            setMessage("");
          }, 2000);
          setLoading(false);
          return;
        }

        updateData.currentPassword = userData.currentPassword;
        updateData.newPassword = userData.newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setMessage("沒有要更新的資料");
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
        }, 2000);
        setLoading(false);
        return;
      }

      const response = await AuthService.updateProfile(updateData);

      // 更新用戶資料 .token
      const updatedUser = {
        token: response.data.token,
        user: response.data.user,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setMessage("個人資料更新成功！");
      setMessageType("success");
      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (error) {
      let errorMessage = "更新失敗，請稍後再試";
      if (error.response) {
        errorMessage = error.response.data || errorMessage;
      }
      if (error.response?.status === 401) {
        errorMessage = "當前密碼不正確";
      }
      setMessage(errorMessage);
      setMessageType("error");
      setTimeout(() => {
        setMessageType("");
        setMessage("");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="editprofile__loading">載入中...</div>;
  }

  return (
    <div className="editprofile">
      <div className="editprofile__card">
        <h2 className="editprofile__title">編輯個人資料</h2>

        <form onSubmit={handleSubmit} className="editprofile__form">
          <div className="editprofile__form-group">
            <label className="editprofile__label">用戶名稱</label>
            <input
              type="text"
              name="username"
              value={userData.username}
              onChange={handleInputChange}
              className="editprofile__input"
              required
            />
          </div>

          <div className="editprofile__form-group">
            <label className="editprofile__label">電子郵件</label>
            <input
              type="email"
              name="email"
              value={userData.email}
              className="editprofile__input editprofile__input--disabled"
              disabled
              title="電子郵件不可修改"
            />
            <small className="editprofile__hint">電子郵件不可修改</small>
          </div>
          <div className="editprofile__form-group">
            <label className="editprofile__label">自我介紹</label>
            <textarea
              name="introduction"
              value={userData.introduction}
              onChange={handleInputChange}
              className="editprofile__input editprofile__textarea"
              placeholder="寫下一些關於你自己的介紹..."
              maxLength="200"
              rows="4"
            />
            <small className="editprofile__hint">最多200字</small>
          </div>

          {/* 修改密碼部分根據是否有密碼來顯示不同內容 */}
          {hasNoPassword ? (
            <div className="editprofile__google-notice">
              <div className="editprofile__info-box">
                <i className="fas fa-info-circle"></i>
                <p>您使用 Google 帳號登入，無需設置密碼</p>
              </div>
            </div>
          ) : (
            <div className="editprofile__password">
              <h3 className="editprofile__password-title">修改密碼</h3>
              <p className="editprofile__hint">如不修改密碼，請留空</p>

              <div className="editprofile__form-group">
                <label className="editprofile__label">當前密碼</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={userData.currentPassword}
                  onChange={handleInputChange}
                  className="editprofile__input"
                />
              </div>

              <div className="editprofile__form-group">
                <label className="editprofile__label">新密碼</label>
                <input
                  type="password"
                  name="newPassword"
                  value={userData.newPassword}
                  onChange={handleInputChange}
                  className="editprofile__input"
                  minLength="6"
                />
                <small className="editprofile__hint">
                  密碼長度至少為 6 個字符
                </small>
              </div>

              <div className="editprofile__form-group">
                <label className="editprofile__label">確認新密碼</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={userData.confirmPassword}
                  onChange={handleInputChange}
                  className="editprofile__input"
                />
              </div>
            </div>
          )}

          <div className="editprofile__actions">
            <button
              type="submit"
              className={`editprofile__button editprofile__button--save ${
                loading ? "editprofile__button--disabled" : ""
              }`}
              disabled={loading}
            >
              {loading ? "儲存中..." : "儲存變更"}
            </button>

            <button
              type="button"
              className={`editprofile__button editprofile__button--cancel ${
                loading ? "editprofile__button--disabled" : ""
              }`}
              onClick={() => navigate("/profile")}
              disabled={loading}
            >
              取消
            </button>
          </div>
        </form>
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

export default EditProfileComponent;
