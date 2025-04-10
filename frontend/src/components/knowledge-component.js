import React, { useState } from "react";
import "../css/knowledge.css";

const KnowledgeComponent = () => {
  const [selectedSection, setSelectedSection] = useState(null);

  const knowledgeData = [
    {
      id: 1,
      title: "咖啡豆的處理法",
      icon: "fas fa-mortar-pestle",
      content: [
        {
          subtitle: "日曬處理法",
          description:
            "將咖啡果實直接在陽光下曬乾，過程中不斷翻動，直到果肉乾燥。特點是風味濃郁，果香明顯。",
        },
        {
          subtitle: "水洗處理法",
          description:
            "將咖啡果實的果肉去除，經過發酵後水洗乾淨。特點是口感乾淨，酸質明亮。",
        },
        {
          subtitle: "蜜處理法",
          description:
            "介於日曬和水洗之間的處理方式，保留部分果膠層進行乾燥。特點是甜度較高，風味層次豐富。",
        },
      ],
    },
    {
      id: 2,
      title: "烘焙程度",
      icon: "fas fa-fire",
      content: [
        {
          subtitle: "淺焙",
          description:
            "保留咖啡豆原有的特色，酸質明顯，香氣清新。適合品嚐單品咖啡。",
        },
        {
          subtitle: "中焙",
          description: "平衡了酸質與香氣，風味較為均衡。是最常見的烘焙程度。",
        },
        {
          subtitle: "深焙",
          description: "苦味較重，焦糖香明顯。適合用來製作義式咖啡。",
        },
      ],
    },
    {
      id: 3,
      title: "咖啡品種",
      icon: "fas fa-seedling",
      content: [
        {
          subtitle: "阿拉比卡",
          description: "最常見的優質咖啡品種，風味細緻，香氣優雅。",
        },
        {
          subtitle: "羅布斯塔",
          description: "咖啡因含量較高，風味較為濃烈，常用於義式咖啡。",
        },
        {
          subtitle: "利比瑞卡",
          description: "較為稀有的品種，具有獨特的風味特性。",
        },
      ],
    },
  ];

  const handleCardClick = (section) => {
    setSelectedSection(section);
  };

  const closeModal = () => {
    setSelectedSection(null);
  };

  // 當 modal 開啟時禁止背景滾動
  React.useEffect(() => {
    if (selectedSection) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [selectedSection]);

  return (
    <div className="knowledge">
      <h1 className="knowledge__title">咖啡知識庫</h1>
      <div className="knowledge__grid">
        {knowledgeData.map((section) => (
          <div
            key={section.id}
            className="knowledge__card"
            onClick={() => handleCardClick(section)}
          >
            <div className="knowledge__card-header">
              <i className={`knowledge__card-icon ${section.icon}`}></i>
              <h2 className="knowledge__card-title">{section.title}</h2>
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
            <div className="knowledge__modal-header">
              <div className="knowledge__modal-title">
                <i
                  className={`knowledge__card-icon ${selectedSection.icon}`}
                ></i>
                <h2>{selectedSection.title}</h2>
              </div>
              <button className="knowledge__modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="knowledge__modal-content">
              {selectedSection.content.map((item, index) => (
                <div key={index} className="knowledge__item">
                  <h3 className="knowledge__item-title">{item.subtitle}</h3>
                  <p className="knowledge__item-description">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeComponent;
