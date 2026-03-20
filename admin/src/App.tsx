import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProfileAdmin from "./ProfileAdmin/profileAdmin";
import CategoryPage from "./pages/categoryPage";
import UserManagementPage from "./pages/UserManagementPage";
import BrandPage from "./pages/brandPage";
import Header from "./Header/header";
import Sidebar from "./Slidebar/sidebar";

// Component Layout chung cho các trang có header và sidebar
const MainLayout: React.FC<{ children: React.ReactNode; activeLink: string }> = ({ children, activeLink }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* HEADER - Cố định trên cùng */}
      <Header />

      {/* BODY */}
      <div className="flex flex-1">
        {/* SIDEBAR - Cố định bên trái */}
        <div className="w-64 bg-white shadow-md border-r sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
          <Sidebar activeLink={activeLink} />
        </div>

        {/* MAIN CONTENT - Chỉ phần này cuộn */}
        <main className="flex-1 bg-gray-50 p-4 overflow-hidden">
          <div className="h-[calc(100vh-64px)] overflow-y-auto border rounded-xl shadow-sm p-4 bg-white">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Lấy token từ localStorage khi component khởi tạo
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  // Theo dõi localStorage thay đổi để cập nhật token tự động
  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Route /login */}
        <Route
          path="/login"
          element={token ? <Navigate to="/home" replace /> : <LoginPage setToken={setToken} />}
        />

        {/* Route chính với Layout chung */}
        <Route
          path="/home"
          element={
            token ? (
              <MainLayout activeLink="/home">
                <HomePage />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Route Profile */}
        <Route
          path="/profile"
          element={
            token ? (
              <MainLayout activeLink="/profile">
                <ProfileAdmin />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Route Categories */}
        <Route
          path="/categories"
          element={
            token ? (
              <MainLayout activeLink="/categories">
                <CategoryPage />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Route Brand Management */}
        <Route
          path="/brand-management"
          element={
            token ? (
              <MainLayout activeLink="/brand-management">
                <BrandPage />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Các route khác từ sidebar */}
        <Route
          path="/orders"
          element={
            token ? (
              <MainLayout activeLink="/orders">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Trang Đơn hàng</h1>
                  <p className="text-gray-600">Quản lý đơn hàng của bạn</p>
                </div>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/products"
          element={
            token ? (
              <MainLayout activeLink="/products">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Trang Sản phẩm</h1>
                  <p className="text-gray-600">Quản lý sản phẩm của bạn</p>
                </div>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/marketing"
          element={
            token ? (
              <MainLayout activeLink="/marketing">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Trang Marketing</h1>
                  <p className="text-gray-600">Chiến dịch marketing</p>
                </div>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/affiliate"
          element={
            token ? (
              <MainLayout activeLink="/affiliate">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Trang Liên kết</h1>
                  <p className="text-gray-600">Quản lý affiliate</p>
                </div>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/live-video"
          element={
            token ? (
              <MainLayout activeLink="/live-video">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Trang LIVE và video</h1>
                  <p className="text-gray-600">Quản lý live stream và video</p>
                </div>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/growth"
          element={
            token ? (
              <MainLayout activeLink="/growth">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Trang Phát triển</h1>
                  <p className="text-gray-600">Phân tích tăng trưởng</p>
                </div>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/data-compass"
          element={
            token ? (
              <MainLayout activeLink="/data-compass">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">La bàn dữ liệu</h1>
                  <p className="text-gray-600">Phân tích dữ liệu tổng quan</p>
                </div>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/account-status"
          element={
            token ? (
              <MainLayout activeLink="/account-status">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Tình trạng tài khoản</h1>
                  <p className="text-gray-600">Kiểm tra trạng thái tài khoản</p>
                </div>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/finance"
          element={
            token ? (
              <MainLayout activeLink="/finance">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Tài chính</h1>
                  <p className="text-gray-600">Quản lý tài chính</p>
                </div>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/academy"
          element={
            token ? (
              <MainLayout activeLink="/academy">
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">Học viện</h1>
                  <p className="text-gray-600">Khóa học và đào tạo</p>
                </div>
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* =============================== */}
        {/* ⭐ ROUTE QUẢN LÍ NGƯỜI DÙNG ⭐ */}
        {/* =============================== */}
        <Route
          path="/user-management"
          element={
            token ? (
              <MainLayout activeLink="/user-management">
                <UserManagementPage />
              </MainLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Route mặc định - chuyển hướng về /home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Route không tồn tại - chuyển hướng về /home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;