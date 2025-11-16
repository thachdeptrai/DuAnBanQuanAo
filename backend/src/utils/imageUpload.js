// utils/imageUpload.js
import fs from "fs";
import path from "path";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

/**
 * 📸 UPLOAD ẢNH TỪ MÁY LOCAL
 */
export const uploadImage = (file, folder = "general") => {
  return new Promise((resolve, reject) => {
    try {
      if (!file) {
        resolve(null);
        return;
      }

      // Tạo tên file mới
      const ext = path.extname(file.originalname);
      const filename = `${folder}-${uuidv4()}${ext}`;
      const filepath = path.join("uploads", folder, filename);

      // Đảm bảo thư mục tồn tại
      const dir = path.dirname(filepath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Di chuyển file đến thư mục đích
      fs.renameSync(file.path, filepath);

      resolve(filepath);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 🌐 TẢI ẢNH TỪ URL
 */
export const downloadImageFromUrl = async (url, folder = "general") => {
  try {
    if (!url) return null;

    console.log(`📥 Đang tải ảnh từ URL: ${url}`);

    const response = await axios({
      method: "GET",
      url: url,
      responseType: "stream",
    });

    // Xác định extension từ Content-Type hoặc URL
    const contentType = response.headers["content-type"];
    let ext = ".jpg";

    if (contentType.includes("png")) ext = ".png";
    else if (contentType.includes("gif")) ext = ".gif";
    else if (contentType.includes("webp")) ext = ".webp";

    const filename = `${folder}-${uuidv4()}${ext}`;
    const filepath = path.join("uploads", folder, filename);

    // Đảm bảo thư mục tồn tại
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Lưu file
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(filepath));
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("❌ Lỗi khi tải ảnh từ URL:", error.message);
    return null;
  }
};

/**
 * 🗑️ XÓA ẢNH
 */
export const deleteImage = (filepath) => {
  return new Promise((resolve, reject) => {
    if (!filepath || filepath.startsWith("http")) {
      resolve(); // Không xóa ảnh từ URL
      return;
    }

    fs.unlink(filepath, (err) => {
      if (err && err.code !== "ENOENT") {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
