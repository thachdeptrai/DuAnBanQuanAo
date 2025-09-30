import { ChevronRight } from 'lucide-react';
import React from 'react';

// Category Cards
const CategorySection = ({ categories, onCategoryClick }) => {
    const colors = [
      "from-blue-400 to-indigo-500",
      "from-pink-400 to-purple-500",
      "from-yellow-400 to-orange-500",
      "from-green-400 to-teal-500",
      "from-red-400 to-pink-500",
      "from-cyan-400 to-blue-500"
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
              key={category.id}
              onClick={() => onCategoryClick(category.id)}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2"
            >
              <div className={`bg-gradient-to-br ${colors[index % colors.length]} h-64 p-6 flex flex-col justify-end relative`}>
                {category.image && (
                  <img src={category.image} alt={category.name} className="absolute inset-0 w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                <div className="relative z-10 text-white">
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-white/90 mb-4">{category.product_count || 0}+ sản phẩm</p>
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
