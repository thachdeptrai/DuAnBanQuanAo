import React from "react";
import Logo from "../Header/Logo";
const Footer = () => {
    return (
      <footer className="bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Logo />
              <p className="mt-4 text-gray-300">
                Điểm đến tin cậy cho phong cách thời trang của bạn
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Về Chúng Tôi</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="hover:text-white transition-colors cursor-pointer">Giới thiệu</li>
                <li className="hover:text-white transition-colors cursor-pointer">Tin tức</li>
                <li className="hover:text-white transition-colors cursor-pointer">Tuyển dụng</li>
                <li className="hover:text-white transition-colors cursor-pointer">Liên hệ</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Hỗ Trợ</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="hover:text-white transition-colors cursor-pointer">Chính sách đổi trả</li>
                <li className="hover:text-white transition-colors cursor-pointer">Hướng dẫn mua hàng</li>
                <li className="hover:text-white transition-colors cursor-pointer">Thanh toán</li>
                <li className="hover:text-white transition-colors cursor-pointer">Vận chuyển</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-4">Kết Nối</h4>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                  <span className="text-xl">f</span>
                </button>
                <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                  <span className="text-xl">in</span>
                </button>
                <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                  <span className="text-xl">ig</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 FashionHub. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    );
  };

export default Footer;
