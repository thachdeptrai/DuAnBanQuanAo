-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th9 30, 2025 lúc 12:19 PM
-- Phiên bản máy phục vụ: 10.4.27-MariaDB
-- Phiên bản PHP: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `miushop`
--

DELIMITER $$
--
-- Thủ tục
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_to_cart` (IN `p_user_id` INT, IN `p_product_id` INT, IN `p_quantity` INT)   BEGIN
    DECLARE existing_quantity INT;
    
    -- Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    SELECT quantity INTO existing_quantity 
    FROM cart 
    WHERE user_id = p_user_id AND product_id = p_product_id;
    
    IF existing_quantity IS NOT NULL THEN
        -- Nếu đã có, cập nhật số lượng
        UPDATE cart 
        SET quantity = quantity + p_quantity,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id AND product_id = p_product_id;
    ELSE
        -- Nếu chưa có, thêm mới
        INSERT INTO cart (user_id, product_id, quantity)
        VALUES (p_user_id, p_product_id, p_quantity);
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `api_logs`
--

CREATE TABLE `api_logs` (
  `id` int(11) NOT NULL,
  `method` varchar(10) DEFAULT NULL,
  `endpoint` varchar(255) DEFAULT NULL,
  `status_code` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `request_body` text DEFAULT NULL,
  `response_body` text DEFAULT NULL,
  `response_time` int(11) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `banner`
--

CREATE TABLE `banner` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `badge` varchar(100) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `button_text` varchar(100) DEFAULT NULL,
  `button_link` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `banner`
--

INSERT INTO `banner` (`id`, `title`, `subtitle`, `description`, `badge`, `image`, `button_text`, `button_link`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Phong Cách', 'Đẳng Cấp', 'Khám phá những xu hướng thời trang mới nhất, nơi phong cách gặp gỡ sự thoải mái', 'Bộ Sưu Tập Mới 2025', NULL, 'Mua Ngay', NULL, 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `product_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `image`, `product_count`, `created_at`, `updated_at`) VALUES
(1, 'Thời trang Nam', 'Bộ sưu tập thời trang nam hiện đại', '/images/category-men.jpg', 5, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(2, 'Thời trang Nữ', 'Bộ sưu tập thời trang nữ sang trọng', '/images/category-women.jpg', 4, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(3, 'Trẻ Em', 'Thời trang trẻ em đáng yêu', '/images/category-kids.jpg', 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(4, 'Phụ Kiện', 'Phụ kiện thời trang cao cấp', '/images/category-accessories.jpg', 2, '2025-09-30 09:54:51', '2025-09-30 09:54:51');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `shipping_address` text DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 0.0,
  `sales` int(11) DEFAULT 0,
  `stock` int(11) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_new` tinyint(1) DEFAULT 0,
  `is_sale` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `old_price`, `image`, `category_id`, `rating`, `sales`, `stock`, `is_featured`, `is_new`, `is_sale`, `created_at`, `updated_at`) VALUES
(1, 'Áo Thun Nam Premium', 'Áo thun nam chất liệu cotton cao cấp, thoáng mát', '299000.00', '599000.00', NULL, 1, '4.8', 234, 50, 1, 0, 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(2, 'Váy Dạ Hội Sang Trọng', 'Váy dạ hội thiết kế sang trọng, phù hợp dự tiệc', '1299000.00', '2599000.00', NULL, 2, '4.9', 156, 30, 1, 0, 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(3, 'Quần Jean Slim Fit', 'Quần jean nam form slim fit, co giãn tốt', '499000.00', '899000.00', NULL, 1, '4.7', 189, 80, 0, 0, 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(4, 'Áo Sơ Mi Công Sở', 'Áo sơ mi nam công sở lịch sự', '399000.00', '699000.00', NULL, 1, '4.6', 278, 100, 0, 0, 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(5, 'Đầm Dự Tiệc Elegant', 'Đầm dự tiệc thiết kế tinh tế', '899000.00', '1799000.00', NULL, 2, '4.9', 145, 25, 1, 0, 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(6, 'Áo Khoác Hoodie', 'Áo khoác hoodie thể thao năng động', '599000.00', '999000.00', NULL, 1, '4.8', 312, 60, 1, 0, 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(7, 'Chân Váy Xòe', 'Chân váy xòe nữ tính', '349000.00', '649000.00', NULL, 2, '4.5', 198, 70, 0, 0, 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(8, 'Quần Short Thể Thao', 'Quần short thể thao thoải mái', '249000.00', '449000.00', NULL, 1, '4.7', 267, 90, 0, 0, 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(9, 'Áo Thun Nữ Basic', 'Áo thun nữ basic nhiều màu', '199000.00', '399000.00', NULL, 2, '4.6', 345, 120, 0, 0, 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(10, 'Bộ Đồ Trẻ Em', 'Bộ đồ trẻ em đáng yêu', '299000.00', '499000.00', NULL, 3, '4.8', 167, 40, 1, 0, 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(11, 'Túi Xách Da', 'Túi xách da cao cấp sang trọng', '799000.00', '1599000.00', NULL, 4, '4.9', 123, 35, 1, 0, 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51'),
(12, 'Giày Thể Thao', 'Giày thể thao nam phong cách', '899000.00', '1799000.00', NULL, 4, '4.8', 289, 55, 1, 0, 1, '2025-09-30 09:54:51', '2025-09-30 09:54:51');

--
-- Bẫy `products`
--
DELIMITER $$
CREATE TRIGGER `update_category_count_after_delete` AFTER DELETE ON `products` FOR EACH ROW BEGIN
    UPDATE categories 
    SET product_count = product_count - 1
    WHERE id = OLD.category_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_category_count_after_insert` AFTER INSERT ON `products` FOR EACH ROW BEGIN
    UPDATE categories 
    SET product_count = product_count + 1
    WHERE id = NEW.category_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `product_statistics`
-- (See below for the actual view)
--
CREATE TABLE `product_statistics` (
`category_name` varchar(100)
,`total_products` bigint(21)
,`avg_rating` decimal(6,5)
,`total_sales` decimal(32,0)
,`min_price` decimal(10,2)
,`max_price` decimal(10,2)
);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(500) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('customer','admin') DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `product_statistics`
--
DROP TABLE IF EXISTS `product_statistics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `product_statistics`  AS SELECT `c`.`name` AS `category_name`, count(`p`.`id`) AS `total_products`, avg(`p`.`rating`) AS `avg_rating`, sum(`p`.`sales`) AS `total_sales`, min(`p`.`price`) AS `min_price`, max(`p`.`price`) AS `max_price` FROM (`categories` `c` left join `products` `p` on(`c`.`id` = `p`.`category_id`)) GROUP BY `c`.`id`, `c`.`name``name`  ;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `api_logs`
--
ALTER TABLE `api_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_method` (`method`),
  ADD KEY `idx_endpoint` (`endpoint`),
  ADD KEY `idx_status` (`status_code`),
  ADD KEY `idx_created` (`created_at`);

--
-- Chỉ mục cho bảng `banner`
--
ALTER TABLE `banner`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Chỉ mục cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `api_logs`
--
ALTER TABLE `api_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `banner`
--
ALTER TABLE `banner`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
