import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthService from "../services/auth-service";
import "../css/nav.css";
import { useCart } from "../context/CartContext";
import CartService from "../services/cart-service";
import Message from "./common/Message";

const NavComponent = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItemCount, updateCartItemCount } = useCart();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const userID = currentUser?.user?._id || null;

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setMessage("登出成功！");
    setMessageType("success");
    navigate("/");
    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  useEffect(() => {
    const getCartCount = async () => {
      if (currentUser && currentUser.user.role === "customer") {
        try {
          const response = await CartService.getCart();
          const count = response.data.items.reduce((total, item) => {
            return total + item.quantity;
          }, 0);
          updateCartItemCount(count);
        } catch (error) {
          console.error("獲取購物車數量失敗:", error);
        }
      }
    };

    getCartCount();
  }, [currentUser, updateCartItemCount]);

  useEffect(() => {
    setIsNavCollapsed(true);

    const navbar = document.querySelector(".navbar-collapse");
    if (navbar && navbar.classList.contains("show")) {
      navbar.classList.remove("show");
    }
  }, [location.pathname, handleLogout]);

  return (
    <div className="nav-component">
      <nav className="navbar navbar-expand-md navbar-light">
        <div className="container-fluid adjust">
          <Link
            className={`navbar-brand ${isActive("/") ? "active" : ""}`}
            to="/"
          >
            Brand
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded={!isNavCollapsed}
            aria-label="Toggle navigation"
            onClick={() => setIsNavCollapsed(!isNavCollapsed)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className={`collapse navbar-collapse ${
              !isNavCollapsed ? "show" : ""
            }`}
            id="navbarNav"
          >
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link
                  className={`nav-link  ${
                    isActive("/products") ? "active" : ""
                  }`}
                  to="/products"
                >
                  所有商品
                </Link>
              </li>
              {currentUser && currentUser.user.role === "store" && (
                <li className="nav-item">
                  <Link
                    className={`nav-link  ${
                      isActive("/storeProducts") ? "active" : ""
                    }`}
                    to="/storeProducts"
                  >
                    商品管理
                  </Link>
                </li>
              )}

              <li className="nav-item">
                <Link
                  className={`nav-link  ${
                    isActive("/knowledge") ? "active" : ""
                  }`}
                  to="/knowledge"
                >
                  咖啡知識
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link  ${
                    isActive("/articles") ? "active" : ""
                  }`}
                  to="/articles"
                >
                  咖啡交流
                </Link>
              </li>
            </ul>
            <ul className="navbar-nav ms-auto">
              {currentUser && (
                <li className="nav-item">
                  <Link
                    className={`nav-link icon-link ${
                      isActive("/profile") ? "active" : ""
                    }`}
                    to="/profile"
                  >
                    <i className="fas fa-user"></i>
                    <span className="nav-link-text">個人資料</span>
                  </Link>
                </li>
              )}
              {currentUser && currentUser.user.role === "customer" && (
                <li className="nav-item">
                  <Link
                    className={`nav-link icon-link ${
                      isActive(`/orders/${userID}`) ? "active" : ""
                    }`}
                    to="/orders"
                  >
                    <i className="fa-solid fa-file-lines"></i>
                    <span className="nav-link-text">訂單查詢</span>
                  </Link>
                </li>
              )}

              {currentUser && currentUser.user.role === "customer" && (
                <li className="nav-item cart-item">
                  <Link
                    className={`nav-link icon-link ${
                      isActive("/cart") ? "active" : ""
                    }`}
                    to="/cart"
                  >
                    <i className="fas fa-shopping-cart"></i>
                    <span className="nav-link-text">購物車</span>
                    {cartItemCount > 0 ? (
                      <span className="cart-badge">{cartItemCount}</span>
                    ) : (
                      <span className="cart-badge">0</span>
                    )}
                  </Link>
                </li>
              )}
              {!currentUser && (
                <>
                  <li className="nav-item member-group">
                    <Link
                      className={`nav-link nav-member ${
                        isActive("/login") ? "active" : ""
                      }`}
                      to="/login"
                    >
                      登入
                    </Link>
                  </li>
                  <li className="nav-item member-group">
                    <Link
                      className={`nav-link nav-member ${
                        isActive("/register") ? "active" : ""
                      }`}
                      to="/register"
                    >
                      註冊
                    </Link>
                  </li>
                </>
              )}
              {currentUser && (
                <li className="nav-item">
                  <Link
                    onClick={handleLogout}
                    className="nav-link nav-member"
                    to="/"
                  >
                    登出
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <Message message={message} type={messageType} />
    </div>
  );
};

export default NavComponent;
