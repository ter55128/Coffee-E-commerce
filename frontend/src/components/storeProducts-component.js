import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BeansService from "../services/beans-service";
import "../css/storeProducts.css";
import Message from "./common/message";

const StoreProductsComponent = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();
  const [beanData, setBeanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    let _id;
    if (currentUser) {
      _id = currentUser.user._id;
      if (currentUser.user.role === "store") {
        BeansService.getStoreBeans(_id)
          .then((data) => {
            setBeanData(data.data);
            setLoading(false);
          })
          .catch((error) => {
            console.log(error);
            setLoading(false);
          });
      }
    }
  }, [currentUser]);

  const handleEditProduct = async (beanId) => {
    try {
      const response = await BeansService.getBeanById(beanId);
      navigate(`/storeProducts/edit/${beanId}`, {
        state: { beanData: response.data },
      });
      setLoading(false);
      console.log(response.data);
    } catch (error) {
      setMessage("載入商品資料失敗");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2000);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="storeProducts__loading">載入中...</div>;
  }

  return (
    <div className="storeProducts">
      {currentUser && currentUser.user.role === "store" && (
        <div className="storeProducts__header">
          <h1 className="storeProducts__title">商品管理</h1>
          <button
            className="storeProducts__button"
            onClick={() => navigate("/storeProducts/post")}
          >
            <i className="fas fa-plus storeProducts__button-icon"></i>
            新增商品
          </button>
        </div>
      )}

      {currentUser && beanData && beanData.length > 0 ? (
        <div className="storeProducts__grid">
          {beanData.map((bean) => (
            <div className="storeProducts__card" key={bean._id}>
              <div className="storeProducts__image-wrapper">
                <img
                  src={`${process.env.REACT_APP_API_URL}${bean.image}`}
                  alt={bean.title}
                  className="storeProducts__image"
                />
              </div>
              <div className="storeProducts__card-content">
                <h5 className="storeProducts__card-title">{bean.title}</h5>
                <div className="storeProducts__price">${bean.price}</div>

                <div className="storeProducts__info">
                  <i className="fas fa-weight storeProducts__info-icon"></i>
                  重量：{bean.weight}g
                </div>

                <div className="storeProducts__info">
                  <i className="fas fa-mortar-pestle storeProducts__info-icon"></i>
                  處理法：{bean.processing}
                </div>

                <div className="storeProducts__info">
                  <i className="fas fa-fire storeProducts__info-icon"></i>
                  烘焙程度：{bean.roast}
                </div>

                <div className="storeProducts__info">
                  <i className="fas fa-seedling storeProducts__info-icon"></i>
                  品種：{bean.cultivar}
                </div>

                <p className="storeProducts__description">{bean.description}</p>

                <div className="storeProducts__sales">
                  <i className="fas fa-chart-line storeProducts__sales-icon"></i>
                  <span>已售出：</span>
                  <span className="storeProducts__sales-count">
                    {bean.customers.length}
                  </span>
                </div>
              </div>

              <button
                className="storeProducts__edit-button"
                onClick={() => handleEditProduct(bean._id)}
              >
                編輯商品
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="storeProducts__empty">目前沒有商品</div>
      )}
      <Message message={message} type={messageType} />
    </div>
  );
};

export default StoreProductsComponent;
