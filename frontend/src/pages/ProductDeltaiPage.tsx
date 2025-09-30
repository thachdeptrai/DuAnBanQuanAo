import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import ProductDetail from "../components/Product/ProductDetail";
import { Route } from "react-router-dom";

// 1. Correct the component name (e.g., to ProductDetailPage)
const ProductDetailPage = () => {

    return (
        <div className="min-h-screen bg-white">
            <Header /> {/* Will now appear */}
            <ProductDetail />
            <Footer /> {/* Will now appear */}
        </div>
    )
};

// 2. Export the correct page component
export default ProductDetailPage; // <--- This must be the component containing Header and Footer!