// main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Sẽ tạo file App.tsx để chứa Header và Routing


const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element with id 'root'.");
}