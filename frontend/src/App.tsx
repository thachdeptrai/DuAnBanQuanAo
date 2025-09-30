import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";

import Home from "./pages/Home";
import ProductDetail from "./components/Product/ProductDetail";
import ProductDetailPage from "./pages/ProductDeltaiPage";
import Product from "./pages/ProductDeltaiPage";

// ✅ import thêm Header và Footer
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import CartPage from "./pages/CartPage";
import Cart from "./components/Cart/Cart";

function App() {
    return (
        <Router>
            <main style={{ minHeight: "80vh" }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/product-detail" element={<ProductDetail />} />
                    <Route path="/product" element={<Product />} />
                    <Route path="/cart" element={<CartPage />} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;
