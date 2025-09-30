import React from 'react';

// Dữ liệu danh mục cho CategoryGrid
const categories = [
    // Lưu ý: Các đường dẫn ảnh này phải được đặt trong thư mục 'public' 
    // của dự án Vite để được tải đúng cách.
    { name: "Áo", img: "/cate-shirt.jpg" },
    { name: "Quần", img: "/cate-pants.jpg" },
    { name: "Giày", img: "/cate-shoes.jpg" },
    { name: "Phụ kiện", img: "/cate-accessories.jpg" },
];

// Component 1: CategoryGrid
export const CategoryGrid: React.FC = () => {
    return (
        <section className="py-10">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b-2 pb-2">
                Khám Phá Danh Mục Nổi Bật
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map((cat, index) => (
                    <div
                        key={index}
                        className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition duration-300 cursor-pointer transform hover:-translate-y-1"
                    >
                        {/* Ảnh danh mục */}
                        <img
                            src={cat.img}
                            alt={cat.name}
                            // Tăng chiều cao ảnh và sử dụng hiệu ứng scale khi hover
                            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                            // Thêm placeholder để tránh lỗi 404 nếu ảnh chưa có
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://placehold.co/400x300/e0e0e0/5c5c5c?text=${cat.name}`;
                            }}
                        />

                        {/* Overlay hiển thị tên danh mục */}
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-500">
                            <span className="text-white text-2xl font-bold tracking-wider uppercase">
                                {cat.name}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

// Component 2: FlashSaleSection (Mới được thêm)
export const FlashSaleSection: React.FC = () => {
    return (
        <section className="bg-red-50 py-10 rounded-xl shadow-inner my-10">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center mb-6 border-b border-red-200 pb-3">
                    <h2 className="text-3xl font-extrabold text-red-600 flex items-center gap-2">
                        <span role="img" aria-label="Flash Sale">🔥</span>
                        Deal Sốc Giới Hạn
                    </h2>
                    <div className="flex items-center text-lg bg-red-600 text-white px-4 py-2 rounded-full font-mono shadow-md">
                        Kết thúc sau: <span className="ml-2 font-bold">02:15:30</span>
                    </div>
                </div>

                {/* Danh sách sản phẩm Flash Sale */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition duration-300 cursor-pointer"
                        >
                            <img
                                src={`/sale${i}.jpg`}
                                alt={`Sản phẩm sale ${i}`}
                                className="w-full h-40 object-cover mb-3 rounded-lg"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = `https://placehold.co/400x300/fecaca/991b1b?text=SALE+${i}`;
                                }}
                            />
                            <p className="text-sm text-gray-500 line-through">199,000₫</p>
                            <p className="font-extrabold text-xl text-red-600">
                                99,000₫
                            </p>
                            <button className="mt-3 w-full bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition duration-300 transform hover:scale-[1.02]">
                                Mua Ngay
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Thay đổi export default thành export các component riêng biệt
// Hoặc bạn có thể giữ export default cho CategoryGrid nếu bạn thích
export default CategoryGrid; // Giữ nguyên export default cho CategoryGrid
