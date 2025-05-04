import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BeansService from "../services/beans-service";
import "../css/postProduct.css";
import Message from "./common/Message";

const PostProductComponent = ({ currentUser, setCurrentUser }) => {
  let [title, setTitle] = useState("");
  let [weight, setWeight] = useState("");
  let [cultivar, setCultivar] = useState("");
  let [processing, setProcessing] = useState("");
  let [roast, setRoast] = useState("");
  let [description, setDescription] = useState("");
  let [price, setPrice] = useState(0);
  let [message, setMessage] = useState("");
  let [messageType, setMessageType] = useState("");
  let [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleChangeTitle = (e) => {
    setTitle(e.target.value);
  };
  const handleChangeWeight = (e) => {
    setWeight(e.target.value);
  };
  const handleChangeCultivar = (e) => {
    setCultivar(e.target.value);
  };
  const handleChangeProcessing = (e) => {
    setProcessing(e.target.value);
  };
  const handleChangeRoast = (e) => {
    setRoast(e.target.value);
  };
  const handleChangeDescription = (e) => {
    setDescription(e.target.value);
  };
  const handleChangePrice = (e) => {
    setPrice(e.target.value);
  };
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("weight", weight);
    formData.append("cultivar", cultivar);
    formData.append("processing", processing);
    formData.append("roast", roast);
    formData.append("description", description);
    formData.append("price", price);
    if (image) {
      formData.append("image", image);
    }

    try {
      await BeansService.postBean(formData);
      setMessage("新商品已創建成功");
      setMessageType("success");
      setTimeout(() => {
        navigate("/storeProducts");
      }, 2000);
    } catch (error) {
      setMessage(error.response.data);
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 4000);
    }
  };

  return (
    <div className="postProduct">
      {currentUser && currentUser.user.role !== "store" ? (
        <div className="postProduct__unauthorized">
          <i className="fas fa-lock"></i>
          <p>只有店家可以發布新商品。</p>
        </div>
      ) : (
        currentUser &&
        currentUser.user.role === "store" && (
          <>
            <h2 className="postProduct__title">新增商品</h2>
            <form onSubmit={handleSubmit}>
              <div className="postProduct__group">
                <label className="postProduct__label">商品名稱 (3-100字)</label>
                <input
                  name="title"
                  type="text"
                  className="postProduct__input"
                  onChange={handleChangeTitle}
                  placeholder="請輸入商品名稱"
                />
              </div>

              <div className="postProduct__group">
                <label className="postProduct__label">重量 (50-5000g)</label>
                <input
                  name="weight"
                  type="number"
                  className="postProduct__input"
                  onChange={handleChangeWeight}
                  placeholder="請輸入商品重量"
                />
              </div>

              <div className="postProduct__group">
                <label className="postProduct__label">品種</label>
                <input
                  name="cultivar"
                  type="text"
                  className="postProduct__input"
                  onChange={handleChangeCultivar}
                  placeholder="請輸入咖啡品種"
                />
              </div>

              <div className="postProduct__group">
                <label className="postProduct__label">處理法</label>
                <input
                  name="processing"
                  type="text"
                  className="postProduct__input"
                  onChange={handleChangeProcessing}
                  placeholder="請輸入處理方式"
                />
              </div>

              <div className="postProduct__group">
                <label className="postProduct__label">烘焙程度</label>
                <input
                  name="roast"
                  type="text"
                  className="postProduct__input"
                  onChange={handleChangeRoast}
                  placeholder="請輸入烘焙程度"
                />
              </div>

              <div className="postProduct__group">
                <label className="postProduct__label">
                  產品內容 (10-100字)
                </label>
                <textarea
                  name="description"
                  className="postProduct__input postProduct__textarea"
                  onChange={handleChangeDescription}
                  placeholder="請輸入產品詳細描述。
                  Ex : 風味描述、產區故事、得獎紀錄"
                />
              </div>

              <div className="postProduct__group">
                <label className="postProduct__label">價格 (100-10000)</label>
                <input
                  name="price"
                  type="number"
                  className="postProduct__input"
                  onChange={handleChangePrice}
                  placeholder="請輸入商品價格"
                />
              </div>

              <div className="postProduct__group">
                <label>商品圖片</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="postProduct__input"
                />
              </div>

              <button className="postProduct__button" type="submit">
                發布商品
              </button>
            </form>
          </>
        )
      )}
      <Message message={message} type={messageType} />
    </div>
  );
};

export default PostProductComponent;
