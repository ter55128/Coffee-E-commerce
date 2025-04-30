import React, { useEffect, useState } from "react";
import paymentService from "../services/payment-service";
import AuthService from "../services/auth-service";
import { useParams, useNavigate } from "react-router-dom";
import Message from "./common/Message";
import "../css/order.css";

const OrderComponent = ({ currentUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const { userId } = useParams();
  const navigate = useNavigate();

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
        setError("");
        const response = await paymentService.getOrders(userId);

        setOrders(response.data || []);
      } catch (err) {
        setError("取得訂單資料失敗");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  if (loading) return <div>載入中...</div>;
  if (!currentUser) {
    return (
      <div>
        <Message message={message} type={messageType} />
      </div>
    );
  }

  return (
    <div className="order-container">
      <h2>我的訂單</h2>
      {orders.length === 0 ? (
        <p className="order-empty">目前沒有訂單。</p>
      ) : (
        <table className="order-table">
          <thead>
            <tr>
              <th>訂單編號</th>
              <th>金額</th>
              <th>狀態</th>
              <th>建立時間</th>
              <th>付款方式</th>
              <th>付款時間</th>
              <th>交易編號</th>
              <th>訂單資訊</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id || order.orderNumber}>
                <td>{order.orderNumber}</td>
                <td>${order.totalAmount}</td>
                <td>{order.status}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
                <td>{order.paymentType}</td>
                <td>{order.paymentTime}</td>
                <td>{order.tradeNo}</td>
                <td>
                  <button onClick={() => navigate(`/orders/${order._id}`)}>
                    查看訂單
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Message message={message} type={messageType} />
    </div>
  );
};

export default OrderComponent;
