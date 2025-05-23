import "../css/home.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth-service";
import Modal from "./common/Modal";

const HomeComponent = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const handlequestion = () => {
    setCurrentUser(AuthService.getCurrentUser());
    if (currentUser) {
      setShowLoginModal(true);
    } else {
      setShowQuestionModal(true);
    }
  };

  return (
    <main className="home">
      <div className="home__container">
        <section className="home__hero">
          <div className="container-fluid">
            <h1 className="home__title">咖啡交流 ＆ 交易平台</h1>
            <p className="home__description">
              隨著咖啡文化的普及，咖啡已經成為許多人生活中不可或缺的一部分，咖啡愛好者們也開始對咖啡豆品質有更高的要求。
              <br />
              近年來，越來越多自家烘焙的咖啡館如雨後春筍般出現，即便是同一隻咖啡豆，不同烘豆師展現出的特色也會有所不同，
              即便是自家烘焙的小店，也能透過本平台讓更多人認識，並提供各位咖啡愛好者有更多選擇。
            </p>
            <button
              className="home__button"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? "收起內容" : "ABOUT MORE"}
            </button>

            <div
              className={`home__features-collapse ${
                showMore ? "home__features-collapse--active" : ""
              }`}
            >
              <div className="home__features">
                <h3 className="home__section-title">平台特色</h3>
                <div className="home__features-grid">
                  <div className="home__feature-card">
                    <div className="home__feature-icon">🛒</div>
                    <h5 className="home__feature-title">購物功能</h5>
                    <p>提供多樣化的咖啡豆選擇，購買各地的咖啡豆</p>
                  </div>
                  <div className="home__feature-card">
                    <div className="home__feature-icon">💬</div>
                    <h5 className="home__feature-title">論壇交流</h5>
                    <p>咖啡愛好者的交流平台，分享心得與經驗</p>
                  </div>
                  <div className="home__feature-card">
                    <div className="home__feature-icon">🏪</div>
                    <h5 className="home__feature-title">商家系統</h5>
                    <p>商家可以管理商品、查看訂單狀態</p>
                  </div>
                  <div className="home__feature-card">
                    <div className="home__feature-icon">👤</div>
                    <h5 className="home__feature-title">會員系統</h5>
                    <p>會員註冊與管理功能(用戶／商家)</p>
                  </div>
                  <div className="home__feature-card home__feature-card--wide">
                    <div className="home__feature-How">How to build ?</div>
                    <p>
                      本系統使用
                      React.js作為前端框架，Express.js為web框架，Node.js、MongoDB作為後端服務器。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="row">
          <div className="col-md-6">
            <div className="home__user-card home__user-card--coffee">
              <h2 className="home__user-title">咖啡愛好者</h2>
              <p className="home__user-text">
                您可以註冊一個帳號，並開始在論壇發表文章，與其他咖啡愛好者交流，以及購買來自各地的咖啡豆。
              </p>
              <button
                className="home__user-button--coffee"
                onClick={handlequestion}
              >
                登錄會員、或者註冊一個帳號
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="home__user-card home__user-card--store">
              <h2 className="home__user-title">咖啡商家</h2>
              <p className="home__user-text">
                註冊成為咖啡商家，提供高品質的咖啡熟豆，也可以在論壇發表文章，分享咖啡知識，增加曝光度。
              </p>
              <button
                className="home__user-button--store"
                onClick={handlequestion}
              >
                註冊咖啡商家，讓大家認識你
              </button>
            </div>
          </div>
        </div>

        <footer className="home__footer">&copy; 2025 Hank Lin</footer>
      </div>
      <Modal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        title="會員登入"
        message="您是否已經有帳號？"
        onConfirm={() => {
          setShowQuestionModal(false);
          navigate("/login");
        }}
        confirmText="是"
        cancelText="否"
        onCancel={() => {
          setShowQuestionModal(false);
          navigate("/register");
        }}
      />
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="提示"
        message="您已經登入，跳轉至個人頁面"
        onConfirm={() => {
          setShowLoginModal(false);
          navigate("/profile");
        }}
        confirmText="確定"
      />
    </main>
  );
};

export default HomeComponent;
