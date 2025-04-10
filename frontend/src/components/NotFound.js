import React from "react";
import { Link } from "react-router-dom";
import "../css/notFound.css";

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found__container">
        <h1 className="not-found__title">404</h1>
        <h2 className="not-found__subtitle">頁面不存在</h2>
        <p className="not-found__text">
          抱歉，您要尋找的頁面不存在或已被移除。
        </p>
        <Link to="/" className="not-found__link">
          返回首頁
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
