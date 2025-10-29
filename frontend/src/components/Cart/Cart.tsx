// File: src/components/Cart.tsx (Chỉnh sửa)

import React, { useState } from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
// 💡 Import component mới
import CartProduct from "../Ui/CartProduct"; // Thay đổi đường dẫn nếu cần

// Định nghĩa Interface cho item trong giỏ hàng (giữ nguyên hoặc import từ CartProduct)
interface CartItem {
    id: number;
    name: string;
    price: number;
    oldPrice?: number;
    quantity: number;
    image?: string;
}

// 1. Định nghĩa Interface cho Props của Cart component
interface CartProps {
    onCloseCart?: () => void;
}

// 2. Định nghĩa component với props
const Cart: React.FC<CartProps> = ({ onCloseCart }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([
        { id: 1, name: "Áo Thun Nam Premium", price: 299000, oldPrice: 599000, quantity: 2 },
        { id: 2, name: "Váy Dạ Hội Sang Trọng", price: 1299000, oldPrice: 2599000, quantity: 1 },
        { id: 3, name: "Quần Jean Slim Fit", price: 499000, oldPrice: 899000, quantity: 3 },
        { id: 4, name: "Áo Sơ Mi Công Sở", price: 399000, oldPrice: 699000, quantity: 1 }
    ]);

    const SHIPPING_FEE = 30000;

    const updateQuantity = (id: number, newQuantity: number) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(newQuantity, 1) } : item
            )
        );
    };

    const removeItem = (id: number) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    // Hàm định dạng tiền tệ (VD: 1.234.567đ)
    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined) return "";
        return amount.toLocaleString('vi-VN') + 'đ';
    };

    // 🌟 LOGIC QUAN TRỌNG: Xác định chế độ hiển thị
    const isSidebarView = !!onCloseCart;
    const isPageView = !isSidebarView;

    // --- JSX chung cho Cart Item ---
    // 💡 SỬ DỤNG COMPONENT MỚI CARTPRODUCT
    const CartItemsList = (
        <div className={isPageView ? "space-y-6" : "space-y-4"}>
            {cartItems.map((item) => (
                <CartProduct
                    key={item.id}
                    item={item}
                    isPageView={isPageView}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                    formatCurrency={formatCurrency}
                />
            ))}
        </div>
    );

    // ... (Các phần ProductImages và OrderSummary còn lại giữ nguyên)
    const ProductImages = (
        <div className="mt-6 grid grid-cols-4 gap-4">
            {cartItems.map((item) => (
                <div key={item.id} className="w-full h-24 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                    <img
                        src={item.image || "https://via.placeholder.com/100"}
                        alt={item.name}
                        className="object-cover w-full h-full"
                    />
                </div>
            ))}
        </div>
    );

    const OrderSummary = (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 h-fit">
            <h3 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h3>
            <div className="flex justify-between text-gray-600 mb-2">
                <span>Tạm tính:</span>
                <span>{formatCurrency(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-gray-600 mb-4">
                <span>Phí vận chuyển:</span>
                <span>{formatCurrency(SHIPPING_FEE)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-800 border-t pt-4">
                <span>Tổng cộng:</span>
                <span className="text-indigo-600">{formatCurrency(totalPrice + SHIPPING_FEE)}</span>
            </div>

            <button className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-xl transition">
                Thanh toán ngay
            </button>

            {/* Nút Tiếp tục mua sắm chỉ hiển thị trong Sidebar View */}
            {isSidebarView && (
                <button
                    onClick={onCloseCart}
                    className="mt-3 w-full border border-gray-300 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                    Tiếp tục mua sắm
                </button>
            )}
            {/* Trong Page View, nút này thường không cần thiết hoặc được thay thế bằng Link */}
        </div>
    );

    // -------------------------------------------------------------
    // 🌟 KHỐI RETURN CHÍNH: Thay đổi layout dựa trên isPageView
    // -------------------------------------------------------------

    if (cartItems.length === 0) {
        // ... (Logic giỏ hàng trống giữ nguyên)
        return (
            <div className={`text-center ${isPageView ? 'py-40' : 'py-20'} w-full`}>
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-xl font-medium">Giỏ hàng đang trống!</p>
                {isSidebarView && (
                    <button
                        onClick={onCloseCart}
                        className="mt-6 text-indigo-600 font-semibold hover:text-indigo-800 transition text-lg"
                    >
                        Tiếp tục mua sắm ngay
                    </button>
                )}
            </div>
        );
    }


    if (isPageView) {
        // --- PAGE VIEW (Layout 2 cột lớn) ---
        return (
            <div className="container mx-auto px-6 py-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-8">🛒 Giỏ hàng của bạn</h2>
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Danh sách sản phẩm (2/3 cột) */}
                    <div className="lg:col-span-2">
                        <div className="lg:col-span-2">
                            {CartItemsList}
                            {ProductImages}
                        </div>
                    </div>
                    {/* Tổng cộng (1/3 cột) */}
                    <div className="lg:col-span-1">
                        {OrderSummary}
                    </div>
                </div>
            </div>
        );
    } else {
        // --- SIDEBAR VIEW (Layout 1 cột nhỏ, tràn chiều cao) ---
        return (
            <div className="flex flex-col h-full">
                {/* Danh sách sản phẩm (cuộn) */}
                <div className="flex-1 overflow-y-auto p-4">
                    {CartItemsList}
                </div>
                {/* Tổng cộng (fixed ở dưới) */}
                {OrderSummary}
            </div>
        );
    }
};

export default Cart;