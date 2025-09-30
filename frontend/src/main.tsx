// main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Sẽ tạo file App.tsx để chứa Header và Routing


// KHỞI TẠO ỨNG DỤNG REACT
// 1. Tìm phần tử DOM gốc (thường là <div id="root"> trong public/index.html)
const rootElement = document.getElementById('root');

if (rootElement) {
  // 2. Tạo React root và render component App
  ReactDOM.createRoot(rootElement).render(
    // StrictMode giúp kiểm tra lỗi và cảnh báo trong quá trình phát triển
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element with id 'root'.");
}