import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthService from "../services/auth-service";
import axios from "axios";
import "../css/publicProfile.css";

const PublicProfileComponent = (props) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userArticles, setUserArticles] = useState([]);
  const [articleMessage, setArticleMessage] = useState("");
  const [productMessage, setProductMessage] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await AuthService.getUserProfile(id);
        setUserProfile(response.data);

        if (response.data.role === "store") {
          try {
            const productsResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/beans/public/store/${id}`
            );
            if (productsResponse.data.length === 0) {
              setProductMessage("尚未發布商品");
            }
            setUserProducts(productsResponse.data);
          } catch (error) {
            setProductMessage("尚未發布商品");
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("獲取用戶資料失敗:", error);
        setLoading(false);
      }
    };

    const fetchUserArticles = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/articles/public/user/${id}`
        );
        if (response.data.length === 0) {
          setArticleMessage("尚未發布文章");
        }
        setUserArticles(response.data);
      } catch (error) {
        setArticleMessage("尚未發布文章");
        console.error("獲取用戶文章失敗:", error);
      }
    };

    fetchUserProfile();
    fetchUserArticles();
  }, [id]);

  const handleProductDetail = (beanId) => {
    navigate(`/products/${beanId}`);
  };

  if (loading) {
    return <div className="public-profile">載入中...</div>;
  }

  return (
    <div className="public-profile">
      <div className="public-profile__header">
        <h1 className="public-profile__title">{userProfile?.username}</h1>
        <div className="public-profile__info-container">
          {userProfile?.introduction ? (
            <div className="public-profile__introduction">
              <div className="public-profile__introduction-text">
                {userProfile.introduction}
              </div>
            </div>
          ) : (
            <div className="public-profile__introduction">
              <div className="public-profile__introduction-empty">
                這個人很神秘，還沒有自我介紹...
              </div>
            </div>
          )}
          <div className="public-profile__info">
            <p className="public-profile__info-text">
              {userProfile?.role === "store" ? "咖啡商家" : "咖啡愛好者"}
            </p>
            <p className="public-profile__info-text">
              加入時間：{new Date(userProfile?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="public-profile__subtitle">發布文章列表</div>
      {articleMessage ? (
        <div className="public-profile__message">{articleMessage}</div>
      ) : (
        userArticles.map((article) => (
          <div className="public-profile__article" key={article._id}>
            <div
              className="public-profile__article-title"
              onClick={() => navigate(`/articles/${article._id}`)}
            >
              {article.title}
            </div>
            <div className="public-profile__article-info">
              <div className="public-profile__article-date">
                {new Date(article.createdAt).toLocaleDateString()}
              </div>
              <div className="public-profile__article-comments">
                {article.comments.length} 則留言
              </div>
            </div>
          </div>
        ))
      )}

      {userProfile?.role === "store" && (
        <>
          <div className="public-profile__subtitle">商品列表</div>
          {productMessage ? (
            <div className="public-profile__message">{productMessage}</div>
          ) : (
            <div className="public-profile__grid">
              {userProducts.map((bean) => (
                <div
                  className="public-profile__card"
                  key={bean._id}
                  onClick={() => handleProductDetail(bean._id)}
                >
                  <img
                    src={`${process.env.REACT_APP_API_URL}${bean.image}`}
                    alt={bean.title}
                    className="public-profile__card-image"
                  />
                  <div className="public-profile__card-content">
                    <h5 className="public-profile__card-title">{bean.title}</h5>
                    <div className="public-profile__card-info">
                      <span className="public-profile__card-weight">
                        {bean.weight}g
                      </span>
                      <span className="public-profile__card-price">
                        $ {bean.price}
                      </span>
                    </div>

                    <div className="public-profile__card-footer">
                      <p className="public-profile__card-sales">
                        已售出：{bean.soldCount} 件
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PublicProfileComponent;
