import React from 'react';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = "Confirm Delete", 
    message = "Are you sure you want to delete this item?" 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">🗑️</span>
                    <h2 className="text-lg font-semibold">{title}</h2>
                </div>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal; 