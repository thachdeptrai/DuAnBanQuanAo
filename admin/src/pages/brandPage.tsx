import React from "react";
import BrandList from "../Brand/brand"; // Import BrandList component

const BrandPage: React.FC = () => {

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* HEADER - Cố định trên cùng */}

            {/* BODY */}
            <div className="flex flex-1">


                {/* MAIN CONTENT - Chỉ phần này cuộn */}
                <main className="flex-1 bg-gray-50 p-4 overflow-hidden">
                    <div
                        className="h-[calc(100vh-64px)] overflow-y-auto border rounded-xl shadow-sm p-4 bg-white"
                    >
                        {/* Sử dụng BrandList thay vì gọi chính nó */}
                        <BrandList />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default BrandPage;