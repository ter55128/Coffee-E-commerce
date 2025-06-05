import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ArticleService from "../services/article-service";
import "../css/editArticle.css";
import Message from "./common/Message";
import Modal from "./common/Modal";

const EditArticleComponent = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/articles/public/${id}`
        );
        const articleData = response.data;

        if (currentUser?.user._id !== articleData.author._id) {
          navigate("/articles");
          return;
        }

        setArticle(articleData);
        setTitle(articleData.title);
        setContent(articleData.content);
        setLoading(false);
      } catch (error) {
        setMessage("文章載入失敗");
        errotMessage();
        setLoading(false);
      }
    };

    if (!currentUser) {
      navigate("/login");
      return;
    }

    fetchArticle();
  }, [id, currentUser, navigate]);

  const errotMessage = () => {
    setMessageType("error");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 2000);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      if (!title.trim()) {
        setMessage("標題不能為空");
        errotMessage();
        return;
      }
      if (title.length < 2 || title.length > 100) {
        setMessage("標題長度必須在2-100字之間");
        errotMessage();
        return;
      }
      if (!content.trim()) {
        setMessage("內容不能為空");
        errotMessage();
        return;
      }
      if (content.length < 10 || content.length > 5000) {
        setMessage("內容長度必須在10-5000字之間");
        errotMessage();
        return;
      }

      setLoading(true);
      await ArticleService.updateArticle(id, { title, content });
      setMessage("文章更新成功！");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
        navigate(`/articles/${id}`);
      }, 2000);
    } catch (error) {
      setMessage("更新失敗");
      errotMessage();
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    const hasChanges = title !== article.title || content !== article.content;

    if (hasChanges) {
      setIsModalOpen(true);
    } else {
      navigate(`/articles/${id}`);
    }
  };

  if (loading) return <div className="editArticle__loading">載入中...</div>;

  return (
    <div className="editArticle">
      <button className="editArticle__back-button" onClick={handleCancel}>
        <i className="fas fa-arrow-left"></i> 返回
      </button>

      <div className="editArticle__title">編輯文章</div>

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
      <Message message={message} type={messageType} />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message="您有未保存的更改，確定要離開嗎？"
        onConfirm={() => navigate(`/articles/${id}`)}
        onCancel={() => setIsModalOpen(false)}
        confirmText="確定"
        cancelText="取消"
      />
    </div>
  );
};

export default EditArticleComponent;
