-- 1. สร้างตาราง tbl_customers
CREATE TABLE IF NOT EXISTS `tbl_customers` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(20) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `address` text,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`customer_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `tbl_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `firstname` varchar(20) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `address` text,
  `sex` varchar(10) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `create_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

-- 3. สร้างตาราง tbl_restaurants
CREATE TABLE IF NOT EXISTS `tbl_restaurants` (
  `restaurant_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `menu_description` text,
  PRIMARY KEY (`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. สร้างตาราง tbl_menus
CREATE TABLE IF NOT EXISTS `tbl_menus` (
  `menu_id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `category` enum('Main Dish','Dessert','Drink') NOT NULL,
  PRIMARY KEY (`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. สร้างตาราง tbl_orders
CREATE TABLE IF NOT EXISTS `tbl_orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int DEFAULT NULL,
  `restaurant_id` int NOT NULL,
  `menu_id` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('Processing','Completed','Cancelled') DEFAULT 'Processing',
  `order_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. สร้างตาราง tbl_payments
CREATE TABLE IF NOT EXISTS `tbl_payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `method` enum('Bank Transfer','Cash on Delivery','Credit Card') NOT NULL,
  `payment_status` enum('Paid','Unpaid') DEFAULT 'Unpaid',
  `amount` decimal(10,2) NOT NULL,
  `payment_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`payment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. สร้างตาราง tbl_shippings
CREATE TABLE IF NOT EXISTS `tbl_shippings` (
  `shipping_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `receiver_name` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `status` enum('Preparing','Shipping','Delivered') DEFAULT 'Preparing',
  `shipping_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`shipping_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- ส่วนของ VIEW (สร้าง View หลังจากมีตารางแล้ว)
-- --------------------------------------------------------

-- 8. View: v_customers
CREATE OR REPLACE VIEW `v_customers` AS 
SELECT 
    `id` AS `id`, -- *หมายเหตุ: ใน tbl_customers ฟิลด์จริงคือ customer_id แต่ใน view เดิมเขียนว่า id (อาจต้องแก้ SELECT นี้ให้ตรงกับฟิลด์จริง)*
    `firstname` AS `firstname`,
    `fullname` AS `fullname`,
    `lastname` AS `lastname`,
    `address` AS `address`,
    `phone` AS `phonenumber`, -- แมพ phone เป็น phonenumber ตาม view เดิม
    `email` AS `email`,
    `create_at` AS `created_at`
FROM `tbl_customers`;

-- 9. View: v_menus
CREATE OR REPLACE VIEW `v_menus` AS 
SELECT 
    `menu_id`,
    `restaurant_id`,
    `name`,
    `description`,
    `price`,
    `category` 
FROM `tbl_menus`;

-- 10. View: v_orders (ยอดขาย > 500)
CREATE OR REPLACE VIEW `v_orders` AS 
SELECT 
    `c`.`customer_id` AS `customer_id`,
    `c`.`firstname` AS `firstname`,
    `c`.`lastname` AS `lastname`,
    `o`.`order_id` AS `order_id`,
    `o`.`total` AS `total_amount`,
    `o`.`status` AS `order_status`,
    `o`.`order_time` AS `order_date`
FROM `tbl_customers` `c` 
JOIN `tbl_orders` `o` ON `c`.`customer_id` = `o`.`customer_id`
WHERE `o`.`total` > 500;

-- 11. View: v_payments (เฉพาะ Unpaid)
CREATE OR REPLACE VIEW `v_payments` AS 
SELECT 
    `payment_id`,
    `order_id`,
    `method` AS `payment_method`,
    `amount` AS `payment_amount`,
    `payment_status`,
    `payment_time` AS `payment_date`,
    `payment_time` AS `created_at`
FROM `tbl_payments` 
WHERE `payment_status` = 'Unpaid';

-- 12. View: v_shippings (เฉพาะ Delivered)
CREATE OR REPLACE VIEW `v_shippings` AS 
SELECT 
    `shipping_id`,
    `order_id`,
    `receiver_name` AS `customer_name`,
    `phone` AS `customer_phone`,
    `address` AS `shipping_address`,
    `status` AS `shipping_status`,
    `shipping_time` AS `actual_delivery`,
    `shipping_time` AS `created_at`
FROM `tbl_shippings` 
WHERE `status` = 'Delivered';


CREATE OR REPLACE VIEW `v_customers` AS 
SELECT 
    `customer_id` AS `id`,           -- ดึงจาก customer_id แต่ตั้งชื่อใน View เป็น id
    `firstname` AS `firstname`,
    `fullname` AS `fullname`,
    `lastname` AS `lastname`,
    `address` AS `address`,
    `phone` AS `phonenumber`,        -- ดึงจาก phone แต่ตั้งชื่อใน View เป็น phonenumber
    `email` AS `email`,
    `create_at` AS `created_at`      -- ดึงจาก create_at แต่ตั้งชื่อใน View เป็น created_at
FROM `tbl_customers`;