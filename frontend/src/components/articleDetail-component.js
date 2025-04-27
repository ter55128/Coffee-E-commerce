import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/articleDetail.css";
import ArticleService from "../services/article-service";
import Message from "./common/Message";
import Modal from "./common/Modal";

const ArticleDetailComponent = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/articles/public/${id}`
        );
        setArticle(response.data);
        setLoading(false);
      } catch (error) {
        setMessage("文章載入失敗");
        setMessageType("error");
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleReplySubmit = async () => {
    try {
      await ArticleService.postComment(id, {
        content: replyContent,
      });
      setShowReplyModal(false);
      setReplyContent("");
      setMessage("回覆成功");
      setMessageType("success");
    } catch (error) {
      setMessage("回覆失敗");
      setMessageType("error");
    }
  };

  if (loading) return <div className="loading">載入中...</div>;
  if (!article) return <Message message="獲取文章失敗" type="error" />;
  return (
    <div className="articleDetail">
      <div className="articleDetail__button-group">
        <button
          className="articleDetail__button"
          onClick={() => navigate("/articles")}
        >
          <i className="fas fa-arrow-left"></i> 返回
        </button>
        {currentUser && currentUser.user._id === article.author._id && (
          <button
            className="articleDetail__button"
            onClick={() => navigate(`/articles/edit/${id}`)}
          >
            <i className="fas fa-pencil-alt"></i> 編輯文章
          </button>
        )}
      </div>
      <h1 className="articleDetail__title">{article.title}</h1>
      <div className="articleDetail__meta">
        <span
          className="articleDetail__author"
          onClick={() => navigate(`/publicProfile/${article.author._id}`)}
        >
          {article.author.username}
        </span>
        <span className="articleDetail__date">
          發表於：{new Date(article.createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="articleDetail__content">{article.content}</div>
      <div className="articleDetail__comments">
        <div className="articleDetail__comments-header">
          <h3 className="articleDetail__comments-title">
            留言區 ({article.comments.length})
          </h3>
          {currentUser && (
            <button
              className="articleDetail__comments-reply-button"
              onClick={() => setShowReplyModal(true)}
            >
              <i className="fas fa-reply"></i> 回覆
            </button>
          )}
          {!currentUser && (
            <div className="articleDetail__comments-login-hint">
              如想回覆，請先登入
            </div>
          )}
        </div>

        {article.comments.map((comment, index) => (
          <div key={index} className="articleDetail__comment">
            <div className="articleDetail__comment-header">
              <span
                className="articleDetail__comment-author"
                onClick={() => navigate(`/publicProfile/${comment.author._id}`)}
              >
                {comment.author.username}
              </span>
              <span className="articleDetail__comment-date">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="articleDetail__comment-content">
              {comment.content}
            </div>
          </div>
        ))}
      </div>
      <Message message={message} type={messageType} />
      <Modal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        message="發表回覆"
        content={replyContent}
        onChange={setReplyContent}
        onConfirm={handleReplySubmit}
        onCancel={() => setShowReplyModal(false)}
      />
    </div>
  );
};

export default ArticleDetailComponent;
