'''"use client";

import { useState } from "react";

export function SalesEntry({ sale }) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(sale.amount);

  const saleDate = new Date(sale.createdAt);
  const now = new Date();
  const isEditable = (now.getTime() - saleDate.getTime()) / (1000 * 60 * 60) < 24;

  const handleUpdate = () => {
    // Add logic to update the sale via an API call
    console.log("Updating sale:", { ...sale, amount });
    setIsEditing(false);
  };

  const handleDelete = () => {
    // Add logic to delete the sale via an API call
    console.log("Deleting sale:", sale);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
      <div>
        <p className="font-bold">
          {isEditing ? (
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="border rounded px-2 py-1"
            />
          ) : (
            `$${sale.amount.toFixed(2)}`
          )}
        </p>
        <p className="text-sm text-gray-500">Sold to: {sale.customer}</p>
        <p className="text-xs text-gray-400">{saleDate.toLocaleString()}</p>
      </div>
      {isEditable && (
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
'''