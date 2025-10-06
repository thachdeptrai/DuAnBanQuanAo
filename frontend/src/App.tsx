import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ScrollToTop from "./utils/ScrollToTop";

import Home from "./pages/Home";
import ProductDetail from "./components/Product/ProductDetail";
import ProductDetailPage from "./pages/ProductDeltaiPage";

import CartPage from "./pages/CartPage";


function App() {
    return (
        <Router>
            <ScrollToTop />
            <main style={{ minHeight: "80vh" }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/product-detail" element={<ProductDetail />} />
                    <Route path="/cart" element={<CartPage />} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;
