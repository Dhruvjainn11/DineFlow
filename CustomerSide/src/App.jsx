import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrderPage from "./pages/OrderPage";
import PaymentPage from "./pages/PaymentPage";
import "./index.css"; // Tailwind CSS styles

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/cafe/:cafeId/table/:tableId" element={<MenuPage />} />
        <Route path="/cafe/:cafeId/table/:tableId/cart" element={<CartPage />} />
        <Route path="/cafe/:cafeId/table/:tableId/orders" element={<OrderPage />} />
        <Route path="/cafe/:cafeId/table/:tableId/payment" element={<PaymentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
