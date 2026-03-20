// vite.config.ts hoặc vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 💡 Cấu hình bổ sung để khắc phục lỗi "Invalid Hook Call"
  optimizeDeps: {
    // Buộc Vite xử lý trước các gói này để đảm bảo chỉ có một bản sao React
    include: ['react', 'react-dom', 'react-router-dom'], 
  },
  // Nếu vẫn gặp lỗi, hãy thử cấu hình alias
  /*
  resolve: {
    alias: {
      'react': 'path-to-your-node_modules/react',
      'react-dom': 'path-to-your-node_modules/react-dom',
    }
  }
  */
})