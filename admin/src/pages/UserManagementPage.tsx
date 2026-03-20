import React from "react";
import UserManagementPage from "../UserManagement/UserManagement";

const UserManagement: React.FC = () => {

    return (
        // 1. CONTAINER CHÍNH: Flex column để xếp Header và Body theo chiều dọc
        <div className="flex flex-col min-h-screen bg-gray-50">

            <div className="flex flex-1 overflow-hidden">
                {/* 2.2. MAIN CONTENT (Nội dung chính cuộn) */}
                <main
                    className="flex-1 overflow-y-auto" // Quan trọng: Cho phép nội dung cuộn
                    style={{}}
                >
                    {/* Tích hợp component Dashboard đã sửa đổi */}
                    <UserManagementPage />
                </main>
            </div>
        </div>
    );
};

export default UserManagement;
