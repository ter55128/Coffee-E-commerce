import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArticleService from "../services/article-service";
import "../css/postArticle.css";

const PostArticleComponent = ({ currentUser }) => {
  const navigate = useNavigate();
  const [article, setArticle] = useState({ title: "", content: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ArticleService.postArticle(article);
      setMessage("發表成功！");
      setTimeout(() => {
        navigate("/articles");
      }, 1500);
    } catch (error) {
      setMessage("發表失敗，請稍後再試");
    }
  };

  return (
    <div className="postArticle">
      <div className="postArticle__header">
        <button
          className="postArticle__back"
          onClick={() => navigate("/articles")}
        >
          <i className="fas fa-arrow-left"></i>
          返回
        </button>
        <h1 className="postArticle__title">發表新文章</h1>
      </div>

      <form onSubmit={handleSubmit} className="postArticle__form">
        <div className="postArticle__form-group">
          <label className="postArticle__label" htmlFor="title">
            標題
          </label>
          <input
            className="postArticle__input"
            type="text"
            id="title"
            value={article.title}
            onChange={(e) => setArticle({ ...article, title: e.target.value })}
            required
            placeholder="請輸入文章標題"
          />
        </div>

        <div className="postArticle__form-group">
          <label className="postArticle__label" htmlFor="content">
            內容
          </label>
          <textarea
            className="postArticle__input postArticle__textarea"
            id="content"
            value={article.content}
            onChange={(e) =>
              setArticle({ ...article, content: e.target.value })
            }
            required
            placeholder="請輸入文章內容"
            rows="10"
          />
        </div>

        <div className="postArticle__actions">
          <button
            type="submit"
            className="postArticle__button postArticle__button--submit"
          >
            發表文章
          </button>
          <button
            type="button"
            className="postArticle__button postArticle__button--cancel"
            onClick={() => navigate("/articles")}
          >
            取消
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`postArticle__message ${
            message.includes("成功")
              ? "postArticle__message--success"
              : "postArticle__message--error"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
};

export default PostArticleComponent;
