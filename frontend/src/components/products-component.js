import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/products.css";
import Message from "./common/Message";

const ProductsComponent = (props) => {
  let { currentUser, setCurrentUser } = props;
  const navigate = useNavigate();
  const [beans, setBeans] = useState([]);
  const [filteredBeans, setFilteredBeans] = useState([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

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
            filtered.sort((a, b) => b.soldCount - a.soldCount);
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
        setMessageType("error");
        setTimeout(() => {
          setMessage("");
        }, 2000);
      }
    }
  };

  // 處理搜索提交
  const handleSubmitSearch = (e) => {
    e.preventDefault();

    if (
      searchFilters.minPrice &&
      searchFilters.maxPrice &&
      Number(searchFilters.minPrice) > Number(searchFilters.maxPrice)
    ) {
      setMessage("最低價格不能高於最高價格");
      setMessageType("error");
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
        filtered.sort((a, b) => b.soldCount - a.soldCount);
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
  };

  return (
    <div className="products">
      <h1 className="products__title">All Products</h1>

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
          <div
            className="products__card"
            key={bean._id}
            onClick={() => navigate(`/products/${bean._id}`)}
          >
            <img
              src={`${process.env.REACT_APP_API_URL}${bean.image}`}
              alt={bean.title}
              className="products__image"
            />
            <div className="products__card-content">
              <h5 className="products__card-title">{bean.title}</h5>
              <div className="products__info">
                <span className="products__info-label">{bean.weight}g</span>
                <span className="products__price">$ {bean.price}</span>
              </div>

              <div className="products__store">
                <div className="products__store-info">
                  <p
                    className="products__store-name"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/publicProfile/${bean.store?._id}`);
                    }}
                  >
                    店家：{bean.store?.username || "未知店家"}
                  </p>
                  <p className="products__sales">已售出：{bean.soldCount} 件</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Message message={message} type={messageType} />
    </div>
  );
};

export default ProductsComponent;
