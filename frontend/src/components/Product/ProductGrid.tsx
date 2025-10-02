import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import React from "react";

const ProductGrid = () => {
    const products = [
        { id: 1, name: "Áo Thun Nam Premium", price: "299.000đ", oldPrice: "599.000đ", rating: 4.8, sales: 234 },
        { id: 2, name: "Váy Dạ Hội Sang Trọng", price: "1.299.000đ", oldPrice: "2.599.000đ", rating: 4.9, sales: 156 },
        { id: 3, name: "Quần Jean Slim Fit", price: "499.000đ", oldPrice: "899.000đ", rating: 4.7, sales: 189 },
        { id: 4, name: "Áo Sơ Mi Công Sở", price: "399.000đ", oldPrice: "699.000đ", rating: 4.6, sales: 278 },
        { id: 5, name: "Đầm Dự Tiệc Elegant", price: "899.000đ", oldPrice: "1.799.000đ", rating: 4.9, sales: 145 },
        { id: 6, name: "Áo Khoác Hoodie", price: "599.000đ", oldPrice: "999.000đ", rating: 4.8, sales: 312 },
        { id: 7, name: "Chân Váy Xòe", price: "349.000đ", oldPrice: "649.000đ", rating: 4.5, sales: 198 },
        { id: 8, name: "Quần Short Thể Thao", price: "249.000đ", oldPrice: "449.000đ", rating: 4.7, sales: 267 }
    ];

    return (
        <section className="container mx-auto px-6 py-16 bg-gradient-to-b from-white to-indigo-50/30">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Sản Phẩm Hot Nhất</h2>
                <p className="text-gray-600 text-lg">Những món đồ được yêu thích nhất tháng này</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        to={`/product/${product.id}`}  // ✅ chuyển sang trang chi tiết
                        className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2"
                    >
                        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-500">Hình ảnh sản phẩm</p>
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    type="button"
                                    className="bg-white p-2 rounded-full shadow-lg hover:bg-pink-50 transition-all"
                                    onClick={(e) => e.preventDefault()} // ✅ chặn click này chuyển trang
                                >
                                    <Heart className="w-5 h-5 text-gray-700 hover:text-pink-500" />
                                </button>
                            </div>

                            <div className="absolute top-4 left-4">
                                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                    -50%
                                </span>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end justify-center pb-6">
                                <button
                                    type="button"
                                    className="bg-white text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-indigo-600 hover:text-white transition-all"
                                    onClick={(e) => e.preventDefault()} // ✅ tránh click vào nút thì cũng nhảy trang
                                >
                                    Thêm vào giỏ
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                                {product.name}
                            </h3>

                            <div className="flex items-center space-x-2 mb-3">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < Math.floor(product.rating)
                                                    ? "text-yellow-400 fill-yellow-400"
                                                    : "text-gray-300"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">({product.sales})</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-2xl font-bold text-indigo-600">{product.price}</span>
                                    <span className="text-sm text-gray-400 line-through ml-2">{product.oldPrice}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="text-center mt-12">
                <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all">
                    Xem Tất Cả Sản Phẩm
                </button>
            </div>
        </section>
    );
};

export default ProductGrid;
