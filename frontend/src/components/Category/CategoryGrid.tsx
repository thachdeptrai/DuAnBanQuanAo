import { ChevronRight } from 'lucide-react';
import React from 'react';
const CategorySection = () => {
    const categories = [
        { name: "Thời trang Nam", color: "from-blue-400 to-indigo-500", items: "230+ sản phẩm" },
        { name: "Thời trang Nữ", color: "from-pink-400 to-purple-500", items: "450+ sản phẩm" },
        { name: "Trẻ Em", color: "from-yellow-400 to-orange-500", items: "180+ sản phẩm" },
        { name: "Phụ Kiện", color: "from-green-400 to-teal-500", items: "320+ sản phẩm" }
    ];

    return (
        <section className="container mx-auto px-6 py-16">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Danh Mục Nổi Bật</h2>
                <p className="text-gray-600 text-lg">Khám phá bộ sưu tập đa dạng của chúng tôi</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((category, index) => (
                    <div
                        key={index}
                        className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2"
                    >
                        <div className={`bg-gradient-to-br ${category.color} h-64 p-6 flex flex-col justify-end relative`}>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                            <div className="relative z-10 text-white">
                                <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                                <p className="text-white/90 mb-4">{category.items}</p>
                                <button className="bg-white text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all inline-flex items-center space-x-2 group-hover:scale-105">
                                    <span>Xem Thêm</span>
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CategorySection;
