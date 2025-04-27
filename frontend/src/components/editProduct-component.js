import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import BeansService from "../services/beans-service";
import "../css/editProduct.css";
import Message from "./common/message";
import Modal from "./common/modal";

const EditProductComponent = ({ currentUser }) => {
  const navigate = useNavigate();
  const { beanId } = useParams();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [beanData, setBeanData] = useState({
    title: "",
    weight: "",
    cultivar: "",
    processing: "",
    roast: "",
    description: "",
    price: "",
    image: null,
  });

  useEffect(() => {
    if (location.state) {
      setBeanData(location.state.beanData);
      if (location.state.beanData.image) {
        setImagePreview(
          `${process.env.REACT_APP_API_URL}${location.state.beanData.image}`
        );
      }
      setLoading(false);
    } else {
      const loadBeanData = async () => {
        try {
          const response = await BeansService.getBeanById(beanId);
          setBeanData(response.data);
          if (response.data.image) {
            setImagePreview(
              `${process.env.REACT_APP_API_URL}${response.data.image}`
            );
          }
          setLoading(false);
        } catch (error) {
          setMessage("載入商品資料失敗");
          setMessageType("danger");
          setTimeout(() => {
            setMessage("");
          }, 2000);
          setLoading(false);
        }
      };
      loadBeanData();
    }
  }, [beanId, location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBeanData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBeanData((prev) => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();

      // 添加所有欄位到 FormData
      Object.keys(beanData).forEach((key) => {
        if (key === "image" && beanData[key] instanceof File) {
          formData.append("image", beanData[key]);
        } else if (key !== "image") {
          formData.append(key, beanData[key]);
        }
      });

      await BeansService.updateBean(beanData._id, formData);
      setMessage("商品更新成功");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
        navigate("/storeProducts");
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data || "更新失敗");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  };

  const handleDelete = async () => {
    try {
      await BeansService.deleteBean(beanData._id);
      setIsModalOpen(false);
      setMessage("商品已成功刪除！");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
        navigate("/storeProducts");
      }, 2000);
    } catch (error) {
      setIsModalOpen(false);
      setMessage("刪除失敗，請稍後再試");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  };
  if (loading) {
    return <div className="editproduct__loading">載入中...</div>;
  }

  return (
    <div className="editproduct">
      <div className="editproduct__card">
        <div className="editproduct__card-header">
          <h2 className="editproduct__title">編輯商品</h2>
          <button
            type="button"
            className="editproduct__delete-button"
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="editproduct__form">
          <div className="editproduct__form-group">
            <label className="editproduct__label">商品圖片</label>
            <div className="editproduct__image">
              {imagePreview && (
                <div className="editproduct__image-preview">
                  <img
                    src={imagePreview}
                    alt="商品預覽"
                    className="editproduct__image-preview-img"
                  />
                </div>
              )}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="editproduct__input"
              />
              <small className="editproduct__hint">
                支援的格式：JPG、PNG、GIF（最大 5MB）
              </small>
            </div>
          </div>

          <div className="editproduct__form-group">
            <label className="editproduct__label">商品名稱</label>
            <input
              type="text"
              name="title"
              className="editproduct__input"
              value={beanData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="editproduct__form-row">
            <div className="editproduct__form-group">
              <label className="editproduct__label">重量 (g)</label>
              <input
                type="number"
                name="weight"
                className="editproduct__input"
                value={beanData.weight}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="editproduct__form-group">
              <label className="editproduct__label">價格</label>
              <input
                type="number"
                name="price"
                className="editproduct__input"
                value={beanData.price}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="editproduct__form-row">
            <div className="editproduct__form-group">
              <label className="editproduct__label">品種</label>
              <input
                type="text"
                name="cultivar"
                className="editproduct__input"
                value={beanData.cultivar}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="editproduct__form-group">
              <label className="editproduct__label">處理法</label>
              <input
                type="text"
                name="processing"
                className="editproduct__input"
                value={beanData.processing}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="editproduct__form-group">
            <label className="editproduct__label">烘焙程度</label>
            <input
              type="text"
              name="roast"
              className="editproduct__input"
              value={beanData.roast}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="editproduct__form-group">
            <label className="editproduct__label">商品描述</label>
            <textarea
              name="description"
              className="editproduct__input editproduct__textarea"
              value={beanData.description}
              onChange={handleInputChange}
              rows="4"
            />
          </div>

          <div className="editproduct__actions">
            <button
              type="submit"
              className="editproduct__button editproduct__button--submit"
            >
              更新商品
            </button>
            <button
              type="button"
              className="editproduct__button editproduct__button--cancel"
              onClick={() => navigate("/storeProducts")}
            >
              取消
            </button>
          </div>
        </form>
      </div>
      {message && (
        <Message
          message={message}
          type={messageType}
          onClose={() => setMessage("")}
        />
      )}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message="確認要刪除商品嗎？此操作無法復原"
        confirmText="刪除"
        onConfirm={handleDelete}
        cancelText="取消"
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default EditProductComponent;
