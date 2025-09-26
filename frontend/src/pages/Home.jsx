import React, { useState } from 'react';

// Simple SVG Icons
const ShoppingCart = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m-2.4 8L3 3H1M7 13L5.4 5M7 13l-2.293 2.293c-.39.39-.39 1.023 0 1.414L6.414 17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6" />
  </svg>
);

const User = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Search = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Menu = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const Star = ({ className }) => (
  <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const Heart = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const Eye = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const FashionShopHome = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Sample data
  const categories = [
    { id: 1, name: 'Áo nam', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop', count: '120+ sản phẩm' },
    { id: 2, name: 'Áo nữ', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=200&fit=crop', count: '80+ sản phẩm' },
    { id: 3, name: 'Quần nam', image: 'https://images.unsplash.com/photo-1506629905607-cc210cedda36?w=300&h=200&fit=crop', count: '95+ sản phẩm' },
    { id: 4, name: 'Quần nữ', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=200&fit=crop', count: '65+ sản phẩm' },
  ];

  const featuredProducts = [
    { id: 1, name: 'Áo sơ mi nam cao cấp', price: '450.000₫', originalPrice: '600.000₫', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=300&fit=crop', rating: 4.8, discount: '25%' },
    { id: 2, name: 'Váy maxi nữ sang trọng', price: '680.000₫', originalPrice: '850.000₫', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop', rating: 4.9, discount: '20%' },
    { id: 3, name: 'Quần jean nam slim fit', price: '520.000₫', originalPrice: '650.000₫', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop', rating: 4.7, discount: '20%' },
    { id: 4, name: 'Áo khoác nữ thu đông', price: '890.000₫', originalPrice: '1.200.000₫', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop', rating: 4.8, discount: '26%' },
  ];

  const addToCart = (productId) => {
    setCartCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50" style={{ margin: 0, padding: 0 }}>
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">SweetShop</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-900 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Trang chủ</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Nam</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Nữ</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Sale</a>
              <a href="#" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-medium">Liên hệ</a>
            </nav>

            {/* Search & Icons */}
            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sản phẩm..." 
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                />
              </div>
              
              <button className="text-gray-500 hover:text-indigo-600">
                <User />
              </button>
              
              <button className="relative text-gray-500 hover:text-indigo-600">
                <ShoppingCart />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              <button 
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                <a href="#" className="text-gray-900 block px-3 py-2 text-base font-medium">Trang chủ</a>
                <a href="#" className="text-gray-500 block px-3 py-2 text-base font-medium">Nam</a>
                <a href="#" className="text-gray-500 block px-3 py-2 text-base font-medium">Nữ</a>
                <a href="#" className="text-gray-500 block px-3 py-2 text-base font-medium">Sale</a>
                <a href="#" className="text-gray-500 block px-3 py-2 text-base font-medium">Liên hệ</a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative h-96 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative text-center px-4">
          <h2 className="text-4xl md:text-6xl font-bold mb-4">Thời Trang 2024</h2>
          <p className="text-xl mb-8">Khám phá bộ sưu tập mới nhất với giá ưu đãi</p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition duration-300">
            Mua Ngay
          </button>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Danh Mục Sản Phẩm</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-30 transition duration-300"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="text-xl font-semibold">{category.name}</h4>
                  <p className="text-sm">{category.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">Sản Phẩm Nổi Bật</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product.id} className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                  />
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    -{product.discount}
                  </span>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition duration-300">
                    <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100 mb-2">
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                    <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-lg font-semibold mb-2 text-gray-800">{product.name}</h4>
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-indigo-600">{product.price}</span>
                      <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => addToCart(product.id)}
                    className="w-full mt-3 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition duration-300"
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold mb-4">Đăng Ký Nhận Tin</h3>
          <p className="text-xl mb-8">Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt</p>
          <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
            <input 
              type="email" 
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button className="bg-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-700 transition duration-300">
              Đăng Ký
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">FashionStore</h4>
              <p className="text-gray-400">Cửa hàng thời trang hàng đầu với những sản phẩm chất lượng cao.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Danh Mục</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Thời trang nam</a></li>
                <li><a href="#" className="hover:text-white">Thời trang nữ</a></li>
                <li><a href="#" className="hover:text-white">Phụ kiện</a></li>
                <li><a href="#" className="hover:text-white">Sale</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Liên hệ</a></li>
                <li><a href="#" className="hover:text-white">Chính sách đổi trả</a></li>
                <li><a href="#" className="hover:text-white">Hướng dẫn mua hàng</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Liên Hệ</h4>
              <div className="space-y-2 text-gray-400">
                <p>📞 0123 456 789</p>
                <p>📧 info@fashionstore.com</p>
                <p>📍 123 Đường ABC, Quận 1, TP.HCM</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FashionStore. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FashionShopHome;