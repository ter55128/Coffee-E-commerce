import "../css/profile.css";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthService from "../services/auth-service";
import axios from "axios";

const ProfileComponent = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userArticles, setUserArticles] = useState([]);
  const [articleMessage, setArticleMessage] = useState("");

  // OAuth 登入解析
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userData = params.get("data");

    if (userData) {
      try {
        // 解析用戶數據
        const parsedData = JSON.parse(decodeURIComponent(userData));

        localStorage.setItem("user", JSON.stringify(parsedData));

        setCurrentUser(parsedData);

        // 清除 URL 参数
        window.history.replaceState({}, document.title, "/profile");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [setCurrentUser]);

  useEffect(() => {
    if (currentUser && !currentUser.user.role) {
      setShowRoleModal(true);
    }

    const fetchUserArticles = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/articles/public/user/${currentUser.user._id}`
        );
        if (response.data.length === 0) {
          setArticleMessage("尚未發布文章");
        }
        setUserArticles(response.data);
      } catch (error) {
        setArticleMessage("尚未發布文章");
      }
    };
    fetchUserArticles();
  }, [currentUser]);

  const handleRoleSelect = async (selectedRole) => {
    try {
      const response = await AuthService.updateRole(selectedRole);

      // 更新用戶數據
      const updatedUserData = {
        ...currentUser,
        token: response.data.token,
        user: {
          ...currentUser.user,
          role: selectedRole,
        },
      };

      localStorage.setItem("user", JSON.stringify(updatedUserData));
      setCurrentUser(updatedUserData);
      setShowRoleModal(false);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <div className="profile">
      {showRoleModal && (
        <div className="profile__modal">
          <div className="profile__modal-content">
            <h3 className="profile__modal-title">請選擇您的身份</h3>
            <div className="profile__modal-buttons">
              <button
                className="profile__modal-button"
                onClick={() => handleRoleSelect("customer")}
              >
                咖啡愛好者
              </button>
              <button
                className="profile__modal-button"
                onClick={() => handleRoleSelect("store")}
              >
                咖啡商家
              </button>
            </div>
          </div>
        </div>
      )}

      {!currentUser && (
        <div className="profile__section">
          在獲取您的個人資料之前，您必須先登錄。
        </div>
      )}
      {currentUser && (
        <div>
          <div className="profile__header">
            <h2 className="profile__welcome">
              Hi, {currentUser.user.username}!
            </h2>
            <h2 className="profile__subtitle">今天喝咖啡了嗎？</h2>
          </div>

          <div className="profile__section">
            <h4 className="profile__title">個人檔案</h4>
            <table className="profile__table">
              <tbody>
                <tr>
                  <td className="profile__table-cell">
                    <span className="profile__label">用戶ID：</span>
                    <span className="profile__value">
                      {currentUser.user._id}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="profile__table-cell">
                    <span className="profile__label">電子信箱：</span>
                    <span className="profile__value">
                      {currentUser.user.email}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="profile__table-cell">
                    <span className="profile__label">身份類別：</span>
                    <span
                      className={`profile__role ${
                        !currentUser.user.role
                          ? "profile__role--unselected"
                          : currentUser.user.role === "customer"
                          ? "profile__role--customer"
                          : "profile__role--store"
                      }`}
                    >
                      {!currentUser.user.role
                        ? "尚未選擇身份"
                        : currentUser.user.role === "customer"
                        ? "咖啡愛好者！"
                        : "咖啡商家"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="profile__table-cell">
                    <span className="profile__label">註冊時間：</span>
                    <span className="profile__value">
                      {new Date(currentUser.user.createdAt).toLocaleDateString(
                        "zh-TW"
                      )}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="profile__table-cell">
                    <span className="profile__label">自我介紹：</span>
                    <span className="profile__value">
                      {currentUser.user.introduction}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <button
              className="profile__button"
              onClick={() => navigate(`/profile/edit`)}
            >
              編輯個人資料
            </button>
          </div>
        </div>
      )}
      <div className="profile__subtitle">已發布文章</div>
      {articleMessage ? (
        <div className="profile__message">{articleMessage}</div>
      ) : (
        userArticles.map((article) => (
          <div className="profile__article" key={article._id}>
            <div
              className="profile__article-title"
              onClick={() => navigate(`/articles/${article._id}`)}
            >
              {article.title}
            </div>
            <div className="profile__article-info">
              <div className="profile__article-date">
                {new Date(article.createdAt).toLocaleDateString()}
              </div>
              <div className="profile__article-comments">
                {article.comments.length} 則留言
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProfileComponent;
