import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import OrderPage from "./pages/OrderPage";
import PaymentPage from "./pages/PaymentPage";
import { CafeProvider } from "./context/CafeContext";
import ThemeProvider from "./components/ThemeProvider";
import "./index.css"; // Tailwind CSS styles

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/cafe/:cafeId/table/:tableId/*" element={
          <CafeProvider>
            <AppWithTheme />
          </CafeProvider>
        } />
      </Routes>
    </Router>
  );
}

function AppWithTheme() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<MenuPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrderPage />} />
        <Route path="/payment" element={<PaymentPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
