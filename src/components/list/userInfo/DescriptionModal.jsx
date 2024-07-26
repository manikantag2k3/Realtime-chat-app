import React, { useState } from "react";
import './DescriptionModal.css';

const DescriptionModal = ({ isOpen, onClose, onSave }) => {
  const [newDescription, setNewDescription] = useState("");

  const handleSave = () => {
    onSave(newDescription);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Description</h2>
        <textarea
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Add a description"
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default DescriptionModal;
