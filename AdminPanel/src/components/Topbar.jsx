import React from "react";

const Topbar = () => {
  return (
    <div className="w-full h-16 bg-white shadow-md flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">Admin Panel</h2>
      <button className="text-sm bg-red-500 text-white px-4 py-2 rounded">Logout</button>
    </div>
  );
};

export default Topbar;
