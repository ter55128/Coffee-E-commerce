import "./css/modal.css";

const Modal = ({
  isOpen,
  onClose,
  message,
  content,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  onChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        {content !== undefined && (
          <textarea
            className="modal-content-textarea"
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="請輸入內容..."
            autoFocus
          />
        )}
        <div className="modal-buttons">
          <button onClick={onConfirm}>{confirmText || "確認"}</button>
          {onCancel && (
            <button onClick={onCancel}>{cancelText || "取消"}</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
