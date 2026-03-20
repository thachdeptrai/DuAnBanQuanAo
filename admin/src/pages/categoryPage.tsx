import React from "react";
import CategoryManagement from "../Category/category";

const CategoryPage: React.FC = () => {

    return (



        <div className="flex flex-col min-h-screen bg-gray-50">

            {/* MAIN CONTENT - Chỉ phần này cuộn */}
            <main className="flex-1 bg-gray-50 p-4 overflow-hidden">
                <div
                    className="h-[calc(100vh-64px)] overflow-y-auto border rounded-xl shadow-sm p-4 bg-white"
                >
                    <CategoryManagement />
                </div>
            </main>
        </div>
    );
};

export default CategoryPage;
