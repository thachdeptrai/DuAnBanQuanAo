-- ✅ FIXED SQL for sweetshop database
DROP DATABASE IF EXISTS sweetshop;
CREATE DATABASE sweetshop CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE sweetshop;

-- ------------------------
-- USERS
-- ------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address VARCHAR(255),
  avatar VARCHAR(255),
  role ENUM('customer', 'admin') DEFAULT 'customer',
  status ENUM('active', 'banned', 'pending') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------
-- OTP
-- ------------------------
CREATE TABLE otp_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  code VARCHAR(10) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  INDEX (email)
);

-- ------------------------
-- CATEGORIES
-- ------------------------
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT DEFAULT NULL,
  image VARCHAR(255) DEFAULT NULL,
  product_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO categories (id, name, description, image, product_count) VALUES
(1, 'Thời trang Nam', 'Bộ sưu tập thời trang nam hiện đại', '/images/category-men.jpg', 5),
(2, 'Thời trang Nữ', 'Bộ sưu tập thời trang nữ sang trọng', '/images/category-women.jpg', 4),
(3, 'Trẻ Em', 'Thời trang trẻ em đáng yêu', '/images/category-kids.jpg', 1),
(4, 'Phụ Kiện', 'Phụ kiện thời trang cao cấp', '/images/category-accessories.jpg', 2);

-- ------------------------
-- PRODUCTS
-- ------------------------
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  old_price DECIMAL(10,2) DEFAULT NULL,
  image VARCHAR(255),
  category_id INT,
  rating DECIMAL(2,1) DEFAULT 0.0,
  sales INT DEFAULT 0,
  stock INT DEFAULT 0,
  is_featured TINYINT(1) DEFAULT 0,
  is_new TINYINT(1) DEFAULT 0,
  is_sale TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

INSERT INTO products (id, name, description, price, old_price, category_id, rating, sales, stock, is_featured, is_new, is_sale)
VALUES
(1, 'Áo Thun Nam Premium', 'Áo thun nam chất liệu cotton cao cấp', 299000, 599000, 1, 4.8, 234, 50, 1, 0, 1),
(2, 'Váy Dạ Hội Sang Trọng', 'Váy dạ hội sang trọng', 1299000, 2599000, 2, 4.9, 156, 30, 1, 0, 1);

-- ------------------------
-- CART
-- ------------------------
CREATE TABLE cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ------------------------
-- ORDERS
-- ------------------------
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  shipping_address TEXT,
  payment_method VARCHAR(50),
  payment_status ENUM('pending','paid','failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ------------------------
-- ORDER_ITEMS
-- ------------------------
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- ------------------------
-- WISHLIST
-- ------------------------
CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  product_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ------------------------
-- REFRESH_TOKENS
-- ------------------------
CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ------------------------
-- BANNER
-- ------------------------
CREATE TABLE banner (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  badge VARCHAR(100),
  image VARCHAR(255),
  button_text VARCHAR(100),
  button_link VARCHAR(255),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO banner (id, title, subtitle, description, badge, button_text, is_active)
VALUES (1, 'Phong Cách', 'Đẳng Cấp', 'Khám phá xu hướng mới nhất', 'BST 2025', 'Mua ngay', 1);

-- ------------------------
-- API_LOGS
-- ------------------------
CREATE TABLE api_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  method VARCHAR(10),
  endpoint VARCHAR(255),
  status_code INT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_body TEXT,
  response_body TEXT,
  response_time INT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------
-- PROCEDURE: add_to_cart
-- ------------------------
DELIMITER $$
CREATE PROCEDURE add_to_cart(IN p_user_id INT, IN p_product_id INT, IN p_quantity INT)
BEGIN
  DECLARE existing_quantity INT;
  SELECT quantity INTO existing_quantity FROM cart WHERE user_id = p_user_id AND product_id = p_product_id;
  IF existing_quantity IS NOT NULL THEN
    UPDATE cart SET quantity = quantity + p_quantity, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id AND product_id = p_product_id;
  ELSE
    INSERT INTO cart (user_id, product_id, quantity) VALUES (p_user_id, p_product_id, p_quantity);
  END IF;
END$$
DELIMITER ;

-- ------------------------
-- TRIGGERS
-- ------------------------
DROP TRIGGER IF EXISTS update_category_count_after_insert;
DELIMITER $$
CREATE TRIGGER update_category_count_after_insert AFTER INSERT ON products
FOR EACH ROW
BEGIN
  UPDATE categories SET product_count = product_count + 1 WHERE id = NEW.category_id;
END$$
DELIMITER ;

DROP TRIGGER IF EXISTS update_category_count_after_delete;
DELIMITER $$
CREATE TRIGGER update_category_count_after_delete AFTER DELETE ON products
FOR EACH ROW
BEGIN
  UPDATE categories SET product_count = product_count - 1 WHERE id = OLD.category_id;
END$$
DELIMITER ;

-- ------------------------
-- VIEW
-- ------------------------
DROP VIEW IF EXISTS product_statistics;
CREATE VIEW product_statistics AS
SELECT 
  c.name AS category_name,
  COUNT(p.id) AS total_products,
  AVG(p.rating) AS avg_rating,
  SUM(p.sales) AS total_sales,
  MIN(p.price) AS min_price,
  MAX(p.price) AS max_price
FROM categories c
LEFT JOIN products p ON c.id = p.category_id
GROUP BY c.id, c.name;
