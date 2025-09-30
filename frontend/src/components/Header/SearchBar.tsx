import React from 'react';
import { Search } from 'lucide-react';
const SearchBar = () => (
    <div className="relative w-full max-w-xl group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
        <input
            type="text"
            placeholder="Tìm kiếm sản phẩm, thương hiệu..."
            className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-indigo-500 focus:outline-none transition-all bg-white/50 backdrop-blur-sm hover:bg-white hover:shadow-lg"
        />
    </div>
);
export default SearchBar;
