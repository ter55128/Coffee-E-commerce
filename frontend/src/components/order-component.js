import React, { useEffect, useState } from "react";
import paymentService from "../services/payment-service";

const OrderComponent = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await paymentService.getOrders(userId);
        setOrders(response.data.orders || []);
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
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2>我的訂單</h2>
      {orders.length === 0 ? (
        <p>目前沒有訂單。</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>訂單編號</th>
              <th>金額</th>
              <th>狀態</th>
              <th>建立時間</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id || order.orderNumber}>
                <td>{order.orderNumber}</td>
                <td>${order.totalAmount}</td>
                <td>{order.status}</td>
                <td>{new Date(order.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderComponent;
