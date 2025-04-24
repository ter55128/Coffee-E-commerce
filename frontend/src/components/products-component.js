import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CartService from "../services/cart-service";
import AuthService from "../services/auth-service";
import "../css/products.css";
import { useCart } from "../context/CartContext";

const ProductsComponent = (props) => {
  let { currentUser, setCurrentUser } = props;
  const navigate = useNavigate();
  const [beans, setBeans] = useState([]);
  const [filteredBeans, setFilteredBeans] = useState([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const { updateCartItemCount } = useCart();
  // 添加 message state
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success 或 danger
  const [messageTimer, setMessageTimer] = useState(null);

  const getAllProducts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/beans/public`
      );
      setBeans(response.data);
      setFilteredBeans(response.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, [currentUser]);

  // 搜索條件狀態
  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "default", // default, price-asc, price-desc, sales
  });

  // 處理搜索條件變更
  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    // 只有排序變更時立即執行過濾
    if (name === "sortBy") {
      setSearchFilters((prev) => {
        const newFilters = {
          ...prev,
          [name]: value,
        };

        let filtered = [...beans];

        // 關鍵字搜索
        if (newFilters.keyword) {
          filtered = filtered.filter(
            (bean) =>
              bean.title
                .toLowerCase()
                .includes(newFilters.keyword.toLowerCase()) ||
              bean.store?.username
                .toLowerCase()
                .includes(newFilters.keyword.toLowerCase())
          );
        }

        // 價格範圍
        if (newFilters.minPrice) {
          filtered = filtered.filter(
            (bean) => bean.price >= Number(newFilters.minPrice)
          );
        }
        if (newFilters.maxPrice) {
          filtered = filtered.filter(
            (bean) => bean.price <= Number(newFilters.maxPrice)
          );
        }

        // 排序
        switch (newFilters.sortBy) {
          case "price-asc":
            filtered.sort((a, b) => a.price - b.price);
            break;
          case "price-desc":
            filtered.sort((a, b) => b.price - a.price);
            break;
          case "sales":
            filtered.sort((a, b) => b.customers.length - a.customers.length);
            break;
          default:
            break;
        }

        setFilteredBeans(filtered);
        return newFilters;
      });
    } else {
      // 對於價格和關鍵字搜索，只更新狀態，不執行過濾
      setSearchFilters((prev) => ({
        ...prev,
        [name]: value,
      }));

      // 價格驗證
      if ((name === "minPrice" || name === "maxPrice") && Number(value) < 0) {
        setMessage("價格不能為負數");
        setMessageType("danger");
        setTimeout(() => {
          setMessage("");
        }, 2000);
      }
    }
  };

  // 處理搜索提交
  const handleSubmitSearch = (e) => {
    e.preventDefault(); // 防止表單默認提交行為

    // 價格範圍驗證
    if (
      searchFilters.minPrice &&
      searchFilters.maxPrice &&
      Number(searchFilters.minPrice) > Number(searchFilters.maxPrice)
    ) {
      setMessage("最低價格不能高於最高價格");
      setMessageType("danger");
      setTimeout(() => {
        setMessage("");
      }, 2000);
      return;
    }

    applyFilters();
  };

  // 應用過濾條件
  const applyFilters = () => {
    let filtered = [...beans];

    // 關鍵字搜索
    if (searchFilters.keyword) {
      filtered = filtered.filter(
        (bean) =>
          bean.title
            .toLowerCase()
            .includes(searchFilters.keyword.toLowerCase()) ||
          bean.store?.username
            .toLowerCase()
            .includes(searchFilters.keyword.toLowerCase())
      );
    }

    // 價格範圍
    if (searchFilters.minPrice) {
      filtered = filtered.filter(
        (bean) => bean.price >= Number(searchFilters.minPrice)
      );
    }
    if (searchFilters.maxPrice) {
      filtered = filtered.filter(
        (bean) => bean.price <= Number(searchFilters.maxPrice)
      );
    }

    // 排序
    switch (searchFilters.sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "sales":
        filtered.sort((a, b) => b.customers.length - a.customers.length);
        break;
      default:
        break;
    }

    setFilteredBeans(filtered);
  };

  // 重置過濾條件
  const resetFilters = () => {
    setSearchFilters({
      keyword: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "default",
    });
    setFilteredBeans(beans);
    setMessage("");
    setMessageType("");
    setMessageTimer(null);
  };

  const handletoaddTocart = async (beanID) => {
    try {
      if (!currentUser) {
        setMessage("請先登入");
        setMessageType("danger");
        setTimeout(() => {
          setMessage("");
          navigate("/login");
        }, 2000);
        return;
      }
      if (currentUser && currentUser.user.role === "store") {
        setMessage("商家無法使用此功能，請使用一般帳號登入");
        setMessageType("danger");
        setTimeout(() => {
          AuthService.logout();
          setCurrentUser(null);
          navigate("/login");
        }, 2000);
        return;
      }

      const response = await CartService.addToCart(beanID);

      if (response.data) {
        setMessage("成功加入購物車！");
        setMessageType("success");
        setTimeout(() => {
          setMessage("");
        }, 2000);

        try {
          const cartResponse = await CartService.getCart();
          const total = cartResponse.data.items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );
          updateCartItemCount(total);
        } catch (error) {
          console.error("更新購物車數量失敗:", error);
        }
      }
    } catch (e) {
      console.log(e);
      if (e.response?.status === 400) {
        setMessage(e.response.data.message);
      } else {
        setMessage("加入購物車失敗，請稍後再試");
      }
      setMessageType("danger");
      setTimeout(() => {
        setMessage("");
      }, 2000);
    }
  };
  const handleLogout = () => {
    AuthService.logout();
    setMessage("請使用一般會員登入");
    setMessageType("danger");
    setTimeout(() => {
      setMessage("");
      setCurrentUser(null);
      navigate("/login");
    }, 2000);
  };

  const handleDetail = (beanId) => {
    navigate(`/products/${beanId}`);
  };

  return (
    <div className="products">
      <h1 className="products__title">All Products</h1>

      {/* 添加 message 顯示 */}
      {message && (
        <div
          className={`products__alert ${
            messageType === "success"
              ? "products__alert--success"
              : "products__alert--danger"
          }`}
        >
          {message}
        </div>
      )}

      {/* 將過濾區域改為表單 */}
      <form onSubmit={handleSubmitSearch} className="products__filters">
        <div className="products__search-row">
          <div className="products__search">
            <input
              type="text"
              name="keyword"
              value={searchFilters.keyword}
              onChange={handleFilterChange}
              placeholder="搜尋商品名稱或店家..."
              className="products__search-input"
            />
          </div>

          <div className="products__filter-buttons">
            <button type="submit" className="products__filter-submit">
              搜尋
            </button>
            <button
              type="button"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`products__filter-more ${
                showMoreFilters ? "products__filter-more--active" : ""
              }`}
            >
              <i
                className={`fas ${
                  showMoreFilters ? "fa-chevron-up" : "fa-sliders"
                }`}
              ></i>
            </button>
          </div>
        </div>

        <div
          className={`products__more-filters ${
            showMoreFilters ? "products__more-filters--show" : ""
          }`}
        >
          <div className="products__filter-group">
            <input
              type="number"
              name="minPrice"
              value={searchFilters.minPrice}
              onChange={handleFilterChange}
              placeholder="最低價格"
              className="products__price-input"
              min="0"
              onWheel={(e) => e.target.blur()}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmitSearch(e);
                }
              }}
            />
            <span className="products__price-separator">-</span>
            <input
              type="number"
              name="maxPrice"
              value={searchFilters.maxPrice}
              onChange={handleFilterChange}
              placeholder="最高價格"
              className="products__price-input"
              min="0"
              onWheel={(e) => e.target.blur()}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmitSearch(e);
                }
              }}
            />
          </div>

          <select
            name="sortBy"
            value={searchFilters.sortBy}
            onChange={handleFilterChange}
            className="products__sort-select"
          >
            <option value="default">預設排序</option>
            <option value="price-asc">價格由低到高</option>
            <option value="price-desc">價格由高到低</option>
            <option value="sales">銷量優先</option>
          </select>
          <button
            type="button"
            onClick={resetFilters}
            className="products__filter-reset"
          >
            重置
          </button>
        </div>
      </form>

      {/* 顯示過濾後的商品數量 */}
      <div className="products__result-count">
        共找到 {filteredBeans.length} 項商品
      </div>

      <div className="products__grid">
        {filteredBeans.map((bean) => (
          <div className="products__card" key={bean._id}>
            <img
              src={`${process.env.REACT_APP_API_URL}${bean.image}`}
              alt={bean.title}
              className="products__image"
            />
            <div className="products__card-content">
              <h5
                className="products__card-title"
                onClick={() => handleDetail(bean._id)}
              >
                {bean.title}
              </h5>
              <div className="products__info">
                <span className="products__info-label">{bean.weight}g</span>
                <span className="products__price">$ {bean.price}</span>
              </div>

              <div className="products__store">
                <div className="products__store-info">
                  <p className="products__store-name">
                    店家：{bean.store?.username || "未知店家"}
                  </p>
                  <p className="products__sales">
                    已售出：{bean.customers.length} 件
                  </p>
                </div>
                <button
                  className="products__button products__button--detail"
                  onClick={() => handleDetail(bean._id)}
                >
                  了解更多
                </button>
                {currentUser && currentUser.user.role === "store" ? (
                  <button
                    className="products__button products__button--login"
                    onClick={() => handleLogout()}
                  >
                    顧客登入
                  </button>
                ) : (
                  <button
                    className="products__button products__button--cart"
                    onClick={() => handletoaddTocart(bean._id)}
                  >
                    加入購物車
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsComponent;
