import React from "react";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Cart from "../components/Cart/Cart"; // Import component Cart
import ProductGrid from "../components/Product/ProductGrid";

const CartPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* 1. Gọi Cart component mà KHÔNG truyền prop onClose */}
            {/* Vì nó là một trang, không phải modal, bạn muốn Cart hiển thị full nội dung. */}
            <Cart />
            <ProductGrid />
            <Footer />
        </div>
    )
};
export default CartPage;