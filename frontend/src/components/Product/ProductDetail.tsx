import { useParams } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import React, { useState } from "react"; // 👈 Thêm useState

const ProductDetail = () => {
    const { id } = useParams();

    // 1. Quản lý trạng thái cho Kích thước và Màu sắc được chọn
    const [selectedSize, setSelectedSize] = useState("M"); // Mặc định chọn M
    const [selectedColor, setSelectedColor] = useState("Đen"); // Mặc định chọn Đen

    // Giả lập dữ liệu (sau này thay bằng API)
    const product = {
        id,
        name: "Áo Thun Nam Premium",
        price: "299.000đ",
        oldPrice: "599.000đ",
        rating: 4.8,
        sales: 234,
        description:
            "Áo thun nam Premium với chất liệu cotton cao cấp, co giãn 4 chiều, thấm hút mồ hôi tốt. Thiết kế hiện đại, phù hợp cả đi chơi và đi làm.",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Đen", "Trắng", "Xanh Navy"],
        material: "100% Cotton Organic",
        brand: "Premium Wear",
    };

    return (
        <div className="container mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Ảnh */}
                <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center">
                    {/* Placeholder image */}
                    <ShoppingCart className="w-32 h-32 text-gray-400" />
                </div>

                {/* Thông tin */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>

                    {/* Đánh giá */}
                    <div className="flex items-center space-x-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-5 h-5 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                                    }`}
                            />
                        ))}
                        <span className="text-gray-600">({product.sales} đánh giá)</span>
                    </div>

                    {/* Giá */}
                    <div className="mb-6">
                        <span className="text-3xl font-bold text-indigo-600">{product.price}</span>
                        <span className="text-lg text-gray-400 line-through ml-2">{product.oldPrice}</span>
                    </div>

                    {/* Mô tả */}
                    <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

                    {/* Chọn Kích thước */}
                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Kích thước</h3>
                        <div className="flex space-x-3">
                            {product.sizes.map((size) => {
                                // 2. Kiểm tra trạng thái và áp dụng class
                                const isSelected = size === selectedSize;
                                const buttonClasses = isSelected
                                    ? "bg-indigo-100 border-indigo-600 text-indigo-800" // Sáng, viền đậm hơn
                                    : "border-gray-300 text-gray-700 hover:bg-gray-100"; // Mặc định/Hover

                                return (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)} // Cập nhật trạng thái
                                        className={`border px-4 py-2 rounded-lg transition-all ${buttonClasses}`}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chọn Màu sắc */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-2">Màu sắc</h3>
                        <div className="flex space-x-3">
                            {product.colors.map((color) => {
                                // 3. Kiểm tra trạng thái và áp dụng class
                                const isSelected = color === selectedColor;
                                const spanClasses = isSelected
                                    ? "bg-indigo-100 border-indigo-600 text-indigo-800" // Sáng, viền đậm hơn
                                    : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"; // Mặc định/Hover

                                return (
                                    <span
                                        key={color}
                                        onClick={() => setSelectedColor(color)} // Cập nhật trạng thái
                                        className={`px-4 py-2 border rounded-lg transition-all cursor-pointer ${spanClasses}`}
                                    >
                                        {color}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    <p className="text-gray-600 mb-4">Chất liệu: {product.material}</p>
                    <p className="text-gray-600 mb-6">Thương hiệu: {product.brand}</p>

                    {/* Nút Thêm vào giỏ */}
                    <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center space-x-2">
                        <ShoppingCart className="w-5 h-5" />
                        <span>Thêm vào giỏ</span>
                    </button>

                    {/* Thông tin debug (Optional): */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                        Đã chọn: **{selectedSize}** / **{selectedColor}**
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;