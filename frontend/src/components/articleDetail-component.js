import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/articleDetail.css";
import ArticleService from "../services/article-service";

const ArticleDetailComponent = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        setError("文章載入失敗");
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleReplySubmit = async () => {
    try {
      const response = await ArticleService.postComment(id, {
        content: replyContent,
      });

      // 更新文章評論
      setArticle({
        ...article,
        comments: [...article.comments, response.data],
      });

      // 清空並關閉彈窗
      setReplyContent("");
      setShowReplyModal(false);
    } catch (error) {
      console.error("回覆發送失敗", error);
    }
  };

  if (loading) return <div className="loading">載入中...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!article) return <div className="error">找不到文章</div>;

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

      <div className="comments">
        <div className="comments__header">
          <h3 className="comments__title">
            留言區 ({article.comments.length})
          </h3>
          {currentUser && (
            <button
              className="comments__reply-button"
              onClick={() => setShowReplyModal(true)}
            >
              <i className="fas fa-reply"></i> 回覆
            </button>
          )}
          {!currentUser && (
            <div className="comments__login-hint">如想回覆，請先登入</div>
          )}
        </div>

        {article.comments.map((comment, index) => (
          <div key={index} className="comment">
            <div className="comment__header">
              <span
                className="comment__author"
                onClick={() => navigate(`/publicProfile/${comment.author._id}`)}
              >
                {comment.author.username}
              </span>
              <span className="comment__date">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="comment__content">{comment.content}</div>
          </div>
        ))}
      </div>

      {showReplyModal && (
        <div className="modal">
          <div className="modal__content">
            <h3 className="modal__title">發表回覆</h3>
            <textarea
              className="modal__textarea"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="請輸入您的回覆..."
            />
            <div className="modal__buttons">
              <button
                className="modal__button modal__button--cancel"
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyContent("");
                }}
              >
                取消
              </button>
              <button
                className="modal__button modal__button--submit"
                onClick={handleReplySubmit}
                disabled={!replyContent.trim()}
              >
                發送
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetailComponent;
