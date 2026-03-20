import React from "react";
import DashboardContent from "../Dashboard/Dashboard";

const HomePage: React.FC = () => {

    return (
        // 1. CONTAINER CHÍNH: Flex column để xếp Header và Body theo chiều dọc
        <div className="flex flex-col min-h-screen bg-gray-50">


            {/* 2.2. MAIN CONTENT (Nội dung chính cuộn) */}
            <main
                className="flex-1 overflow-y-auto" // Quan trọng: Cho phép nội dung cuộn
                style={{}}
            >
                {/* Tích hợp component Dashboard đã sửa đổi */}
                <DashboardContent />
            </main>
        </div>
    );
};

export default HomePage;
