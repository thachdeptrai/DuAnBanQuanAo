/* 
Thứ tự chuẩn nhất để 1 sản phẩm hoạt động đầy đủ:

1️⃣ categories
2️⃣ brands
3️⃣ attributes
4️⃣ attribute_values
5️⃣ products
6️⃣ product_variants
7️⃣ variant_attributes
8️⃣ product_media
*/
-- ✅ FIXED SQL for sweetshop database
-- ----------------------------------------------------------------------
-- THIẾT LẬP BAN ĐẦU
-- ----------------------------------------------------------------------
DROP DATABASE IF EXISTS sweetshop;
CREATE DATABASE sweetshop CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE sweetshop;
-- ------------------------
-- USERS (Người dùng) // xong 
-- ------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,                                 -- ID chính
  name VARCHAR(150)  NULL,                                           -- Tên đầy đủ
  email VARCHAR(150) NOT NULL UNIQUE,                                -- Email đăng nhập
  password VARCHAR(255) NOT NULL,                                    -- Mật khẩu mã hóa
  phone VARCHAR(20),                                                 -- Số điện thoại
  address TEXT,                                                      -- Địa chỉ giao hàng
  avatar VARCHAR(255),                                               -- Ảnh đại diện
  role ENUM('customer', 'admin') DEFAULT 'customer',                 -- Vai trò: khách hàng hoặc admin
  status ENUM('active', 'inactive') DEFAULT 'active',                -- Trạng thái tài khoản
  email_verified BOOLEAN DEFAULT FALSE,                              -- Email đã xác thực chưa
  verification_attempts TINYINT UNSIGNED DEFAULT 0,                  -- Số lần thử xác thực
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                    -- Ngày tạo
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Ngày cập nhật
  
  INDEX idx_email (email),                                           -- Index cho tìm kiếm email
  INDEX idx_role_status (role, status)                               -- Index cho quản lý user
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- OTP_CODES (Mã OTP xác thực) xong 
-- ------------------------
CREATE TABLE otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,                                 -- ID chính
  email VARCHAR(150) NOT NULL,                                       -- Email nhận OTP
  code VARCHAR(6) NOT NULL,                                          -- Mã OTP 6 số
  type ENUM('register', 'reset_password') DEFAULT 'register',        -- Loại OTP: đăng ký hoặc reset mật khẩu
  used BOOLEAN DEFAULT FALSE,                                        -- Đã sử dụng chưa
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,                     -- Thời gian tạo
  expires_at DATETIME NOT NULL,                                      -- Thời gian hết hạn
  
  INDEX idx_email_type (email, type),                                -- Index tìm OTP theo email và loại
  INDEX idx_expires_used (expires_at, used),                         -- Index để dọn dẹp OTP hết hạn
  INDEX idx_created (created_at)                                     -- Index theo thời gian tạo
);

-- ------------------------
-- CATEGORIES (Danh mục sản phẩm)
-- ------------------------
CREATE TABLE categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                      -- ID danh mục
    name VARCHAR(100) NOT NULL,                                      -- Tên danh mục: Áo thun, Quần jeans
    slug VARCHAR(120) NOT NULL UNIQUE,                               -- Slug cho URL: /ao-thun
    parent_id INT UNSIGNED DEFAULT NULL,                             -- Danh mục cha (nếu có)
    description TEXT,                                                -- Mô tả danh mục
    image VARCHAR(255),                                              -- Ảnh danh mục
    sort_order INT UNSIGNED DEFAULT 0,                               -- Thứ tự hiển thị
    is_active BOOLEAN DEFAULT TRUE,                                  -- Trạng thái kích hoạt
    meta_title VARCHAR(150),                                         -- Tiêu đề SEO cho trang danh mục
    meta_description VARCHAR(255),                                   -- Mô tả SEO cho trang danh mục
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Ngày tạo
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Ngày cập nhật
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL, -- Khóa ngoại đến danh mục cha
    INDEX idx_parent_active (parent_id, is_active),                  -- Index cho menu đa cấp
    INDEX idx_sort_active (sort_order, is_active)                    -- Index sắp xếp
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- BRANDS (Thương hiệu sản phẩm) xong 
-- ------------------------
CREATE TABLE brands (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                      -- ID thương hiệu
    name VARCHAR(100) NOT NULL,                                      -- Tên thương hiệu: Nike, Adidas, Zara
    slug VARCHAR(120) UNIQUE NOT NULL,                               -- Slug cho URL: /nike
    description TEXT,                                                -- Mô tả thương hiệu
    logo_url VARCHAR(255),                                           -- Logo thương hiệu
    is_active BOOLEAN DEFAULT TRUE,                                  -- Trạng thái kích hoạt
    sort_order INT UNSIGNED DEFAULT 0,                               -- Thứ tự hiển thị
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Ngày tạo
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Ngày cập nhật
    
    INDEX idx_slug_active (slug, is_active),                         -- Index cho trang thương hiệu
    INDEX idx_sort_active (sort_order, is_active)                    -- Index sắp xếp
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- PRODUCTS (Sản phẩm chính) xong 
-- ------------------------
CREATE TABLE products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                      -- ID sản phẩm
    name VARCHAR(255) NOT NULL,                                      -- Tên sản phẩm: Áo thun nam basic
    slug VARCHAR(255) NOT NULL UNIQUE,                               -- Slug cho URL
    description TEXT,                                                -- Mô tả chi tiết
    short_description VARCHAR(500),                                  -- Mô tả ngắn (THÊM VÀO)
    cost_price DECIMAL(12,2),                                        -- Giá vốn (quản lý nội bộ)
    sku_prefix VARCHAR(50),                                          -- Tiền tố SKU: "ATN-BASIC"
    category_id INT UNSIGNED,                                        -- Danh mục sản phẩm
    brand_id INT UNSIGNED,                                           -- Thương hiệu sản phẩm
    is_active BOOLEAN DEFAULT TRUE,                                  -- Trạng thái active
    is_featured BOOLEAN DEFAULT FALSE,                               -- Sản phẩm nổi bật
    is_new BOOLEAN DEFAULT TRUE,                                     -- Sản phẩm mới
    average_rating DECIMAL(3,2) DEFAULT 0.00,                        -- Đánh giá trung bình
    total_reviews INT UNSIGNED DEFAULT 0,                            -- Tổng số đánh giá
    total_sales INT UNSIGNED DEFAULT 0,                              -- Tổng số lượng bán
    min_price DECIMAL(12,2) DEFAULT 0.00,                            -- Giá thấp nhất từ các variants
    max_price DECIMAL(12,2) DEFAULT 0.00,                            -- Giá cao nhất từ các variants
    meta_title VARCHAR(255),                                         -- Tiêu đề SEO
    meta_description TEXT,                                           -- Mô tả SEO
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Ngày tạo
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Ngày cập nhật
    
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL, -- Khóa ngoại đến danh mục
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL, -- Khóa ngoại đến thương hiệu
    INDEX idx_category_active (category_id, is_active),              -- Index theo danh mục
    INDEX idx_brand_active (brand_id, is_active),                    -- Index theo thương hiệu
    INDEX idx_featured_active (is_featured, is_active),              -- Index sản phẩm nổi bật
    INDEX idx_price_range (min_price, max_price),                    -- Index theo khoảng giá
    INDEX idx_created_active (created_at, is_active)                 -- Index theo ngày tạo
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- PRODUCT_VARIANTS (Biến thể sản phẩm) xong 
-- ------------------------
CREATE TABLE product_variants (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                      -- ID biến thể
    product_id INT UNSIGNED NOT NULL,                                -- ID sản phẩm
    sku VARCHAR(100) UNIQUE NOT NULL,                                -- Mã SKU đầy đủ: "ATN-BASIC-RED-M"
    price DECIMAL(12,2) NOT NULL,                                    -- Giá bán thực tế
    compare_price DECIMAL(12,2),                                     -- Giá so sánh
    cost_price DECIMAL(12,2),                                        -- Giá vốn
    stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,                  -- Số lượng tồn kho
    low_stock_alert BOOLEAN DEFAULT FALSE,                           -- Cảnh báo tồn kho thấp
    is_active BOOLEAN DEFAULT TRUE,                                  -- Trạng thái active
    is_default BOOLEAN DEFAULT FALSE,                                -- Biến thể mặc định
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Ngày tạo
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Ngày cập nhật
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, -- Khóa ngoại đến sản phẩm
    INDEX idx_product_active (product_id, is_active),                -- Index theo sản phẩm
    INDEX idx_sku_stock (sku, stock_quantity),                       -- Index theo SKU và tồn kho
    INDEX idx_price_stock (price, stock_quantity),                   -- Index theo giá và tồn kho
    INDEX idx_low_stock (low_stock_alert, is_active),                -- Index cảnh báo tồn kho thấp
    CONSTRAINT chk_variant_price_positive CHECK (price >= 0),        -- Kiểm tra giá không âm
    CONSTRAINT chk_stock_non_negative CHECK (stock_quantity >= 0)    -- Kiểm tra tồn kho không âm
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- ATTRIBUTES (Thuộc tính sản phẩm) xong 
-- ------------------------
CREATE TABLE attributes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                      -- ID thuộc tính
    name VARCHAR(50) NOT NULL,                                       -- Tên thuộc tính: "color", "size"
    display_name VARCHAR(50) NOT NULL,                               -- Tên hiển thị: "Màu sắc", "Kích thước"
    sort_order TINYINT UNSIGNED DEFAULT 0,                           -- Thứ tự hiển thị
    is_active BOOLEAN DEFAULT TRUE,                                  -- Trạng thái active
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Ngày tạo
    
    UNIQUE KEY unq_name (name),                                      -- Tên thuộc tính là duy nhất
    INDEX idx_active_sort (is_active, sort_order)                    -- Index theo trạng thái và thứ tự
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- ATTRIBUTE_VALUES (Giá trị thuộc tính) xong 
-- ------------------------
CREATE TABLE attribute_values (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                      -- ID giá trị
    attribute_id INT UNSIGNED NOT NULL,                              -- ID thuộc tính
    value VARCHAR(50) NOT NULL,                                      -- Giá trị: "red", "M"
    display_value VARCHAR(50) NOT NULL,                              -- Giá trị hiển thị: "Đỏ", "Size M"
    color_hex VARCHAR(7),                                            -- Mã màu HEX (nếu là màu)
    sort_order TINYINT UNSIGNED DEFAULT 0,                           -- Thứ tự hiển thị
    is_active BOOLEAN DEFAULT TRUE,                                  -- Trạng thái active
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Ngày tạo
    
    FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON DELETE CASCADE, -- Khóa ngoại đến thuộc tính
    UNIQUE KEY unq_attribute_value (attribute_id, value),            -- Giá trị duy nhất trong thuộc tính
    INDEX idx_attribute_active (attribute_id, is_active, sort_order) -- Index theo thuộc tính và trạng thái
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- VARIANT_ATTRIBUTES (Thuộc tính của biến thể) xong 
-- ------------------------
CREATE TABLE variant_attributes (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                      -- ID liên kết
    variant_id INT UNSIGNED NOT NULL,                                -- ID biến thể
    attribute_id INT UNSIGNED NOT NULL,                              -- ID thuộc tính
    attribute_value_id INT UNSIGNED NOT NULL,                        -- ID giá trị thuộc tính
    
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE, -- Khóa ngoại đến biến thể
    FOREIGN KEY (attribute_id) REFERENCES attributes(id),            -- Khóa ngoại đến thuộc tính
    FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id), -- Khóa ngoại đến giá trị thuộc tính
    UNIQUE KEY unq_variant_attribute (variant_id, attribute_id),     -- Mỗi biến thể chỉ có 1 giá trị cho 1 thuộc tính
    INDEX idx_variant_id (variant_id),                               -- Index theo biến thể
    INDEX idx_attribute_combo (attribute_id, attribute_value_id)     -- Index theo kết hợp thuộc tính
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- PRODUCT_MEDIA (Hình ảnh và video sản phẩm) xong
-- ------------------------
CREATE TABLE product_media (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                      -- ID media
    product_id INT UNSIGNED NOT NULL,                                -- ID sản phẩm
    variant_id INT UNSIGNED DEFAULT NULL,                            -- ID biến thể (nếu media cho biến thể cụ thể)
    file_name VARCHAR(255) NOT NULL,                                 -- Tên file: "ao-thun-red.jpg"
    file_path VARCHAR(500) NOT NULL,                                 -- Đường dẫn: "/uploads/products/2024/01/ao-thun-red.jpg"
    file_size INT UNSIGNED,                                          -- Kích thước file (bytes)
    mime_type VARCHAR(100),                                          -- Loại file: "image/jpeg", "video/mp4"
    media_type ENUM('image', 'video') NOT NULL,                      -- Loại media
    alt_text VARCHAR(255),                                           -- Văn bản thay thế (cho SEO)
    sort_order SMALLINT UNSIGNED DEFAULT 0,                          -- Thứ tự hiển thị
    duration INT UNSIGNED DEFAULT NULL,                              -- Thời lượng video (giây) - cho video
    thumbnail_path VARCHAR(500),                                     -- Đường dẫn thumbnail (cho video)
    is_primary BOOLEAN DEFAULT FALSE,                                -- Ảnh/video chính
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Ngày tạo
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, -- Khóa ngoại đến sản phẩm
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL, -- Khóa ngoại đến biến thể
    UNIQUE KEY unq_primary_per_product (product_id, is_primary),     -- Mỗi sản phẩm chỉ 1 ảnh chính
    INDEX idx_product_order (product_id, sort_order),                -- Index theo sản phẩm và thứ tự
    INDEX idx_variant_media (variant_id, sort_order),                -- Index theo biến thể
    INDEX idx_media_type (product_id, media_type)                    -- Index theo loại media
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- ORDERS (Đơn hàng) xong 
-- ------------------------
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,                               -- ID đơn hàng
    order_number VARCHAR(50) UNIQUE NOT NULL,                        -- Mã đơn hàng
    user_id INT NOT NULL,                                            -- ID khách hàng (BẮT BUỘC - chỉ user đã đăng ký)
    
    -- Customer information (lấy từ bảng users, không cần lưu trùng)
    customer_name VARCHAR(150) NOT NULL,                             -- Tên khách hàng (đồng bộ từ users)
    customer_email VARCHAR(150) NOT NULL,                            -- Email khách hàng (đồng bộ từ users)
    customer_phone VARCHAR(20) NOT NULL,                             -- SĐT khách hàng (đồng bộ từ users)
    shipping_address TEXT NOT NULL,                                  -- Địa chỉ giao hàng (đồng bộ từ users)
    
    -- Financial information
    subtotal_amount DECIMAL(12,2) NOT NULL,                          -- Tổng tiền hàng
    shipping_fee DECIMAL(12,2) DEFAULT 0.00,                         -- Phí vận chuyển
    discount_amount DECIMAL(12,2) DEFAULT 0.00,                      -- Giảm giá
    total_amount DECIMAL(12,2) NOT NULL,                             -- Tổng thanh toán
    
    -- Coupon information
    coupon_id INT UNSIGNED,                                          -- ID coupon sử dụng (THÊM VÀO)
    coupon_code VARCHAR(50),                                         -- Mã giảm giá sử dụng
    coupon_discount DECIMAL(12,2) DEFAULT 0.00,                      -- Số tiền giảm giá từ coupon
    
    -- Status tracking
    status ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending', -- Trạng thái đơn hàng
    payment_method ENUM('cod','bank_transfer','credit_card','momo','zalopay') DEFAULT 'cod', -- Phương thức thanh toán
    payment_status ENUM('pending','paid','failed','refunded') DEFAULT 'pending', -- Trạng thái thanh toán
    
    -- Shipping information
    shipping_method VARCHAR(100),                                    -- Phương thức vận chuyển
    tracking_number VARCHAR(100),                                    -- Mã theo dõi
    estimated_delivery DATE,                                         -- Ngày dự kiến giao hàng
    
    -- Notes
    customer_note TEXT,                                              -- Ghi chú của khách hàng
    admin_note TEXT,                                                 -- Ghi chú của admin
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Ngày tạo đơn
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Ngày cập nhật
    paid_at TIMESTAMP NULL,                                          -- Thời điểm thanh toán
    shipped_at TIMESTAMP NULL,                                       -- Thời điểm giao hàng
    delivered_at TIMESTAMP NULL,                                     -- Thời điểm nhận hàng
    cancelled_at TIMESTAMP NULL,                                     -- Thời điểm hủy đơn
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,    -- Khóa ngoại đến user (CASCADE để xóa order khi user bị xóa)
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE SET NULL, -- Khóa ngoại đến coupon (THÊM VÀO)
    
    INDEX idx_order_number (order_number),                           -- Index tìm kiếm mã đơn
    INDEX idx_user_status (user_id, status),                         -- Index theo user và trạng thái
    INDEX idx_created_status (created_at, status),                   -- Index theo ngày tạo và trạng thái
    INDEX idx_payment_status (payment_status),                       -- Index theo trạng thái thanh toán
    INDEX idx_tracking (tracking_number),                            -- Index theo mã theo dõi
    INDEX idx_status_payment (status, payment_status, created_at),   -- Index kết hợp trạng thái và thanh toán
    INDEX idx_user_created (user_id, created_at)                     -- Index theo user và ngày tạo (THAY ĐỔI TÊN)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ------------------------
-- ORDER_ITEMS (Chi tiết đơn hàng) xong
-- ------------------------
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,                               -- ID chi tiết
    order_id INT NOT NULL,                                           -- ID đơn hàng
    variant_id INT UNSIGNED NOT NULL,                                -- ID biến thể
    product_name VARCHAR(255) NOT NULL,                              -- Tên sản phẩm (lúc mua)
    variant_sku VARCHAR(100) NOT NULL,                               -- Mã SKU (lúc mua)
    variant_attributes JSON,                                         -- Thuộc tính biến thể (lúc mua)
    quantity INT UNSIGNED NOT NULL,                                  -- Số lượng
    unit_price DECIMAL(12,2) NOT NULL,                               -- Giá đơn vị (lúc mua)
    total_price DECIMAL(12,2) NOT NULL,                              -- Thành tiền
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Ngày tạo
    
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,  -- Khóa ngoại đến đơn hàng
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL, -- Khóa ngoại đến biến thể
    INDEX idx_order_id (order_id),                                   -- Index theo đơn hàng
    INDEX idx_variant_id (variant_id),                               -- Index theo biến thể
    INDEX idx_product_snapshot (product_name(100))                   -- Index theo tên sản phẩm
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- CART (Giỏ hàng) xong 
-- ------------------------
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,                               -- ID giỏ hàng
    user_id INT NOT NULL,                                            -- ID người dùng
    variant_id INT UNSIGNED NOT NULL,                                -- ID biến thể
    quantity INT UNSIGNED NOT NULL DEFAULT 1,                        -- Số lượng
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                    -- Ngày thêm vào giỏ
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Ngày cập nhật
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,    -- Khóa ngoại đến user
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE, -- Khóa ngoại đến biến thể
    UNIQUE KEY unq_cart_item (user_id, variant_id),                  -- Mỗi user chỉ có 1 bản ghi cho mỗi biến thể
    INDEX idx_user_added (user_id, added_at)                         -- Index theo user và ngày thêm
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- WISHLIST (Danh sách yêu thích) xong
-- ------------------------
CREATE TABLE wishlist (
    id INT AUTO_INCREMENT PRIMARY KEY,                               -- ID yêu thích
    user_id INT NOT NULL,                                            -- ID người dùng
    product_id INT UNSIGNED NOT NULL,                                -- ID sản phẩm
    variant_id INT UNSIGNED,                                         -- ID biến thể (nếu có)
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                    -- Ngày thêm vào yêu thích
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,    -- Khóa ngoại đến user
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, -- Khóa ngoại đến sản phẩm
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE, -- Khóa ngoại đến biến thể
    UNIQUE KEY unq_wishlist (user_id, product_id, variant_id),       -- Mỗi user chỉ thích 1 lần cho mỗi sản phẩm+biến thể
    INDEX idx_user_product (user_id, product_id),                    -- Index theo user và sản phẩm
    INDEX idx_added_at (added_at)                                    -- Index theo ngày thêm
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- PRODUCT_REVIEWS (Đánh giá sản phẩm) xong
-- ------------------------
CREATE TABLE product_reviews (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                      -- ID đánh giá
    product_id INT UNSIGNED NOT NULL,                                -- ID sản phẩm
    user_id INT NOT NULL,                                            -- ID người dùng
    variant_id INT UNSIGNED,                                         -- ID biến thể
    order_item_id INT,                                               -- ID đơn hàng (xác thực mua hàng)
    rating TINYINT UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5), -- Điểm đánh giá 1-5 sao
    title VARCHAR(255),                                              -- Tiêu đề đánh giá
    comment TEXT,                                                    -- Nội dung đánh giá
    is_approved BOOLEAN DEFAULT FALSE,                               -- Đã được duyệt
    helpful_count INT UNSIGNED DEFAULT 0,                            -- Số lượt hữu ích
    reported_count INT UNSIGNED DEFAULT 0,                           -- Số lượt báo cáo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Ngày đánh giá
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Ngày cập nhật
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE, -- Khóa ngoại đến sản phẩm
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,    -- Khóa ngoại đến user
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL, -- Khóa ngoại đến biến thể
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL, -- Khóa ngoại đến đơn hàng
    UNIQUE KEY unq_product_user (product_id, user_id),               -- Mỗi user chỉ đánh giá 1 lần cho mỗi sản phẩm
    INDEX idx_product_approved (product_id, is_approved, rating),    -- Index theo sản phẩm và trạng thái duyệt
    INDEX idx_created_approved (created_at, is_approved)             -- Index theo ngày tạo và trạng thái duyệt
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- COUPONS (Mã giảm giá)
-- ------------------------
CREATE TABLE coupons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,                      -- ID coupon
    code VARCHAR(50) UNIQUE NOT NULL,                                -- Mã giảm giá
    description TEXT,                                                -- Mô tả coupon
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL,       -- Loại giảm giá: phần trăm hoặc số tiền
    discount_value DECIMAL(10,2) NOT NULL,                           -- Giá trị giảm giá
    min_order_amount DECIMAL(12,2) DEFAULT 0,                        -- Đơn hàng tối thiểu
    max_discount_amount DECIMAL(12,2),                               -- Giảm giá tối đa
    applies_to ENUM('all_products', 'specific_products', 'specific_categories', 'first_order') DEFAULT 'all_products', -- Phạm vi áp dụng
    usage_limit INT UNSIGNED,                                        -- Giới hạn sử dụng
    used_count INT UNSIGNED DEFAULT 0,                               -- Số lần đã sử dụng
    per_user_limit INT UNSIGNED DEFAULT 1,                           -- Giới hạn mỗi user
    start_date DATETIME NOT NULL,                                    -- Ngày bắt đầu
    end_date DATETIME NOT NULL,                                      -- Ngày kết thúc
    is_active BOOLEAN DEFAULT TRUE,                                  -- Trạng thái active
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Ngày tạo
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Ngày cập nhật
    
    INDEX idx_code_active (code, is_active),                         -- Index theo mã và trạng thái
    INDEX idx_dates_active (start_date, end_date, is_active),        -- Index theo thời gian và trạng thái
    INDEX idx_usage (usage_limit, used_count)                        -- Index theo giới hạn sử dụng
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------------
-- TRIGGERS QUAN TRỌNG - HOÀN CHỈNH
-- ----------------------------------------------------------------------
DELIMITER $$

-- Trigger: Tự động generate order number và đồng bộ thông tin user
DROP TRIGGER IF EXISTS before_order_insert$$
CREATE TRIGGER before_order_insert
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
    DECLARE user_name VARCHAR(150);
    DECLARE user_email VARCHAR(150);
    DECLARE user_phone VARCHAR(20);
    DECLARE user_address TEXT;
    
    -- Tự động generate order number nếu chưa có
    IF NEW.order_number IS NULL THEN
        SET NEW.order_number = CONCAT('ORD', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 10000), 4, '0'));
    END IF;
    
    -- Đồng bộ thông tin user từ bảng users
    SELECT name, email, phone, address 
    INTO user_name, user_email, user_phone, user_address
    FROM users 
    WHERE id = NEW.user_id;
    
    -- Cập nhật thông tin khách hàng từ user
    SET NEW.customer_name = user_name;
    SET NEW.customer_email = user_email;
    SET NEW.customer_phone = user_phone;
    SET NEW.shipping_address = user_address;
END$$

-- Trigger: Cập nhật tổng sales và tồn kho khi có order item mới
DROP TRIGGER IF EXISTS after_order_item_insert$$
CREATE TRIGGER after_order_item_insert
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    DECLARE current_stock INT;
    
    -- Lấy số lượng tồn kho hiện tại
    SELECT stock_quantity INTO current_stock 
    FROM product_variants 
    WHERE id = NEW.variant_id;
    
    -- Update product sales (tổng số lượng bán)
    UPDATE products p
    JOIN product_variants pv ON pv.id = NEW.variant_id
    SET p.total_sales = p.total_sales + NEW.quantity
    WHERE p.id = pv.product_id;
    
    -- Update variant stock (trừ số lượng tồn kho)
    UPDATE product_variants 
    SET 
        stock_quantity = stock_quantity - NEW.quantity,
        low_stock_alert = (stock_quantity - NEW.quantity) <= 5  -- Cảnh báo nếu tồn kho <= 5
    WHERE id = NEW.variant_id;
END$$

-- Trigger: Cập nhật min_price, max_price khi có biến thể thay đổi
DROP TRIGGER IF EXISTS after_variant_change$$
CREATE TRIGGER after_variant_change
AFTER INSERT OR UPDATE OR DELETE ON product_variants
FOR EACH ROW
BEGIN
    DECLARE product_min_price DECIMAL(12,2);
    DECLARE product_max_price DECIMAL(12,2);
    DECLARE affected_product_id INT UNSIGNED;
    
    -- Xác định product_id bị ảnh hưởng
    SET affected_product_id = COALESCE(NEW.product_id, OLD.product_id);
    
    -- Tính giá min, max từ các biến thể active và còn hàng
    SELECT 
        MIN(price), 
        MAX(price)
    INTO 
        product_min_price, 
        product_max_price
    FROM product_variants 
    WHERE product_id = affected_product_id 
    AND is_active = TRUE
    AND stock_quantity > 0;
    
    -- Cập nhật min_price, max_price trong bảng products
    UPDATE products 
    SET 
        min_price = COALESCE(product_min_price, 0),
        max_price = COALESCE(product_max_price, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = affected_product_id;
END$$

-- Trigger: Cập nhật average rating khi có review thay đổi
DROP TRIGGER IF EXISTS after_review_change$$
CREATE TRIGGER after_review_change
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW
BEGIN
    DECLARE affected_product_id INT UNSIGNED;
    DECLARE avg_rating DECIMAL(3,2);
    DECLARE total_approved_reviews INT UNSIGNED;
    
    -- Xác định product_id bị ảnh hưởng
    SET affected_product_id = COALESCE(NEW.product_id, OLD.product_id);
    
    -- Chỉ cập nhật nếu review được approved hoặc bị xóa
    IF (NEW.is_approved = TRUE OR OLD.is_approved = TRUE OR DELETING) THEN
        -- Tính rating trung bình từ các review đã approved
        SELECT 
            ROUND(AVG(rating), 2),
            COUNT(*)
        INTO 
            avg_rating,
            total_approved_reviews
        FROM product_reviews 
        WHERE product_id = affected_product_id 
        AND is_approved = TRUE;
        
        -- Cập nhật products với giá trị mới
        UPDATE products 
        SET 
            average_rating = COALESCE(avg_rating, 0),
            total_reviews = COALESCE(total_approved_reviews, 0),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = affected_product_id;
    END IF;
END$$

-- Trigger: Cập nhật wishlist count khi có thay đổi trong wishlist
DROP TRIGGER IF EXISTS after_wishlist_insert$$
CREATE TRIGGER after_wishlist_insert
AFTER INSERT ON wishlist
FOR EACH ROW
BEGIN
    -- Tăng wishlist count khi thêm vào wishlist
    UPDATE products 
    SET wishlist_count = wishlist_count + 1 
    WHERE id = NEW.product_id;
END$$

DROP TRIGGER IF EXISTS after_wishlist_delete$$
CREATE TRIGGER after_wishlist_delete
AFTER DELETE ON wishlist
FOR EACH ROW
BEGIN
    -- Giảm wishlist count khi xóa khỏi wishlist (đảm bảo không âm)
    UPDATE products 
    SET wishlist_count = GREATEST(wishlist_count - 1, 0) 
    WHERE id = OLD.product_id;
END$$

-- Trigger: Cập nhật coupon used_count khi có sử dụng coupon
DROP TRIGGER IF EXISTS after_coupon_usage_insert$$
CREATE TRIGGER after_coupon_usage_insert
AFTER INSERT ON coupon_usage
FOR EACH ROW
BEGIN
    -- Tăng số lần sử dụng coupon
    UPDATE coupons 
    SET used_count = used_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.coupon_id;
END$$

-- Trigger: Cập nhật order timestamps khi status thay đổi
DROP TRIGGER IF EXISTS before_order_status_update$$
CREATE TRIGGER before_order_status_update
BEFORE UPDATE ON orders
FOR EACH ROW
BEGIN
    -- Cập nhật timestamps khi status thay đổi
    IF OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'paid' THEN SET NEW.paid_at = CURRENT_TIMESTAMP;
            WHEN 'shipped' THEN SET NEW.shipped_at = CURRENT_TIMESTAMP;
            WHEN 'delivered' THEN SET NEW.delivered_at = CURRENT_TIMESTAMP;
            WHEN 'cancelled' THEN SET NEW.cancelled_at = CURRENT_TIMESTAMP;
        END CASE;
    END IF;
    
    -- Cập nhật payment_status timestamps
    IF OLD.payment_status != NEW.payment_status THEN
        IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
            SET NEW.paid_at = CURRENT_TIMESTAMP;
        END IF;
    END IF;
END$$

DELIMITER ;

-- ----------------------------------------------------------------------
-- INSERT DỮ LIỆU MẪU
-- ----------------------------------------------------------------------

-- Insert default admin user


-- Insert sample categories

-- Insert sample brands


-- Insert sample coupons

COMMIT;