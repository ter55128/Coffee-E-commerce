import React from "react";
import "./css/message.css";

const Message = ({ message, type = "info", onClose }) => {
  if (!message) return null;

  return (
    <div className={`message message--${type}`}>
      <div className="message__content">{message}</div>
    </div>
  );
};

export default Message;
