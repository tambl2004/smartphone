CREATE DATABASE IF NOT EXISTS smartphone CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartphone;

-- Users and roles
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff', 'customer') NOT NULL DEFAULT 'customer',
    phone VARCHAR(20) NULL,
    avatar_url VARCHAR(500) NULL,
    status ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB;

-- Product taxonomy
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(50) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_categories_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS brands (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_brands_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(150) NOT NULL,
    sku VARCHAR(100) NULL,
    name VARCHAR(255) NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    brand_id BIGINT UNSIGNED NOT NULL,
    price DECIMAL(15,0) NOT NULL,
    original_price DECIMAL(15,0) NULL,
    discount_percent INT NOT NULL DEFAULT 0,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0,
    reviews_count INT NOT NULL DEFAULT 0,
    stock INT NOT NULL DEFAULT 0,
    description TEXT NULL,
    featured TINYINT(1) NOT NULL DEFAULT 0,
    status ENUM('active', 'draft', 'out_of_stock', 'hidden') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_products_slug (slug),
    UNIQUE KEY uk_products_sku (sku),
    KEY idx_products_category (category_id),
    KEY idx_products_brand (brand_id),
    KEY idx_products_featured (featured),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_products_brand FOREIGN KEY (brand_id) REFERENCES brands(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_images (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    product_id BIGINT UNSIGNED NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_primary TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_product_images_product (product_id),
    CONSTRAINT fk_product_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_specs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    product_id BIGINT UNSIGNED NOT NULL,
    spec_name VARCHAR(255) NOT NULL,
    spec_value VARCHAR(500) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_product_specs_product (product_id),
    CONSTRAINT fk_product_specs_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Marketing content
CREATE TABLE IF NOT EXISTS banners (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(150) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500) NULL,
    image_url VARCHAR(500) NOT NULL,
    link_url VARCHAR(500) NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_banners_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS news_categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_news_categories_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS news_articles (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    slug VARCHAR(180) NOT NULL,
    category_id BIGINT UNSIGNED NULL,
    title VARCHAR(255) NOT NULL,
    excerpt VARCHAR(1000) NULL,
    image_url VARCHAR(500) NULL,
    author_name VARCHAR(255) NULL,
    author_avatar_url VARCHAR(500) NULL,
    published_at DATETIME NULL,
    read_time_minutes INT NOT NULL DEFAULT 0,
    featured TINYINT(1) NOT NULL DEFAULT 0,
    content LONGTEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_news_articles_slug (slug),
    KEY idx_news_articles_category (category_id),
    KEY idx_news_articles_featured (featured),
    CONSTRAINT fk_news_articles_category FOREIGN KEY (category_id) REFERENCES news_categories(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS news_article_related (
    article_id BIGINT UNSIGNED NOT NULL,
    related_article_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (article_id, related_article_id),
    KEY idx_related_article (related_article_id),
    CONSTRAINT fk_related_article_source FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_related_article_target FOREIGN KEY (related_article_id) REFERENCES news_articles(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Commerce
CREATE TABLE IF NOT EXISTS customers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    avatar_url VARCHAR(500) NULL,
    total_orders INT NOT NULL DEFAULT 0,
    total_spent DECIMAL(15,0) NOT NULL DEFAULT 0,
    status ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
    join_date DATE NULL,
    last_order_date DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_customers_code (code),
    UNIQUE KEY uk_customers_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_code VARCHAR(50) NOT NULL,
    customer_id BIGINT UNSIGNED NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_address VARCHAR(500) NOT NULL,
    total_amount DECIMAL(15,0) NOT NULL,
    payment_method ENUM('cod', 'bank_transfer', 'credit_card', 'wallet') NOT NULL DEFAULT 'cod',
    status ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_orders_code (order_code),
    KEY idx_orders_customer (customer_id),
    KEY idx_orders_status (status),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image_url VARCHAR(500) NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(15,0) NOT NULL,
    line_total DECIMAL(15,0) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_order_items_order (order_id),
    KEY idx_order_items_product (product_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS wishlists (
    user_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_id),
    KEY idx_wishlists_product (product_id),
    CONSTRAINT fk_wishlists_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_wishlists_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS carts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NULL,
    session_id VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_carts_user (user_id),
    UNIQUE KEY uk_carts_session (session_id),
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    cart_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_cart_items_cart_product (cart_id, product_id),
    KEY idx_cart_items_product (product_id),
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS faqs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stores (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    opening_hours VARCHAR(255) NULL,
    phone VARCHAR(20) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Seed data from web/src/data
INSERT INTO categories (id, slug, name, icon) VALUES
(1, 'smartphones', 'Điện thoại', '📱'),
(2, 'tablets', 'Máy tính bảng', '平板'),
(3, 'accessories', 'Phụ kiện', '🎧')
ON DUPLICATE KEY UPDATE name = VALUES(name), icon = VALUES(icon);

INSERT INTO brands (id, slug, name) VALUES
(1, 'apple', 'Apple'),
(2, 'samsung', 'Samsung'),
(3, 'xiaomi', 'Xiaomi'),
(4, 'oppo', 'OPPO')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO products (id, slug, name, category_id, brand_id, price, original_price, discount_percent, rating, reviews_count, stock, description, featured, status) VALUES
(1, 'iphone-15-pro-max', 'iPhone 15 Pro Max 256GB', 1, 1, 29990000, 34990000, 14, 4.80, 128, 15, 'iPhone 15 Pro Max có thiết kế titan chuẩn hàng không vũ trụ bền bỉ, nhẹ nhàng. Nút Tác vụ (Action Button) hoàn toàn mới giúp cá nhân hóa phím tắt tiện lợi.', 1, 'active'),
(2, 'samsung-galaxy-s24-ultra', 'Samsung Galaxy S24 Ultra 256GB', 1, 2, 28990000, 33990000, 15, 4.90, 95, 20, 'Galaxy S24 Ultra đánh dấu kỷ nguyên mới của AI di động (Galaxy AI). Thiết kế khung viền Titan sang trọng và bút S Pen tiện lợi.', 1, 'active'),
(3, 'xiaomi-14-ultra', 'Xiaomi 14 Ultra 512GB', 1, 3, 26990000, 29990000, 10, 4.70, 42, 8, 'Xiaomi 14 Ultra sở hữu ống kính quang học Leica thế hệ mới cùng cảm biến lớn 1-inch, đem lại chất lượng hình ảnh nghệ thuật đỉnh cao.', 1, 'active'),
(4, 'ipad-pro-m4-11', 'iPad Pro M4 11-inch Wifi 256GB', 2, 1, 26490000, 28990000, 8, 4.90, 35, 12, 'iPad Pro M4 có thiết kế siêu mỏng đột phá cùng màn hình Ultra Retina XDR sử dụng công nghệ OLED hai lớp tiên tiến, kết hợp sức mạnh phi thường của chip M4.', 0, 'active'),
(5, 'oppo-find-n3-flip', 'OPPO Find N3 Flip 256GB', 1, 4, 19990000, 22990000, 13, 4.60, 29, 10, 'OPPO Find N3 Flip nâng tầm điện thoại gập với bộ 3 camera Hasselblad đẳng cấp cùng màn hình ngoài đa chức năng nâng cấp vô cùng trực quan.', 0, 'active'),
(6, 'airpods-pro-2', 'AirPods Pro (Gen 2)', 3, 1, 5990000, 6990000, 14, 4.80, 215, 50, 'Tai nghe AirPods Pro thế hệ 2 với khả năng chống ồn chủ động xuất sắc, xuyên âm tự nhiên và âm thanh không gian sống động.', 1, 'active'),
(7, 'galaxy-tab-s9-ultra', 'Samsung Galaxy Tab S9 Ultra 5G 256GB', 2, 2, 29990000, 32990000, 9, 4.90, 42, 15, 'Máy tính bảng cao cấp nhất của Samsung với màn hình khổng lồ, hiệu năng mạnh mẽ và bút S Pen đi kèm.', 0, 'active'),
(8, 'sony-wh-1000xm5', 'Tai nghe chụp tai Sony WH-1000XM5', 3, 5, 7490000, 8490000, 12, 4.70, 89, 25, 'Tai nghe chống ồn đỉnh cao từ Sony, thiết kế nhẹ nhàng, cảm giác đeo thoải mái và âm thanh độ phân giải cao Hi-Res.', 1, 'active'),
(9, 'iphone-14-pro', 'iPhone 14 Pro 128GB', 1, 1, 22990000, 25990000, 11, 4.80, 312, 40, 'iPhone 14 Pro với Dynamic Island sáng tạo, camera chính 48MP cho hình ảnh siêu sắc nét và chip A16 Bionic cực kỳ mạnh mẽ.', 0, 'active'),
(10, 'apple-watch-series-9', 'Apple Watch Series 9 GPS 41mm', 3, 1, 9490000, 10490000, 9, 4.90, 75, 30, 'Apple Watch Series 9 sở hữu màn hình sáng gấp đôi, chip S9 SiP xử lý siêu mượt và tính năng Double Tap chạm hai lần để điều khiển thông minh.', 0, 'active')
ON DUPLICATE KEY UPDATE
name = VALUES(name),
category_id = VALUES(category_id),
brand_id = VALUES(brand_id),
price = VALUES(price),
original_price = VALUES(original_price),
discount_percent = VALUES(discount_percent),
rating = VALUES(rating),
reviews_count = VALUES(reviews_count),
stock = VALUES(stock),
description = VALUES(description),
featured = VALUES(featured),
status = VALUES(status);

INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60', 0, 1),
(1, 'https://images.unsplash.com/photo-1695048133031-64d88e63a17e?w=500&auto=format&fit=crop&q=60', 1, 0),
(2, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=60', 0, 1),
(3, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60', 0, 1),
(4, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&auto=format&fit=crop&q=60', 0, 1),
(5, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=60', 0, 1),
(6, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500&auto=format&fit=crop&q=60', 0, 1),
(7, 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=500&auto=format&fit=crop&q=60', 0, 1),
(8, 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&auto=format&fit=crop&q=60', 0, 1),
(9, 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500&auto=format&fit=crop&q=60', 0, 1),
(10, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&auto=format&fit=crop&q=60', 0, 1)
ON DUPLICATE KEY UPDATE image_url = VALUES(image_url), sort_order = VALUES(sort_order), is_primary = VALUES(is_primary);

INSERT INTO product_specs (product_id, spec_name, spec_value, sort_order) VALUES
(1, 'Màn hình', '6.7 inch, Super Retina XDR OLED', 1),
(1, 'Hệ điều hành', 'iOS 17', 2),
(1, 'Chipset', 'Apple A17 Pro 6 nhân', 3),
(1, 'RAM', '8 GB', 4),
(1, 'Bộ nhớ trong', '256 GB', 5),
(1, 'Camera sau', '48 MP + 12 MP + 12 MP', 6),
(1, 'Pin, Sạc', '4441 mAh, 20 W', 7),
(2, 'Màn hình', '6.8 inch, Dynamic AMOLED 2X', 1),
(2, 'Hệ điều hành', 'Android 14', 2),
(2, 'Chipset', 'Snapdragon 8 Gen 3 for Galaxy', 3),
(2, 'RAM', '12 GB', 4),
(2, 'Bộ nhớ trong', '256 GB', 5),
(2, 'Camera sau', '200 MP + 50 MP + 12 MP + 10 MP', 6),
(2, 'Pin, Sạc', '5000 mAh, 45 W', 7),
(3, 'Màn hình', '6.73 inch, AMOLED WQHD+', 1),
(3, 'Hệ điều hành', 'Android 14 (Xiaomi HyperOS)', 2),
(3, 'Chipset', 'Snapdragon 8 Gen 3 8 nhân', 3),
(3, 'RAM', '16 GB', 4),
(3, 'Bộ nhớ trong', '512 GB', 5),
(3, 'Camera sau', '50 MP + 50 MP + 50 MP + 50 MP', 6),
(3, 'Pin, Sạc', '5000 mAh, 90 W', 7),
(4, 'Màn hình', '11 inch, Ultra Retina XDR Tandem OLED', 1),
(4, 'Hệ điều hành', 'iPadOS 17', 2),
(4, 'Chipset', 'Apple M4 9 nhân', 3),
(4, 'RAM', '8 GB', 4),
(4, 'Bộ nhớ trong', '256 GB', 5),
(4, 'Camera sau', '12 MP', 6),
(4, 'Pin, Sạc', '31.29 Wh (~ 8160 mAh)', 7),
(5, 'Màn hình', 'Chính: 6.8 inch, Phụ: 3.26 inch, AMOLED', 1),
(5, 'Hệ điều hành', 'Android 13', 2),
(5, 'Chipset', 'MediaTek Dimensity 9200 8 nhân', 3),
(5, 'RAM', '12 GB', 4),
(5, 'Bộ nhớ trong', '256 GB', 5),
(5, 'Camera sau', '50 MP + 48 MP + 32 MP', 6),
(5, 'Pin, Sạc', '4300 mAh, 44 W', 7),
(6, 'Kết nối', 'Bluetooth 5.3', 1),
(6, 'Thời lượng pin', '6 giờ (lên đến 30 giờ với hộp sạc)', 2),
(6, 'Chống nước', 'IPX4', 3),
(6, 'Tính năng', 'Chống ồn ANC, Xuyên âm', 4),
(7, 'Màn hình', '14.6 inch, Dynamic AMOLED 2X', 1),
(7, 'Hệ điều hành', 'Android 13', 2),
(7, 'Chipset', 'Snapdragon 8 Gen 2 for Galaxy', 3),
(7, 'RAM', '12 GB', 4),
(7, 'Bộ nhớ trong', '256 GB', 5),
(7, 'Pin, Sạc', '11200 mAh, 45 W', 6),
(8, 'Kết nối', 'Bluetooth 5.2, Jack 3.5mm', 1),
(8, 'Thời lượng pin', '30 giờ', 2),
(8, 'Cổng sạc', 'Type-C', 3),
(8, 'Tính năng', 'Chống ồn ANC thông minh', 4),
(9, 'Màn hình', '6.1 inch, Super Retina XDR OLED', 1),
(9, 'Hệ điều hành', 'iOS 16', 2),
(9, 'Chipset', 'Apple A16 Bionic', 3),
(9, 'RAM', '6 GB', 4),
(9, 'Bộ nhớ trong', '128 GB', 5),
(9, 'Camera sau', '48 MP + 12 MP + 12 MP', 6),
(9, 'Pin, Sạc', '3200 mAh, 20 W', 7),
(10, 'Màn hình', '1.69 inch, Retina LTPO OLED', 1),
(10, 'Chất liệu', 'Viền nhôm, dây cao su', 2),
(10, 'Kết nối', 'Bluetooth, Wi-Fi, GPS', 3),
(10, 'Tính năng', 'Đo nhịp tim, oxy máu SpO2, ECG', 4)
ON DUPLICATE KEY UPDATE spec_value = VALUES(spec_value), sort_order = VALUES(sort_order);

INSERT INTO banners (id, slug, title, subtitle, image_url, link_url, is_active, sort_order) VALUES
(1, 'banner-1', 'Galaxy S24 Ultra - Kỷ nguyên Galaxy AI', 'Độc quyền tại shop. Giảm ngay tới 5.000.000đ khi thu cũ đổi mới kèm bộ quà tặng trị giá 2 triệu.', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1200&auto=format&fit=crop&q=80', '/product/samsung-galaxy-s24-ultra', 1, 0),
(2, 'banner-2', 'iPhone 15 Pro Max - Sức mạnh của Titan', 'Khung vỏ titan siêu nhẹ và bền bỉ. Trải nghiệm hệ thống camera 48MP zoom 5x cực đỉnh.', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1200&auto=format&fit=crop&q=80', '/product/iphone-15-pro-max', 1, 1)
ON DUPLICATE KEY UPDATE title = VALUES(title), subtitle = VALUES(subtitle), image_url = VALUES(image_url), link_url = VALUES(link_url), is_active = VALUES(is_active), sort_order = VALUES(sort_order);

INSERT INTO news_categories (id, slug, name) VALUES
(1, 'tat-ca', 'Tất cả'),
(2, 'cong-nghe', 'Công nghệ'),
(3, 'danh-gia', 'Đánh giá'),
(4, 'meo-thu-thuat', 'Mẹo & thủ thuật'),
(5, 'so-sanh', 'So sánh'),
(6, 'tin-tuc', 'Tin tức')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO news_articles (id, slug, category_id, title, excerpt, image_url, author_name, author_avatar_url, published_at, read_time_minutes, featured, content) VALUES
(1, 'iphone-17-pro-lo-dien-thiet-ke-moi', 6, 'iPhone 17 Pro lộ diện thiết kế hoàn toàn mới với camera periscope cải tiến', 'Apple đang chuẩn bị ra mắt iPhone 17 Pro với những thay đổi táo bạo về thiết kế và hệ thống camera, dự kiến sẽ đặt ra tiêu chuẩn mới cho ngành smartphone cao cấp.', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=85', 'Minh Quân', 'https://i.pravatar.cc/100?img=11', '2026-05-24 00:00:00', 5, 1, 'Những rò rỉ mới nhất cho thấy Apple đang chuẩn bị cho một bước nhảy vọt lớn với dòng iPhone 17 Pro, bao gồm thiết kế hoàn toàn mới, hệ thống camera đột phá và chip A19 Pro cực mạnh.'),
(2, 'samsung-galaxy-s25-ultra-review', 3, 'Đánh giá Samsung Galaxy S25 Ultra: Flagship đáng mua nhất 2026', 'Sau hơn 2 tuần sử dụng thực tế, đây là những gì chúng tôi nghĩ về siêu phẩm mới nhất của Samsung — từ hiệu năng đến trải nghiệm camera.', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=1200&q=85', 'Thanh Hà', 'https://i.pravatar.cc/100?img=5', '2026-05-22 00:00:00', 8, 0, 'Galaxy S25 Ultra là smartphone Android đỉnh cao nhất từ trước đến nay của Samsung — nhưng liệu nó có xứng đáng với mức giá 30 triệu đồng không?'),
(3, 'meo-tang-toc-pin-iphone', 4, '7 mẹo đơn giản giúp pin iPhone của bạn dùng được cả ngày dài', 'Pin iPhone luôn là nỗi lo của nhiều người. Áp dụng ngay 7 mẹo này để kéo dài tuổi thọ pin mà không cần mua phụ kiện thêm.', 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1200&q=85', 'Hồng Nhung', 'https://i.pravatar.cc/100?img=9', '2026-05-20 00:00:00', 4, 0, 'Pin iPhone luôn là nỗi lo của nhiều người. Với 7 mẹo đơn giản dưới đây, bạn có thể kéo dài đáng kể thời gian sử dụng mỗi lần sạc.'),
(4, 'so-sanh-pixel-9-vs-iphone-16', 5, 'Google Pixel 9 Pro vs iPhone 16 Pro: Cuộc chiến camera AI 2026', 'Khi Google và Apple đều đẩy mạnh AI vào camera, đâu mới là lựa chọn tốt nhất cho người yêu nhiếp ảnh di động? Chúng tôi so sánh toàn diện.', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=85', 'Văn Khoa', 'https://i.pravatar.cc/100?img=3', '2026-05-18 00:00:00', 10, 0, 'Cuộc chiến camera AI giữa Google và Apple ngày càng trở nên khốc liệt. Chúng tôi đã dành hai tuần để so sánh toàn diện hai flagship này.'),
(5, 'xu-huong-man-hinh-gap-2026', 2, 'Màn hình gập 2026: Từ concept đến sản phẩm thực tế đáng dùng', 'Sau nhiều năm phát triển, điện thoại gập đã trưởng thành đáng kể. Cùng điểm qua những cải tiến nổi bật và xu hướng thiết kế đang định hình tương lai.', 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=1200&q=85', 'Quỳnh Anh', 'https://i.pravatar.cc/100?img=47', '2026-05-15 00:00:00', 6, 0, 'Điện thoại gập đã đi một chặng đường dài từ những chiếc máy mỏng manh, đắt tiền đến những sản phẩm thực sự đáng dùng hàng ngày.'),
(6, 'chon-tai-nghe-bluetooth-cho-iphone', 4, 'Cách chọn tai nghe Bluetooth phù hợp với nhu cầu và ngân sách của bạn', 'Thị trường tai nghe Bluetooth ngày càng đa dạng, khiến việc lựa chọn trở nên khó khăn. Hướng dẫn chi tiết giúp bạn tìm được chiếc tai nghe ưng ý nhất.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=85', 'Minh Quân', 'https://i.pravatar.cc/100?img=11', '2026-05-12 00:00:00', 5, 0, 'Với hàng trăm lựa chọn tai nghe Bluetooth trên thị trường, chọn được chiếc phù hợp là thách thức thực sự. Hướng dẫn này giúp bạn thu hẹp lựa chọn.')
ON DUPLICATE KEY UPDATE title = VALUES(title), excerpt = VALUES(excerpt), image_url = VALUES(image_url), author_name = VALUES(author_name), author_avatar_url = VALUES(author_avatar_url), published_at = VALUES(published_at), read_time_minutes = VALUES(read_time_minutes), featured = VALUES(featured), content = VALUES(content), category_id = VALUES(category_id);

INSERT INTO news_article_related (article_id, related_article_id) VALUES
(1, 2), (1, 4),
(2, 1), (2, 4),
(3, 6), (3, 2),
(4, 1), (4, 2),
(5, 2), (5, 1),
(6, 3), (6, 2)
ON DUPLICATE KEY UPDATE related_article_id = VALUES(related_article_id);

INSERT INTO faqs (question, answer, sort_order, is_active) VALUES
('Tôi có thể đặt hàng online và nhận tại cửa hàng không?', 'Hoàn toàn có thể. Sau khi đặt hàng trực tuyến, bạn chọn hình thức "Nhận tại cửa hàng" và chúng tôi sẽ liên hệ xác nhận khi đơn hàng sẵn sàng trong vòng 2–4 giờ.', 1, 1),
('Chính sách đổi trả hàng của NEXPHONE như thế nào?', 'NEXPHONE hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày mua nếu sản phẩm còn nguyên seal hoặc có lỗi từ nhà sản xuất. Sản phẩm đã kích hoạt được bảo hành 12 tháng.', 2, 1),
('NEXPHONE có hỗ trợ trả góp lãi suất 0% không?', 'Có. Chúng tôi hỗ trợ trả góp 0% qua các thẻ tín dụng liên kết (Visa, Mastercard) và các ứng dụng tài chính như MCredit, Home Credit, FE Credit cho đơn hàng từ 3 triệu đồng trở lên.', 3, 1),
('Làm sao để kiểm tra bảo hành sản phẩm?', 'Bạn có thể kiểm tra bảo hành bằng cách nhập số IMEI của máy tại mục "Tra cứu bảo hành" trên website, hoặc mang máy đến bất kỳ cửa hàng NEXPHONE nào để được hỗ trợ miễn phí.', 4, 1),
('NEXPHONE có giao hàng toàn quốc không?', 'Có, NEXPHONE giao hàng toàn quốc. Miễn phí giao hàng tiêu chuẩn cho đơn từ 500.000đ. Giao hàng trong ngày cho khu vực nội thành Hà Nội, TP. HCM và Đà Nẵng.', 5, 1)
ON DUPLICATE KEY UPDATE answer = VALUES(answer), sort_order = VALUES(sort_order), is_active = VALUES(is_active);

INSERT INTO stores (name, address, opening_hours, phone) VALUES
('NEXPHONE Hà Nội — Cầu Giấy', '145 Cầu Giấy, phường Dịch Vọng Hậu, Cầu Giấy, Hà Nội', 'T2–CN: 8:00 – 21:30', NULL)
ON DUPLICATE KEY UPDATE address = VALUES(address), opening_hours = VALUES(opening_hours), phone = VALUES(phone);

-- Seed admin user for initial login
INSERT INTO users (full_name, email, password_hash, role, status)
VALUES ('Admin', 'admin@gmail.com', '123456', 'admin', 'active')
ON DUPLICATE KEY UPDATE email = email;
