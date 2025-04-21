import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ArticleService from "../services/article-service";
import "../css/editArticle.css";

const EditArticleComponent = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState({ type: "", content: "" });

  console.log(currentUser);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/articles/public/${id}`
        );
        const articleData = response.data;

        // 檢查是否為文章作者
        if (currentUser?.user._id !== articleData.author._id) {
          navigate("/articles");
          return;
        }

        setArticle(articleData);
        setTitle(articleData.title);
        setContent(articleData.content);
        setLoading(false);
      } catch (error) {
        setMessage({
          type: "error",
          content: "文章載入失敗",
        });
        setLoading(false);
      }
    };

    if (!currentUser) {
      navigate("/login");
      return;
    }

    fetchArticle();
  }, [id, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", content: "" }); // 清除之前的訊息

    try {
      // 驗證
      if (!title.trim()) {
        setMessage({ type: "error", content: "標題不能為空" });
        return;
      }
      if (title.length < 2 || title.length > 100) {
        setMessage({ type: "error", content: "標題長度必須在2-100字之間" });
        return;
      }
      if (!content.trim()) {
        setMessage({ type: "error", content: "內容不能為空" });
        return;
      }
      if (content.length < 10 || content.length > 5000) {
        setMessage({ type: "error", content: "內容長度必須在10-5000字之間" });
        return;
      }

      setLoading(true);
      await ArticleService.updateArticle(id, { title, content });
      setMessage({ type: "success", content: "文章更新成功！" });

      // 成功後延遲導航，讓用戶看到成功訊息
      setTimeout(() => {
        navigate(`/articles/${id}`);
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        content: error.response?.data || "更新失敗",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = title !== article.title || content !== article.content;

    if (hasChanges) {
      const isConfirmed = window.confirm("您有未保存的更改，確定要離開嗎？");
      if (!isConfirmed) return;
    }
    navigate(`/articles/${id}`);
  };

  if (loading) return <div className="editArticle__loading">載入中...</div>;

  return (
    <div className="editArticle">
      <button className="editArticle__back-button" onClick={handleCancel}>
        <i className="fas fa-arrow-left"></i> 返回
      </button>

      <div className="editArticle__title">編輯文章</div>

      {message.content && (
        <div
          className={`editArticle__message editArticle__message--${message.type}`}
        >
          {message.content}
        </div>
      )}

      <form className="editArticle__form" onSubmit={handleSubmit}>
        <div className="editArticle__form-group">
          <label className="editArticle__label">標題</label>
          <input
            type="text"
            className="editArticle__input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="請輸入標題..."
          />
        </div>

        <div className="editArticle__form-group">
          <label className="editArticle__label">內容</label>
          <textarea
            className="editArticle__textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="請輸入內容..."
            rows="10"
          />
        </div>

        <div className="editArticle__buttons">
          <button
            type="button"
            className="editArticle__button editArticle__button--cancel"
            onClick={handleCancel}
          >
            取消
          </button>
          <button
            type="submit"
            className="editArticle__button editArticle__button--submit"
            disabled={loading}
          >
            {loading ? "更新中..." : "更新文章"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditArticleComponent;
