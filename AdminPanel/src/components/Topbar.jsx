import React from "react";


const Topbar = () => {

  const handleLogout = () => {
    console.log("Logout clicked");
    let token = localStorage.getItem("token");
    if (token) {
      localStorage.removeItem("token"); // Remove token from local storage
      window.location.href = "/login"; // Redirect to login page
    } else {
      console.error("No token found in local storage");
    }

  }
  return (
    <div className="w-full h-16 bg-white shadow-md flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">DineFlow</h2>
      <button onClick={()=>{
      handleLogout(); // Call the logout function when button is clicked
      }} className="text-sm bg-red-500 text-white px-4 py-2 rounded cursor-pointer">Logout</button>
    </div>
  );
};

export default Topbar;
