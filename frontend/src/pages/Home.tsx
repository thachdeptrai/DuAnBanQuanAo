import { useEffect, useState } from "react";
import Header from "../components/Header/Header";
import HeroBanner from "../components/Hero/HeroBanner.tsx";
import Footer from "../components/Footer/Footer";
import React from "react";
import CategorySection from "../components/Category/CategoryGrid.tsx";
import ProductGrid from "../components/Product/ProductGrid.tsx";


const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [banner, setBanner] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API Base URL - Thay đổi theo URL API của bạn
  const API_BASE_URL = "http://localhost:4000/api"; // Hoặc URL API của bạn

  // Fetch Categories
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchBanner();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err.message);
    }
  };

  const fetchProducts = async (categoryId = null, searchTerm = null) => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/products`;
      const params = new URLSearchParams();

      if (categoryId) params.append("category_id", categoryId);
      if (searchTerm) params.append("search", searchTerm);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBanner = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/banner`);
      if (!response.ok) throw new Error("Failed to fetch banner");
      const data = await response.json();
      setBanner(data);
    } catch (err) {
      console.error("Error fetching banner:", err);
    }
  };

  const handleCategoryClick = (categoryId) => {
    fetchProducts(categoryId);
  };

  const handleSearch = (searchTerm) => {
    fetchProducts(null, searchTerm);
  };

  const handleAddToCart = async (product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");

      setCartCount((prev) => prev + 1);
      alert("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Có lỗi xảy ra khi thêm vào giỏ hàng");
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to add to wishlist");

      alert("Đã thêm vào danh sách yêu thích!");
    } catch (err) {
      console.error("Error adding to wishlist:", err);
      alert("Có lỗi xảy ra khi thêm vào danh sách yêu thích");
    }
  };

  if (error) {
    return (
<<<<<<< HEAD
        <div className="min-h-screen bg-white">
            <Header />
            <HeroBanner />
            <CategorySection />
            <ProductGrid />
            <Footer />

=======
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Lỗi kết nối API
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Vui lòng kiểm tra API URL: {API_BASE_URL}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-700"
          >
            Thử lại
          </button>
>>>>>>> 969e0cc7d6dee4a9c409367d5d34bf42c41e8230
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        categories={categories}
        onSearch={handleSearch}
        onCategoryClick={handleCategoryClick}
        cartCount={cartCount}
      />
      <HeroBanner banner={banner} />
      <CategorySection
        categories={categories}
        onCategoryClick={handleCategoryClick}
      />

      {loading ? (
        <div className="container mx-auto px-6 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      ) : (
        <ProductGrid
          products={products}
          onAddToCart={handleAddToCart}
          onAddToWishlist={handleAddToWishlist}
        />
      )}

      <Footer />
    </div>
  );
};

export default Home;

