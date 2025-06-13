import React from "react";

export default function KitchenLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="p-4 bg-blue-800 text-white text-xl font-semibold">
        🍳 Kitchen Dashboard
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
