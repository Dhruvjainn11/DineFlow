import React from "react";


const Topbar = () => {

  const handleLogout = () => {
    console.log("Logout clicked");
    let token = localStorage.getItem("token");
    let cafeId = localStorage.getItem("cafeId");
    if (token) {
      localStorage.removeItem("token"); // Remove token from local storage
      if (cafeId) {
        localStorage.removeItem("cafeId"); // Remove cafeId from local storage
      }
      window.location.href = "/"; // Redirect to login page
    } else {
      console.error("No token found in local storage");
    }

  }
  return (
    <div className="w-full h-16 bg-[#f7f3e8] shadow-md flex items-center justify-between px-6 overflow-hidden">
      <img src="/Annsh.png" alt="Annsh" className="h-32 w-auto object-contain" />
      <button onClick={()=>{
      handleLogout(); // Call the logout function when button is clicked
      }} className="text-sm bg-red-500 text-white px-4 py-2 rounded cursor-pointer">Logout</button>
    </div>
  );
};

export default Topbar;
