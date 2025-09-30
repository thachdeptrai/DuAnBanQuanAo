import { Heart, ShoppingCart, Star } from "lucide-react";
import React from "react";
  
  // Product Grid
  const ProductGrid = ({ products, onAddToCart, onAddToWishlist }) => {
    if (!products || products.length === 0) {
      return (
        <section className="container mx-auto px-6 py-16">
          <div className="text-center text-gray-500">
            <p className="text-xl">Không có sản phẩm nào</p>
          </div>
        </section>
      );
    }
  
    return (
      <section className="container mx-auto px-6 py-16 bg-gradient-to-b from-white to-indigo-50/30">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Sản Phẩm Hot Nhất</h2>
          <p className="text-gray-600 text-lg">Những món đồ được yêu thích nhất tháng này</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const discount = product.old_price && product.price 
              ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
              : 0;
  
            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-2"
              >
                <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Hình ảnh sản phẩm</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => onAddToWishlist(product)}
                      className="bg-white p-2 rounded-full shadow-lg hover:bg-pink-50 transition-all"
                    >
                      <Heart className="w-5 h-5 text-gray-700 hover:text-pink-500" />
                    </button>
                  </div>
                  
                  {discount > 0 && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        -{discount}%
                      </span>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end justify-center pb-6">
                    <button 
                      onClick={() => onAddToCart(product)}
                      className="bg-white text-gray-800 px-6 py-2 rounded-full font-semibold hover:bg-indigo-600 hover:text-white transition-all"
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
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating || 0)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">({product.sales || 0})</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-indigo-600">
                        {product.price?.toLocaleString('vi-VN')}đ
                      </span>
                      {product.old_price && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          {product.old_price.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
