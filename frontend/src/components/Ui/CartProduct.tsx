// File: src/components/CartProduct.tsx (Ví dụ)

import React from "react";
import { Trash2 } from "lucide-react";

// Định nghĩa lại Interface CartItem cần thiết
interface CartItem {
    id: number;
    name: string;
    price: number;
    oldPrice?: number;
    quantity: number;
    image?: string;
}

// Định nghĩa Props cho CartProduct
interface CartProductProps {
    item: CartItem;
    isPageView: boolean; // Dùng để điều chỉnh kích thước/layout
    updateQuantity: (id: number, newQuantity: number) => void;
    removeItem: (id: number) => void;
    formatCurrency: (amount: number | undefined) => string;
}

const CartProduct: React.FC<CartProductProps> = ({
    item,
    isPageView,
    updateQuantity,
    removeItem,
    formatCurrency,
}) => {
    // Kích thước font và hình ảnh sẽ tùy chỉnh theo isPageView (giống logic cũ)
    const nameTextSize = isPageView ? 'text-lg' : 'text-sm';
    const imageSize = isPageView ? 'w-20 h-20' : 'w-16 h-16';

    return (
        <div
            className="flex items-center bg-white border border-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition"
        >
            {/* Ảnh sản phẩm */}
            <div className={`${imageSize} bg-gray-100 rounded-md flex items-center justify-center overflow-hidden`}>
                <img
                    src={item.image || "https://via.placeholder.com/64"}
                    alt={item.name}
                    className="object-cover w-full h-full"
                />
            </div>

            {/* Thông tin & Giá */}
            <div className="flex-1 ml-3">
                <h3 className={`font-medium text-gray-800 ${nameTextSize} truncate`}>
                    {item.name}
                </h3>
                <div className="text-indigo-600 font-bold text-base">
                    {formatCurrency(item.price)}
                </div>
                {item.oldPrice && (
                    <div className="text-gray-400 line-through text-xs">
                        {formatCurrency(item.oldPrice)}
                    </div>
                )}
            </div>

            {/* Số lượng và Xóa */}
            <div className="flex flex-col items-end space-y-2">
                <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 transition"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300"
                    >
                        -
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 bg-gray-200 rounded text-sm hover:bg-gray-300"
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartProduct;