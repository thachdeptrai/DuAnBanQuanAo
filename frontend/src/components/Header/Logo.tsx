import React from 'react';
// Logo Component
const Logo = () => (
    <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">F</span>
        </div>
        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            FashionHub
        </span>
    </div>
);

export default Logo;
