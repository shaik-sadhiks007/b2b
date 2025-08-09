import React, { useEffect, useState } from 'react';

function AssignPartnerModal({
  open,
  onClose,
  deliveryPartners = [],
  initialPartnerId = '',
  onConfirm
}) {
  const [partnerId, setPartnerId] = useState(initialPartnerId || '');

  useEffect(() => {
    setPartnerId(initialPartnerId || '');
  }, [initialPartnerId, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-sm p-4">
        <h3 className="text-lg font-semibold mb-3">Assign Delivery Partner</h3>
        <div className="space-y-2">
          <label className="block text-sm text-gray-700">Select partner</label>
          <select
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a partner</option>
            {deliveryPartners.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} {p.mobileNumber ? `(${p.mobileNumber})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-md border text-sm text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm && onConfirm(partnerId)}
            disabled={!partnerId}
            className={`px-3 py-1.5 rounded-md text-sm text-white ${partnerId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignPartnerModal;


