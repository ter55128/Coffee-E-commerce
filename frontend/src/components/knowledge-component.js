import React, { useState, useEffect, useCallback } from "react";
import KnowledgeService from "../services/knowledge-service";
import "../css/knowledge.css";

const KnowledgeComponent = () => {
  const [titles, setTitles] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contentCache, setContentCache] = useState({});

  // 獲取所有標題
  useEffect(() => {
    const fetchTitles = async () => {
      try {
        const response = await KnowledgeService.getAllTitles();
        setTitles(response.data);
      } catch (error) {
        console.error("Error fetching titles:", error);
      }
    };
    fetchTitles();
  }, []);

  // 點擊卡片時獲取內容
  const handleCardClick = useCallback(
    async (title) => {
      if (loading) return;

      if (contentCache[title]) {
        setSelectedSection(contentCache[title]);
        return;
      }

      setLoading(true);
      try {
        const response = await KnowledgeService.getContent(title);
        setContentCache((prev) => ({
          ...prev,
          [title]: response.data,
        }));
        setSelectedSection(response.data);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    },
    [loading, contentCache]
  );

  const closeModal = () => {
    setSelectedSection(null);
  };

  // 當 modal 開啟時禁止背景滾動
  useEffect(() => {
    if (selectedSection) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedSection]);

  return (
    <div className="knowledge">
      <h1 className="knowledge__title">咖啡知識庫</h1>
      <div className="knowledge__container">
        {titles.map((item) => (
          <div
            key={item.title}
            className="knowledge__card"
            onClick={() => handleCardClick(item.title)}
          >
            <div className="knowledge__card-header">
              <i className={`knowledge__card-icon ${item.icon}`}></i>
              <h2 className="knowledge__card-title">{item.title}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedSection && (
        <div className="knowledge__modal-overlay" onClick={closeModal}>
          <div
            className="knowledge__modal"
            onClick={(e) => e.stopPropagation()}
          >
            {loading ? (
              <div className="knowledge__loading">載入中...</div>
            ) : (
              <>
                <div className="knowledge__modal-header">
                  <div className="knowledge__modal-title">
                    <i
                      className={`knowledge__card-icon ${selectedSection.icon}`}
                    ></i>
                    <h2>{selectedSection.title}</h2>
                  </div>
                  <button
                    className="knowledge__modal-close"
                    onClick={closeModal}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="knowledge__modal-content">
                  {selectedSection.content.map((item, index) => (
                    <div key={index} className="knowledge__item">
                      <h3 className="knowledge__item-title">{item.subtitle}</h3>
                      <p className="knowledge__item-description">
                        {item.description.split("。").map(
                          (sentence, i, arr) =>
                            sentence && (
                              <React.Fragment key={i}>
                                {sentence + (i < arr.length - 1 ? "。" : "")}
                                {i < arr.length - 1 && <br />}
                              </React.Fragment>
                            )
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeComponent;
