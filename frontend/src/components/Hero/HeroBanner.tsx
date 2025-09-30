import { ChevronRight, Star, TrendingUp } from "lucide-react";
import React from "react";

const HeroBanner = () => {
    return (
        <section className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
            <div className="container mx-auto px-6 py-20">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6 animate-fade-in">
                        <div className="inline-block">
                            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                🔥 Bộ Sưu Tập Mới 2025
                            </span>
                        </div>
                        <h1 className="text-6xl font-bold leading-tight">
                            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Phong Cách
                            </span>
                            <br />
                            <span className="text-gray-800">Đẳng Cấp</span>
                        </h1>
                        <p className="text-xl text-gray-600">
                            Khám phá những xu hướng thời trang mới nhất, nơi phong cách gặp gỡ sự thoải mái
                        </p>
                        <div className="flex space-x-4">
                            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all flex items-center space-x-2 group">
                                <span>Mua Ngay</span>
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="border-2 border-gray-800 text-gray-800 px-8 py-4 rounded-full font-semibold hover:bg-gray-800 hover:text-white hover:scale-105 transition-all">
                                Khám Phá
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="relative w-full h-96 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-3xl overflow-hidden shadow-2xl transform hover:rotate-2 transition-transform">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <div className="w-32 h-32 bg-white/30 backdrop-blur-md rounded-full mx-auto flex items-center justify-center">
                                        <TrendingUp className="w-16 h-16 text-indigo-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-700">Hình ảnh sản phẩm</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating cards */}
                        <div className="absolute -top-6 -right-6 bg-white p-4 rounded-2xl shadow-xl animate-bounce">
                            <div className="flex items-center space-x-2">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                <span className="font-bold text-gray-800">4.9/5</span>
                            </div>
                            <p className="text-sm text-gray-600">15k+ Đánh giá</p>
                        </div>

                        <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 rounded-2xl shadow-xl">
                            <p className="text-2xl font-bold">50% OFF</p>
                            <p className="text-sm">Ưu đãi đặc biệt</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroBanner;
