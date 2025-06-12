import { Link, useLocation } from "react-router-dom";
import React from "react";

const links = [
  { name: "Analytics", path: "/admin/analytics" },
  { name: "Menu", path: "/admin/menu" },
  { name: "Categories", path: "/admin/categories" },
  { name: "Tables", path: "/admin/tables" },
  { name: "Orders", path: "/admin/orders" },
  { name: "Payment", path: "/admin/payment" },
];

const Sidebar = () => {
  const { pathname } = useLocation();

  return (
    <aside className="w-64 bg-white h-screen shadow-md fixed">
      <div className="p-4 font-bold text-xl border-b">DineFlow Admin</div>
      <nav className="mt-4">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`block px-6 py-3 hover:bg-gray-100 ${
              pathname === link.path ? "bg-gray-200 font-medium" : ""
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
