import React, { useEffect, useState } from "react";
import paymentService from "../services/payment-service";
import { useNavigate } from "react-router-dom";
import Message from "./common/Message";
import "../css/orders.css";

const OrderComponent = ({ currentUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  const findStatus = (orders) => {
    if (orders.some((order) => order.status === "pending")) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!currentUser) {
          setMessage("請先登入");
          setMessageType("error");
          setTimeout(() => {
            setMessage("");
            setMessageType("");
            navigate("/login");
          }, 2000);
          return;
        }
        setLoading(true);
        const response = await paymentService.getOrders(currentUser.user._id);
        setOrders(response.data || []);
        console.log(response.data);
      } catch (err) {
        setMessage(err.response.data.message || "取得訂單資料失敗");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, navigate]);

  if (loading) return <div>載入中...</div>;
  if (!currentUser) {
    return (
      <div>
        <Message message={message} type={messageType} />
      </div>
    );
  }

  return (
    <div className="order">
      <div className="order-container">
        <h2>我的訂單</h2>
        {findStatus(orders) && (
          <div className="order-status-description">有訂單尚未完成付款</div>
        )}
        {orders.length === 0 ? (
          <div className="order-empty-container">
            <p className="order-empty">目前沒有訂單</p>
            <button
              className="order-empty-button"
              onClick={() => navigate("/products")}
            >
              立即購物
            </button>
          </div>
        ) : (
          <table className="order-table">
            <thead>
              <tr>
                <th>訂單編號</th>
                <th>金額</th>
                <th className="order-paid">狀態</th>
                <th className="order-time">訂單時間</th>
                <th>訂單資訊</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id || order.orderNumber}>
                  <td>{order.orderNumber}</td>
                  <td
                    className={
                      order.status === "paid" ? "order-paid" : "order-unpaid"
                    }
                  >
                    ${order.totalAmount}
                  </td>
                  <td
                    className={
                      order.status === "paid" ? "order-paid" : "order-unpaid"
                    }
                  >
                    {order.status === "paid" ? "已付款" : "未付款"}
                  </td>
                  <td className="order-time">
                    {new Date(order.createdAt).toLocaleString()}
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        navigate(`/orders/${order._id}`, {
                          state: { orderDetail: order },
                        })
                      }
                    >
                      查看訂單
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Message message={message} type={messageType} />
    </div>
  );
};

export default OrderComponent;
