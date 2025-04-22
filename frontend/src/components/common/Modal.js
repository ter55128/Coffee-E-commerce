import "./css/Modal.css";

const Modal = ({
  isOpen,
  onClose,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
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
