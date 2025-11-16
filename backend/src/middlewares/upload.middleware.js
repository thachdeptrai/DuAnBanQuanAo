// middlewares/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

/**
 * 🎯 CẤU HÌNH UPLOAD FILE CHO HỆ THỐNG SWEETSHOP
 *
 * Middleware quản lý việc upload ảnh với các tính năng:
 * - Validate file type và size
 * - Tự động tạo thư mục
 * - Xử lý lỗi chi tiết
 * - Hỗ trợ multiple upload types
 */

// =====================================================
// 🎯 HẰNG SỐ CẤU HÌNH
// =====================================================

const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  ALLOWED_EXTENSIONS: [".jpeg", ".jpg", ".png", ".gif", ".webp", ".svg"],
  UPLOAD_DIR: "uploads",
};

/**
 * 🗂️ TẠO THƯ MỤC UPLOAD NẾU CHƯA TỒN TẠI
 */
const ensureUploadDir = (folder = "") => {
  const dirPath = path.join(UPLOAD_CONFIG.UPLOAD_DIR, folder);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Đã tạo thư mục upload: ${dirPath}`);
  }
  return dirPath;
};

/**
 * 🔍 VALIDATE FILE TYPE
 */
const validateFileType = (file) => {
  const isValidMimeType = UPLOAD_CONFIG.ALLOWED_FILE_TYPES.includes(
    file.mimetype
  );
  const ext = path.extname(file.originalname).toLowerCase();
  const isValidExtension = UPLOAD_CONFIG.ALLOWED_EXTENSIONS.includes(ext);

  return isValidMimeType && isValidExtension;
};

/**
 * 📝 TẠO TÊN FILE UNIQUE
 */
const generateFileName = (file, prefix = "file") => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(file.originalname).toLowerCase();

  return `${prefix}-${timestamp}-${randomString}${ext}`;
};

// =====================================================
// 🎯 CẤU HÌNH STORAGE CHO CÁC LOẠI UPLOAD
// =====================================================

// 🏷️ STORAGE CHO BRANDS
const brandStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dirPath = ensureUploadDir("brands");
      cb(null, dirPath);
    } catch (error) {
      cb(new Error(`Không thể tạo thư mục lưu trữ: ${error.message}`));
    }
  },
  filename: (req, file, cb) => {
    try {
      const filename = generateFileName(file, "brand");
      console.log(`📸 Đang lưu logo brand: ${filename}`);
      cb(null, filename);
    } catch (error) {
      cb(new Error(`Lỗi khi tạo tên file: ${error.message}`));
    }
  },
});

// 📂 STORAGE CHO CATEGORIES
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dirPath = ensureUploadDir("categories");
      cb(null, dirPath);
    } catch (error) {
      cb(new Error(`Không thể tạo thư mục lưu trữ: ${error.message}`));
    }
  },
  filename: (req, file, cb) => {
    try {
      const filename = generateFileName(file, "category");
      console.log(`📸 Đang lưu file category: ${filename}`);
      cb(null, filename);
    } catch (error) {
      cb(new Error(`Lỗi khi tạo tên file: ${error.message}`));
    }
  },
});

// 📦 STORAGE CHO PRODUCTS
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dirPath = ensureUploadDir("products");
      cb(null, dirPath);
    } catch (error) {
      cb(new Error(`Không thể tạo thư mục lưu trữ: ${error.message}`));
    }
  },
  filename: (req, file, cb) => {
    try {
      const filename = generateFileName(file, "product");
      console.log(`📸 Đang lưu file sản phẩm: ${filename}`);
      cb(null, filename);
    } catch (error) {
      cb(new Error(`Lỗi khi tạo tên file: ${error.message}`));
    }
  },
});

// 👤 STORAGE CHO USERS (AVATAR)
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dirPath = ensureUploadDir("users");
      cb(null, dirPath);
    } catch (error) {
      cb(new Error(`Không thể tạo thư mục lưu trữ: ${error.message}`));
    }
  },
  filename: (req, file, cb) => {
    try {
      const filename = generateFileName(file, "avatar");
      console.log(`📸 Đang lưu avatar: ${filename}`);
      cb(null, filename);
    } catch (error) {
      cb(new Error(`Lỗi khi tạo tên file: ${error.message}`));
    }
  },
});

// 📎 STORAGE CHUNG
const generalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dirPath = ensureUploadDir("general");
      cb(null, dirPath);
    } catch (error) {
      cb(new Error(`Không thể tạo thư mục lưu trữ: ${error.message}`));
    }
  },
  filename: (req, file, cb) => {
    try {
      const filename = generateFileName(file, "file");
      console.log(`📸 Đang lưu file: ${filename}`);
      cb(null, filename);
    } catch (error) {
      cb(new Error(`Lỗi khi tạo tên file: ${error.message}`));
    }
  },
});

// =====================================================
// 🎯 FILE FILTER CHUNG
// =====================================================

const fileFilter = (req, file, cb) => {
  console.log(`🔍 Kiểm tra file: ${file.originalname} (${file.mimetype})`);

  try {
    if (!validateFileType(file)) {
      const error = new Error(
        `Loại file không được hỗ trợ. Chỉ chấp nhận: ${UPLOAD_CONFIG.ALLOWED_EXTENSIONS.join(
          ", "
        )}`
      );
      error.code = "INVALID_FILE_TYPE";
      return cb(error, false);
    }

    console.log(`✅ File hợp lệ: ${file.originalname}`);
    cb(null, true);
  } catch (error) {
    console.error(`❌ Lỗi kiểm tra file: ${error.message}`);
    cb(error, false);
  }
};

// =====================================================
// 🎯 CẤU HÌNH MULTER INSTANCES
// =====================================================

/**
 * 🏷️ UPLOAD MIDDLEWARE CHO BRANDS
 */
export const uploadBrand = multer({
  storage: brandStorage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    files: 1, // Chỉ cho phép 1 logo
  },
});

/**
 * 📂 UPLOAD MIDDLEWARE CHO CATEGORIES
 */
export const uploadCategory = multer({
  storage: categoryStorage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    files: 1, // Chỉ cho phép 1 file
  },
});

/**
 * 📦 UPLOAD MIDDLEWARE CHO PRODUCTS (NHIỀU ẢNH)
 */
export const uploadProduct = multer({
  storage: productStorage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    files: 10, // Cho phép tối đa 10 ảnh
  },
});

/**
 * 👤 UPLOAD MIDDLEWARE CHO USER AVATAR
 */
export const uploadUser = multer({
  storage: userStorage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    files: 1, // Chỉ 1 avatar
  },
});

/**
 * 📎 UPLOAD MIDDLEWARE CHUNG
 */
export const uploadGeneral = multer({
  storage: generalStorage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
    files: 5,
  },
});

/**
 * 📸 UPLOAD MIDDLEWARE MẶC ĐỊNH (CHO CATEGORIES)
 */
export const upload = uploadCategory;

// =====================================================
// 🎯 MIDDLEWARE XỬ LÝ LỖI UPLOAD
// =====================================================

/**
 * 🛡️ MIDDLEWARE XỬ LÝ LỖI UPLOAD
 */
export const handleUploadError = (error, req, res, next) => {
  console.error("❌ Lỗi upload file:", error);

  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: `File quá lớn. Kích thước tối đa: ${
            UPLOAD_CONFIG.MAX_FILE_SIZE / 1024 / 1024
          }MB`,
          code: "FILE_TOO_LARGE",
        });

      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Vượt quá số lượng file cho phép",
          code: "TOO_MANY_FILES",
        });

      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: "Field name không đúng hoặc quá nhiều file",
          code: "INVALID_FIELD_NAME",
        });

      default:
        return res.status(400).json({
          success: false,
          message: `Lỗi upload file: ${error.message}`,
          code: "UPLOAD_ERROR",
        });
    }
  }

  if (error.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({
      success: false,
      message: error.message,
      code: "INVALID_FILE_TYPE",
    });
  }

  // Lỗi hệ thống
  return res.status(500).json({
    success: false,
    message: "Lỗi hệ thống khi upload file",
    code: "SERVER_UPLOAD_ERROR",
  });
};

// =====================================================
// 🎯 TIỆN ÍCH HỖ TRỢ
// =====================================================

/**
 * 🗑️ XÓA FILE UPLOAD
 */
export const deleteUploadedFile = (filePath) => {
  return new Promise((resolve, reject) => {
    if (!filePath) {
      resolve();
      return;
    }

    const fullPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    fs.unlink(fullPath, (error) => {
      if (error) {
        if (error.code === "ENOENT") {
          console.log(`⚠️ File không tồn tại: ${filePath}`);
          resolve();
        } else {
          console.error(`❌ Lỗi khi xóa file: ${filePath}`, error);
          reject(error);
        }
      } else {
        console.log(`✅ Đã xóa file: ${filePath}`);
        resolve();
      }
    });
  });
};

/**
 * 📁 LẤY DANH SÁCH FILE TRONG THƯ MỤC
 */
export const getUploadedFiles = (folder = "") => {
  const dirPath = path.join(UPLOAD_CONFIG.UPLOAD_DIR, folder);

  try {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    const files = fs.readdirSync(dirPath);
    return files.map((file) => ({
      name: file,
      path: path.join(dirPath, file),
      url: `/uploads/${folder}/${file}`,
    }));
  } catch (error) {
    console.error(`❌ Lỗi khi đọc thư mục: ${dirPath}`, error);
    return [];
  }
};

// =====================================================
// 🎯 XUẤT CẤU HÌNH
// =====================================================

export const UPLOAD_CONSTANTS = UPLOAD_CONFIG;

export default {
  upload,
  uploadBrand,
  uploadCategory,
  uploadProduct,
  uploadUser,
  uploadGeneral,
  handleUploadError,
  deleteUploadedFile,
  getUploadedFiles,
  UPLOAD_CONSTANTS,
};
