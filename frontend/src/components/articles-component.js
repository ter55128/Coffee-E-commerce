import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/articles.css";
import axios from "axios";

const ArticlesComponent = ({ currentUser }) => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [expandedArticles, setExpandedArticles] = useState({});

  // 搜索條件狀態
  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    sortBy: "default", // default, date-desc, date-asc, comments
  });

  // 處理搜索條件變更
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 處理搜索提交
  const handleSubmitSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  // 應用過濾條件
  const applyFilters = () => {
    let filtered = [...articles];

    // 關鍵字搜索（標題、作者名稱、內容）
    if (searchFilters.keyword) {
      filtered = filtered.filter(
        (article) =>
          article.title
            .toLowerCase()
            .includes(searchFilters.keyword.toLowerCase()) ||
          article.author.username
            .toLowerCase()
            .includes(searchFilters.keyword.toLowerCase()) ||
          article.content
            .toLowerCase()
            .includes(searchFilters.keyword.toLowerCase())
      );
    }

    // 排序
    switch (searchFilters.sortBy) {
      case "date-desc":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "date-asc":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "comments":
        filtered.sort((a, b) => b.comments.length - a.comments.length);
        break;
      default:
        break;
    }

    setFilteredArticles(filtered);
  };

  // 重置過濾條件
  const resetFilters = () => {
    setSearchFilters({
      keyword: "",
      sortBy: "default",
    });
    setFilteredArticles(articles);
  };

  // 獲取所有文章
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/articles/public`
        );
        setArticles(response.data);
        setFilteredArticles(response.data); // 初始化時顯示所有文章
        setLoading(false);
      } catch (error) {
        setMessage("獲取文章失敗");
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const toggleContent = (articleId) => {
    setExpandedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  if (loading) return <div className="loading">載入中...</div>;

  return (
    <div className="articles-list">
      <div className="articles-list__header">
        <h1 className="articles-list__title">咖啡交流區</h1>
        {currentUser && (
          <button
            className="articles-list__button"
            onClick={() => navigate("/articles/post")}
          >
            <i className="articles-list__button-icon fas fa-plus"></i>
            <span>發表文章</span>
          </button>
        )}
      </div>

      {/* 搜索過濾區域 */}
      <form onSubmit={handleSubmitSearch} className="articles-list__filters">
        <div className="articles-list__search">
          <input
            type="text"
            name="keyword"
            value={searchFilters.keyword}
            onChange={handleFilterChange}
            placeholder="搜尋文章標題、作者或內容..."
            className="articles-list__search-input"
          />
        </div>

        <select
          name="sortBy"
          value={searchFilters.sortBy}
          onChange={handleFilterChange}
          className="articles-list__sort-select"
        >
          <option value="default">預設排序</option>
          <option value="date-desc">最新發布</option>
          <option value="date-asc">最早發布</option>
          <option value="comments">留言最多</option>
        </select>

        <div className="articles-list__filter-buttons">
          <button type="submit" className="articles-list__filter-submit">
            搜尋
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="articles-list__filter-reset"
          >
            重置
          </button>
        </div>
      </form>

      {/* 顯示過濾後的文章數量 */}
      <div className="articles-list__result-count">
        共找到 {filteredArticles.length} 篇文章
      </div>

      <div className="articles-list__content">
        {filteredArticles.map((article) => (
          <div key={article._id} className="articles-card">
            <div className="articles-card__header">
              <h3
                className="articles-card__title"
                onClick={() => navigate(`/articles/${article._id}`)}
              >
                {article.title}
              </h3>
              <div className="articles-card__meta">
                <span
                  className="articles-card__author"
                  onClick={() =>
                    navigate(`/publicProfile/${article.author._id}`)
                  }
                >
                  {article.author.username}
                </span>
                <span className="articles-card__date">
                  {new Date(article.createdAt).toLocaleDateString()}
                </span>
                <span>{article.comments.length} 則留言</span>
              </div>
            </div>

            <div
              className={`articles-card__content ${
                !expandedArticles[article._id]
                  ? "articles-card__content--collapsed"
                  : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleContent(article._id);
              }}
            >
              {article.content}
              {expandedArticles[article._id] && (
                <div className="comment" onClick={(e) => e.stopPropagation()}>
                  <h4 className="comment__title">最新留言</h4>
                  {article.comments.length > 0 ? (
                    <div className="comment__item">
                      <div className="comment__meta">
                        <span
                          className="comment__author"
                          onClick={() =>
                            navigate(
                              `/publicProfile/${
                                article.comments[article.comments.length - 1]
                                  .author._id
                              }`
                            )
                          }
                        >
                          {
                            article.comments[article.comments.length - 1].author
                              .username
                          }
                          ：
                          {
                            article.comments[article.comments.length - 1]
                              .content
                          }
                        </span>
                        <span className="comment__date">
                          {new Date(
                            article.comments[
                              article.comments.length - 1
                            ].createdAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="comment--empty">暫無留言</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {message && <div>{message}</div>}
    </div>
  );
};

export default ArticlesComponent;
