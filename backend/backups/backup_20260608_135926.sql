-- MySQL dump 10.13  Distrib 8.4.9, for Linux (x86_64)
--
-- Host: localhost    Database: fashion_store
-- ------------------------------------------------------
-- Server version	8.4.9

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `addresses`
--

DROP TABLE IF EXISTS `addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `addresses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `district` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address_line` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_addresses_user_id` (`user_id`),
  KEY `ix_addresses_user_id` (`user_id`),
  KEY `ix_addresses_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
INSERT INTO `addresses` VALUES (1,'4b061550-367a-4935-8e5c-d635cf3bcbb6','Zenitsu YT','087963853','Cambodia','Phnom penh',NULL,'Steung Mean Chey','120603',11.6249,104.857,1,'2026-06-07 07:58:10','2026-06-07 07:58:10');
/*!40000 ALTER TABLE `addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `button_link` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_banners_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (1,'Summer Collection','Discover the latest summer styles',NULL,'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200',NULL,NULL,NULL,NULL,'hero',0,1,NULL,NULL,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(2,'New Arrivals','Shop our newest fashion arrivals',NULL,'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200',NULL,NULL,NULL,NULL,'hero',1,1,NULL,NULL,'2026-06-07 07:45:32','2026-06-07 07:45:32');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branding_settings`
--

DROP TABLE IF EXISTS `branding_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `branding_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `store_logo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `favicon` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `footer_logo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `copyright_text` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contact_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_address` text COLLATE utf8mb4_unicode_ci,
  `social_facebook` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_twitter` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_instagram` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_youtube` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `social_linkedin` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_branding_settings_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branding_settings`
--

LOCK TABLES `branding_settings` WRITE;
/*!40000 ALTER TABLE `branding_settings` DISABLE KEYS */;
INSERT INTO `branding_settings` VALUES (1,'Fashion Store',NULL,NULL,NULL,'All rights reserved.',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-07 07:46:05','2026-06-07 07:46:05');
/*!40000 ALTER TABLE `branding_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `customizations` json DEFAULT NULL,
  `added_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_cart_items_id` (`id`),
  KEY `idx_cart_items_cart_id` (`cart_id`),
  KEY `idx_cart_items_product_id` (`product_id`),
  KEY `ix_cart_items_cart_id` (`cart_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_carts_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_categories_slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `ix_categories_id` (`id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `ix_categories_parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Men\'s Clothing','mens-clothing','Stylish apparel for men',NULL,NULL,1,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(2,'Women\'s Clothing','womens-clothing','Trendy clothing for women',NULL,NULL,1,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(3,'Shoes','shoes','Footwear for every occasion',NULL,NULL,1,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(4,'Accessories','accessories','Complete your look',NULL,NULL,1,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(5,'Kids\' Fashion','kids-fashion','Cute and comfortable kids wear',NULL,NULL,1,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(6,'Sportswear','sportswear','Performance activewear',NULL,NULL,1,'2026-06-07 07:45:32','2026-06-07 07:45:32');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cms_blocks`
--

DROP TABLE IF EXISTS `cms_blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cms_blocks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `block_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` json DEFAULT NULL,
  `sort_order` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `publish_at` datetime DEFAULT NULL,
  `unpublish_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_cms_blocks_slug` (`slug`),
  KEY `ix_cms_blocks_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cms_blocks`
--

LOCK TABLES `cms_blocks` WRITE;
/*!40000 ALTER TABLE `cms_blocks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cms_blocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coupons`
--

DROP TABLE IF EXISTS `coupons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coupons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `discount_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discount_value` float NOT NULL,
  `min_order_amount` float NOT NULL,
  `max_uses` int NOT NULL,
  `used_count` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `starts_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_coupons_code` (`code`),
  KEY `ix_coupons_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coupons`
--

LOCK TABLES `coupons` WRITE;
/*!40000 ALTER TABLE `coupons` DISABLE KEYS */;
INSERT INTO `coupons` VALUES (1,'WELCOME10','10% off for new customers','percentage',10,0,100,0,1,NULL,NULL,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(2,'FREESHIP','$5 off order','fixed',5,50,50,0,1,NULL,NULL,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(3,'FASHION20','20% off seasonal collection','percentage',20,0,200,0,1,NULL,'2026-08-06 07:45:32','2026-06-07 07:45:32','2026-06-07 07:45:32');
/*!40000 ALTER TABLE `coupons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_slot_bookings`
--

DROP TABLE IF EXISTS `delivery_slot_bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_slot_bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slot_id` int NOT NULL,
  `order_id` int NOT NULL,
  `delivery_date` date NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_slot_date_order` (`slot_id`,`delivery_date`,`order_id`),
  UNIQUE KEY `order_id` (`order_id`),
  KEY `ix_delivery_slot_bookings_slot_id` (`slot_id`),
  KEY `ix_delivery_slot_bookings_id` (`id`),
  CONSTRAINT `delivery_slot_bookings_ibfk_1` FOREIGN KEY (`slot_id`) REFERENCES `delivery_slots` (`id`) ON DELETE CASCADE,
  CONSTRAINT `delivery_slot_bookings_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_slot_bookings`
--

LOCK TABLES `delivery_slot_bookings` WRITE;
/*!40000 ALTER TABLE `delivery_slot_bookings` DISABLE KEYS */;
/*!40000 ALTER TABLE `delivery_slot_bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `delivery_slots`
--

DROP TABLE IF EXISTS `delivery_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `delivery_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `max_capacity` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_delivery_slots_id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `delivery_slots`
--

LOCK TABLES `delivery_slots` WRITE;
/*!40000 ALTER TABLE `delivery_slots` DISABLE KEYS */;
/*!40000 ALTER TABLE `delivery_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `homepage_sections`
--

DROP TABLE IF EXISTS `homepage_sections`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `homepage_sections` (
  `id` int NOT NULL AUTO_INCREMENT,
  `section_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `hero_title` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_subtitle` text COLLATE utf8mb4_unicode_ci,
  `hero_cta_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_cta_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_bg_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_bg_video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_overlay_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_overlay_opacity` float DEFAULT NULL,
  `hero_text_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hero_badge_text` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bg_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bg_color` varchar(7) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bg_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bg_video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_homepage_sections_id` (`id`),
  KEY `ix_homepage_sections_section_type` (`section_type`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `homepage_sections`
--

LOCK TABLES `homepage_sections` WRITE;
/*!40000 ALTER TABLE `homepage_sections` DISABLE KEYS */;
INSERT INTO `homepage_sections` VALUES (2,'hero',0,1,'Summer Collection 2026','Discover the latest trends in sustainable fashion. Fresh styles for a brighter future.','Shop Now','/shop','https://m.media-amazon.com/images/I/81wM67ZuKTL._AC_UF1000,1000_QL80_.jpg',NULL,'#0f172a',0.4,'#ffffff','New Season','color',NULL,NULL,NULL,NULL,'2026-06-07 07:51:02','2026-06-08 01:54:28'),(3,'categories',1,0,NULL,NULL,NULL,NULL,NULL,NULL,'#0c1445',0.6,'#ffffff',NULL,'color',NULL,NULL,NULL,'{\"items\": [{\"name\": \"Men\'s Clothing\", \"slug\": \"mens-clothing\", \"image\": \"https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=500&q=80\"}, {\"name\": \"Women\'s Clothing\", \"slug\": \"womens-clothing\", \"image\": \"https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&q=80\"}, {\"name\": \"Shoes\", \"slug\": \"shoes\", \"image\": \"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80\"}, {\"name\": \"Accessories\", \"slug\": \"accessories\", \"image\": \"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80\"}], \"title\": \"Shop by Category\", \"subtitle\": \"Explore our curated collections across all departments.\"}','2026-06-07 07:51:02','2026-06-07 07:52:41'),(4,'featured_products',2,0,NULL,NULL,NULL,NULL,NULL,NULL,'#0c1445',0.6,'#ffffff',NULL,'color','#f8fafc',NULL,NULL,'{\"limit\": 8, \"title\": \"New Arrivals\", \"subtitle\": \"The most anticipated pieces of the season have arrived.\"}','2026-06-07 07:51:02','2026-06-07 07:52:41'),(5,'promo_banner',3,0,'Member Exclusive: 20% Off','Join our membership program today and get an extra 20% off your first order plus free shipping on all orders over $50.','Join Now','/auth/register','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80',NULL,'#1e293b',0.7,'#ffffff',NULL,'color',NULL,NULL,NULL,NULL,'2026-06-07 07:51:02','2026-06-07 07:52:41'),(6,'newsletter',4,0,NULL,NULL,NULL,NULL,NULL,NULL,'#0c1445',0.6,'#ffffff',NULL,'color',NULL,NULL,NULL,'{\"title\": \"Stay in the Loop\", \"subtitle\": \"Subscribe to our newsletter to receive updates on new arrivals, special offers, and styling tips.\", \"button_text\": \"Subscribe\", \"placeholder\": \"Enter your email address\"}','2026-06-07 07:51:02','2026-06-07 07:52:41');
/*!40000 ALTER TABLE `homepage_sections` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_logs`
--

DROP TABLE IF EXISTS `inventory_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventory_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `adjustment_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity_change` int NOT NULL,
  `quantity_before` int NOT NULL,
  `quantity_after` int NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `adjusted_by` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_inventory_logs_created_at` (`created_at`),
  KEY `idx_inventory_logs_product_id` (`product_id`),
  KEY `ix_inventory_logs_product_id` (`product_id`),
  KEY `ix_inventory_logs_id` (`id`),
  CONSTRAINT `inventory_logs_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_logs`
--

LOCK TABLES `inventory_logs` WRITE;
/*!40000 ALTER TABLE `inventory_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media_library`
--

DROP TABLE IF EXISTS `media_library`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `media_library` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `original_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `media_type` enum('IMAGE','VIDEO','DOCUMENT','OTHER') COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `width` int DEFAULT NULL,
  `height` int DEFAULT NULL,
  `alt_text` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `folder` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_media_library_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_library`
--

LOCK TABLES `media_library` WRITE;
/*!40000 ALTER TABLE `media_library` DISABLE KEYS */;
INSERT INTO `media_library` VALUES (4,'81wM67ZuKTL._AC_UF1000,1000_QL80_.jpg','81wM67ZuKTL._AC_UF1000,1000_QL80_.jpg','https://m.media-amazon.com/images/I/81wM67ZuKTL._AC_UF1000,1000_QL80_.jpg','IMAGE',NULL,NULL,NULL,NULL,'81wM67ZuKTL._AC_UF1000,1000_QL80_.jpg','/','2026-06-08 01:44:26','2026-06-08 01:44:26');
/*!40000 ALTER TABLE `media_library` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price` float NOT NULL,
  `total_price` float NOT NULL,
  `customizations` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `idx_order_items_order_id` (`order_id`),
  KEY `ix_order_items_order_id` (`order_id`),
  KEY `ix_order_items_id` (`id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,19,'Tote Bag','SKU-TOTE-BAG',1,89.99,89.99,'null'),(2,1,22,'Denim Overall','SKU-DENIM-OVERALL',1,44.99,44.99,'null');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtotal` float NOT NULL,
  `shipping` float NOT NULL,
  `discount` float NOT NULL,
  `coupon_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `coupon_discount` float NOT NULL,
  `total` float NOT NULL,
  `shipping_address_id` int DEFAULT NULL,
  `billing_address_id` int DEFAULT NULL,
  `shipping_address_snapshot` json DEFAULT NULL,
  `is_new` int NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `preferred_delivery_date` date DEFAULT NULL,
  `delivery_slot_id` int DEFAULT NULL,
  `driver_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_reference` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bakong_account_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `khqr_md5` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_qr` text COLLATE utf8mb4_unicode_ci,
  `payment_expires_at` datetime DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `payment_failure_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_orders_order_number` (`order_number`),
  KEY `shipping_address_id` (`shipping_address_id`),
  KEY `billing_address_id` (`billing_address_id`),
  KEY `ix_orders_driver_id` (`driver_id`),
  KEY `ix_orders_khqr_md5` (`khqr_md5`),
  KEY `idx_orders_user_id` (`user_id`),
  KEY `ix_orders_user_id` (`user_id`),
  KEY `ix_orders_id` (`id`),
  KEY `idx_orders_khqr_md5` (`khqr_md5`),
  KEY `ix_orders_delivery_slot_id` (`delivery_slot_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`billing_address_id`) REFERENCES `addresses` (`id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`delivery_slot_id`) REFERENCES `delivery_slots` (`id`),
  CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD-5BABB2D53EF4','4b061550-367a-4935-8e5c-d635cf3bcbb6','processing','COD','pending',134.98,0,0,NULL,0,134.98,1,1,'{\"city\": \"Phnom penh\", \"phone\": \"087963853\", \"country\": \"Cambodia\", \"district\": null, \"latitude\": 11.6249, \"full_name\": \"Zenitsu YT\", \"longitude\": 104.857, \"postal_code\": \"120603\", \"address_line\": \"Steung Mean Chey\"}',0,NULL,NULL,NULL,'8bddeef5-c8ea-4b28-81b2-bba8a6d86f98',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-06-07 07:59:47','2026-06-07 08:00:18');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_product_images_product_id` (`product_id`),
  KEY `idx_product_images_product_id` (`product_id`),
  KEY `ix_product_images_id` (`id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_option_values`
--

DROP TABLE IF EXISTS `product_option_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_option_values` (
  `id` int NOT NULL AUTO_INCREMENT,
  `option_id` int NOT NULL,
  `value` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price_modifier` float NOT NULL,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_product_option_values_id` (`id`),
  KEY `ix_product_option_values_option_id` (`option_id`),
  CONSTRAINT `product_option_values_ibfk_1` FOREIGN KEY (`option_id`) REFERENCES `product_options` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_option_values`
--

LOCK TABLES `product_option_values` WRITE;
/*!40000 ALTER TABLE `product_option_values` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_option_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_options`
--

DROP TABLE IF EXISTS `product_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_required` tinyint(1) NOT NULL,
  `sort_order` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_product_options_id` (`id`),
  KEY `ix_product_options_product_id` (`product_id`),
  CONSTRAINT `product_options_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_options`
--

LOCK TABLES `product_options` WRITE;
/*!40000 ALTER TABLE `product_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_description` text COLLATE utf8mb4_unicode_ci,
  `description` text COLLATE utf8mb4_unicode_ci,
  `price` float NOT NULL,
  `discount_price` float DEFAULT NULL,
  `stock_quantity` int NOT NULL,
  `thumbnail` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `brand` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `weight` float DEFAULT NULL,
  `length` float DEFAULT NULL,
  `width` float DEFAULT NULL,
  `height` float DEFAULT NULL,
  `is_featured` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_customizable` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_products_slug` (`slug`),
  UNIQUE KEY `ix_products_sku` (`sku`),
  KEY `idx_product_slug` (`slug`),
  KEY `ix_products_category_id` (`category_id`),
  KEY `idx_sku` (`sku`),
  KEY `ix_products_id` (`id`),
  KEY `idx_category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Classic Oxford Shirt','classic-oxford-shirt','SKU-CLASSIC-OXFORD-SHIRT','Premium Classic Oxford Shirt — Tailored Fit.',NULL,49.99,NULL,100,'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80','Tailored Fit',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(2,1,'Slim Fit Chinos','slim-fit-chinos','SKU-SLIM-FIT-CHINOS','Premium Slim Fit Chinos — Urban Khaki.',NULL,59.99,NULL,80,'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&q=80','Urban Khaki',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(3,1,'Denim Jacket','denim-jacket','SKU-DENIM-JACKET','Premium Denim Jacket — Rugged Wear.',NULL,89.99,NULL,40,'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80','Rugged Wear',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(4,1,'Wool Blend Blazer','wool-blend-blazer','SKU-WOOL-BLEND-BLAZER','Premium Wool Blend Blazer — Executive Class.',NULL,149.99,NULL,25,'https://images.unsplash.com/photo-1591369822096-5e36b32cd035?w=500&q=80','Executive Class',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(5,1,'Cotton Crew Neck T-Shirt','cotton-crew-neck-t-shirt','SKU-COTTON-CREW-NECK-T-SHIRT','Premium Cotton Crew Neck T-Shirt — Essential Basics.',NULL,24.99,NULL,200,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80','Essential Basics',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(6,2,'Floral Maxi Dress','floral-maxi-dress','SKU-FLORAL-MAXI-DRESS','Premium Floral Maxi Dress — Boho Chic.',NULL,79.99,NULL,50,'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80','Boho Chic',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(7,2,'Tailored Blazer','tailored-blazer','SKU-TAILORED-BLAZER','Premium Tailored Blazer — Sheer Elegance.',NULL,129.99,NULL,35,'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80','Sheer Elegance',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(8,2,'Cashmere Sweater','cashmere-sweater','SKU-CASHMERE-SWEATER','Premium Cashmere Sweater — Luxe Knits.',NULL,99.99,NULL,45,'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80','Luxe Knits',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(9,2,'High-Waist Jeans','high-waist-jeans','SKU-HIGH-WAIST-JEANS','Premium High-Waist Jeans — Denim Co..',NULL,69.99,NULL,75,'https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=500&q=80','Denim Co.',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(10,2,'Silk Blouse','silk-blouse','SKU-SILK-BLOUSE','Premium Silk Blouse — Silk Road.',NULL,89.99,NULL,40,'https://images.unsplash.com/photo-1608236415050-3e2eb1c97bb8?w=500&q=80','Silk Road',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(11,3,'Running Sneakers','running-sneakers','SKU-RUNNING-SNEAKERS','Premium Running Sneakers — AirStep.',NULL,119.99,NULL,60,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80','AirStep',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(12,3,'Leather Loafers','leather-loafers','SKU-LEATHER-LOAFERS','Premium Leather Loafers — Gentleman\'s Choice.',NULL,99.99,NULL,40,'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500&q=80','Gentleman\'s Choice',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(13,3,'Chelsea Boots','chelsea-boots','SKU-CHELSEA-BOOTS','Premium Chelsea Boots — Urban Boot Co..',NULL,149.99,NULL,30,'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=500&q=80','Urban Boot Co.',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(14,3,'Canvas Slip-Ons','canvas-slip-ons','SKU-CANVAS-SLIP-ONS','Premium Canvas Slip-Ons — Casual Step.',NULL,44.99,NULL,90,'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&q=80','Casual Step',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(15,3,'Heeled Sandals','heeled-sandals','SKU-HEELED-SANDALS','Premium Heeled Sandals — Stiletto.',NULL,69.99,NULL,50,'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80','Stiletto',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(16,4,'Leather Watch','leather-watch','SKU-LEATHER-WATCH','Premium Leather Watch — Timeless.',NULL,199.99,NULL,30,'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&q=80','Timeless',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(17,4,'Aviator Sunglasses','aviator-sunglasses','SKU-AVIATOR-SUNGLASSES','Premium Aviator Sunglasses — Vue Optics.',NULL,129.99,NULL,60,'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80','Vue Optics',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(18,4,'Silk Scarf','silk-scarf','SKU-SILK-SCARF','Premium Silk Scarf — Elegance.',NULL,39.99,NULL,80,'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&q=80','Elegance',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(19,4,'Tote Bag','tote-bag','SKU-TOTE-BAG','Premium Tote Bag — CarryAll.',NULL,89.99,NULL,44,'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=500&q=80','CarryAll',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:59:47'),(20,4,'Leather Belt','leather-belt','SKU-LEATHER-BELT','Premium Leather Belt — Buckle Up.',NULL,49.99,NULL,100,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80','Buckle Up',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(21,5,'Graphic Tee','graphic-tee','SKU-GRAPHIC-TEE','Premium Graphic Tee — FunWear.',NULL,19.99,NULL,150,'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=500&q=80','FunWear',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(22,5,'Denim Overall','denim-overall','SKU-DENIM-OVERALL','Premium Denim Overall — Tiny Trends.',NULL,44.99,NULL,54,'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=500&q=80','Tiny Trends',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:59:47'),(23,5,'Puffer Jacket','puffer-jacket','SKU-PUFFER-JACKET','Premium Puffer Jacket — Cozy Kids.',NULL,59.99,NULL,40,'https://images.unsplash.com/photo-1544923246-77307dd270b8?w=500&q=80','Cozy Kids',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(24,5,'School Backpack','school-backpack','SKU-SCHOOL-BACKPACK','Premium School Backpack — SmartPack.',NULL,39.99,NULL,80,'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=500&q=80','SmartPack',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(25,5,'Kid\'s Sneakers','kids-sneakers','SKU-KIDS-SNEAKERS','Premium Kid\'s Sneakers — Little Feet.',NULL,49.99,NULL,100,'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&q=80','Little Feet',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(26,6,'Yoga Leggings','yoga-leggings','SKU-YOGA-LEGGINGS','Premium Yoga Leggings — FlexFit.',NULL,54.99,NULL,100,'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500&q=80','FlexFit',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(27,6,'Performance Tee','performance-tee','SKU-PERFORMANCE-TEE','Premium Performance Tee — SportZone.',NULL,34.99,NULL,120,'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80','SportZone',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(28,6,'Training Shorts','training-shorts','SKU-TRAINING-SHORTS','Premium Training Shorts — Active Gear.',NULL,29.99,NULL,90,'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80','Active Gear',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(29,6,'Zip-Up Hoodie','zip-up-hoodie','SKU-ZIP-UP-HOODIE','Premium Zip-Up Hoodie — Urban Sport.',NULL,69.99,NULL,60,'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80','Urban Sport',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32'),(30,6,'Sports Bra','sports-bra','SKU-SPORTS-BRA','Premium Sports Bra — Support Plus.',NULL,39.99,NULL,75,'https://images.unsplash.com/photo-1591872028889-2d6c7f976262?w=500&q=80','Support Plus',NULL,NULL,NULL,NULL,0,1,0,'2026-06-07 07:45:32','2026-06-07 07:45:32');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `is_approved` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_review_product_user` (`product_id`,`user_id`),
  KEY `ix_reviews_id` (`id`),
  KEY `idx_reviews_product_id` (`product_id`),
  KEY `ix_reviews_user_id` (`user_id`),
  KEY `idx_reviews_user_id` (`user_id`),
  KEY `ix_reviews_product_id` (`product_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci,
  `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_settings_key` (`key`),
  KEY `ix_settings_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'store_name','Fashion Store','Store display name','2026-06-07 07:45:32','2026-06-07 07:45:32'),(2,'store_email','support@fashionstore.com','Store contact email','2026-06-07 07:45:32','2026-06-07 07:45:32'),(3,'shipping_rate','5.00','Default shipping rate','2026-06-07 07:45:32','2026-06-07 07:45:32'),(4,'tax_rate','0.08','Tax rate (decimal)','2026-06-07 07:45:32','2026-06-07 07:45:32'),(5,'low_stock_threshold','5','Low stock alert threshold','2026-06-07 07:45:32','2026-06-07 07:45:32'),(6,'homepage_video_enabled','false','Enable background video on storefront homepage','2026-06-07 07:49:39','2026-06-08 11:40:16'),(7,'homepage_video_url','','Direct MP4 URL for homepage background video','2026-06-07 07:49:39','2026-06-07 07:49:39'),(8,'enable_delivery_scheduling','false','Enable delivery scheduling feature for checkout','2026-06-07 07:49:39','2026-06-08 12:39:35');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `theme_settings`
--

DROP TABLE IF EXISTS `theme_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `theme_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_dark_mode` tinyint(1) NOT NULL,
  `primary_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `secondary_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accent_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `background_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `surface_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `header_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `footer_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text_primary_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text_secondary_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `button_bg_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `button_text_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `success_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warning_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `error_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `border_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `font_family` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `heading_font_size` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body_font_size` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `font_weight` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line_height` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `container_width` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grid_columns` int NOT NULL,
  `card_style` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `border_radius` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `box_shadow` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `section_spacing` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `header_height` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `footer_height` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `button_border_radius` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `button_padding` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `button_hover_color` varchar(7) COLLATE utf8mb4_unicode_ci NOT NULL,
  `button_hover_animation` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `button_shadow` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `preview_image` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_theme_settings_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `theme_settings`
--

LOCK TABLES `theme_settings` WRITE;
/*!40000 ALTER TABLE `theme_settings` DISABLE KEYS */;
INSERT INTO `theme_settings` VALUES (2,'Nature Fresh',0,0,'#059669','#047857','#34d399','#f0fdf4','#ffffff','#064e3b','#064e3b','#064e3b','#374151','#059669','#ffffff','#10b981','#f59e0b','#ef4444','#dcfce7','\'Outfit\', sans-serif','2.75rem','1.05rem','400','1.7','1200px',4,'rounded-3xl','1.5rem','0 4px 20px -2px rgba(5, 150, 105, 0.1)','6rem','5rem','auto','2rem','1rem 2rem','#047857','bounce','0 10px 15px -3px rgba(5, 150, 105, 0.2)',NULL,'2026-06-07 07:45:32','2026-06-08 13:27:59'),(3,'Default Theme',0,0,'#2563eb','#4f46e5','#38bdf8','#f9fafb','#ffffff','#0c1445','#0c1445','#111827','#6b7280','#2563eb','#ffffff','#10b981','#f59e0b','#ef4444','#e5e7eb','Inter, system-ui, sans-serif','2.5rem','1rem','400','1.6','1280px',4,'rounded-xl','0.75rem','0 1px 3px rgba(0,0,0,0.1)','4rem','4rem','auto','0.5rem','0.75rem 1.5rem','#1d4ed8','scale','0 4px 6px rgba(0,0,0,0.1)',NULL,'2026-06-07 07:45:32','2026-06-08 13:27:59'),(4,'Pink Blossom',0,0,'#ec4899','#be185d','#fbcfe8','#fff1f2','#ffffff','#831843','#831843','#831843','#be185d','#ec4899','#ffffff','#10b981','#f59e0b','#ef4444','#ffe4e6','\"Plus Jakarta Sans\", sans-serif','2.5rem','1rem','400','1.6','1280px',4,'rounded-2xl','1rem','0 10px 15px -3px rgba(236, 72, 153, 0.1)','5rem','4.5rem','auto','9999px','0.875rem 2rem','#db2777','scale','0 4px 6px -1px rgba(236, 72, 153, 0.3)',NULL,'2026-06-07 07:54:13','2026-06-08 13:27:59'),(5,'Midnight Pro',0,1,'#3b82f6','#1d4ed8','#60a5fa','#0f172a','#1e293b','#0f172a','#0f172a','#f8fafc','#94a3b8','#3b82f6','#ffffff','#10b981','#f59e0b','#ef4444','#334155','\'Inter\', sans-serif','2.5rem','1rem','400','1.6','1280px',4,'rounded-2xl','1rem','0 10px 15px -3px rgba(0, 0, 0, 0.3)','5rem','4.5rem','auto','0.75rem','0.875rem 1.75rem','#2563eb','scale-up','0 4px 6px -1px rgba(0, 0, 0, 0.2)',NULL,'2026-06-07 14:15:49','2026-06-08 13:27:59'),(7,'Sunset Glow',0,0,'#f97316','#ea580c','#fb923c','#fff7ed','#ffffff','#431407','#431407','#431407','#713f12','#f97316','#ffffff','#10b981','#f59e0b','#ef4444','#ffedd5','\'Plus Jakarta Sans\', sans-serif','2.5rem','1rem','500','1.5','1440px',5,'rounded-none','0px','5px 5px 0px rgba(249, 115, 22, 0.2)','4rem','4rem','auto','0px','0.75rem 2rem','#ea580c','slide','4px 4px 0px #431407',NULL,'2026-06-07 14:15:49','2026-06-08 13:27:59'),(8,'Ocean Breeze',0,0,'#0891b2','#0e7490','#22d3ee','#f0f9ff','#ffffff','#083344','#083344','#083344','#334155','#0891b2','#ffffff','#10b981','#f59e0b','#ef4444','#e0f2fe','\'DM Sans\', sans-serif','3rem','1.1rem','400','1.6','1100px',3,'rounded-lg','0.5rem','0 4px 6px -1px rgba(0, 0, 0, 0.1)','5rem','4rem','auto','0.5rem','0.75rem 1.5rem','#0e7490','fade','none',NULL,'2026-06-07 14:15:49','2026-06-08 13:27:59'),(10,'Royal Purple',0,1,'#7c3aed','#6d28d9','#a78bfa','#111827','#1f2937','#0f172a','#0f172a','#f9fafb','#cbd5e1','#7c3aed','#ffffff','#10b981','#f59e0b','#ef4444','#374151','\'Poppins\', sans-serif','2.75rem','1rem','500','1.6','1280px',4,'glassmorphism','1rem','0 8px 32px rgba(124, 58, 237, 0.25)','5rem','4.5rem','auto','0.75rem','0.875rem 1.75rem','#6d28d9','glow','0 4px 20px rgba(124, 58, 237, 0.4)',NULL,'2026-06-07 14:15:49','2026-06-08 13:27:59'),(11,'Luxury Gold',1,0,'#d4af37','#b8860b','#f4d03f','#fdfcf8','#ffffff','#1f2937','#1f2937','#111827','#4b5563','#d4af37','#ffffff','#10b981','#f59e0b','#ef4444','#f3e8c8','\'Playfair Display\', serif','3rem','1.05rem','400','1.8','1400px',4,'elegant','0.75rem','0 10px 30px rgba(212, 175, 55, 0.15)','6rem','5rem','auto','9999px','1rem 2.5rem','#b8860b','lift','0 6px 20px rgba(212, 175, 55, 0.3)',NULL,'2026-06-07 14:15:49','2026-06-08 13:27:59');
/*!40000 ALTER TABLE `theme_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `telegram_chat_id` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telegram_link_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telegram_link_token_expires_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_email` (`email`),
  KEY `ix_users_telegram_link_token` (`telegram_link_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('03a7caa0-70bd-48c5-923d-66e178603336','staff@fashionstore.com','$2b$12$NazxioSaGU/Ombm0npxeyebbAs5sTJ6krx3UzNdmOcHJJ.zHPK7Nq','Staff','User','staff',1,NULL,NULL,NULL,'2026-06-07 07:45:32','2026-06-07 07:45:32'),('47733757-9d33-4f3f-b470-62606dc42a8c','customer@example.com','$2b$12$e6t6VrTNuCcJvtUqPEzOvu9e/fYP42zXnz/mWWpnXA8MrSfz3OLbG','John','Doe','customer',1,NULL,NULL,NULL,'2026-06-07 07:45:32','2026-06-07 07:45:32'),('4b061550-367a-4935-8e5c-d635cf3bcbb6','admin@fashionstore.com','$2b$12$7BG.P4UN5dgAdI1AZWTJ..IdwuzQaH6ciEOTFqXiIyitRBTPdRKL2','Admin','User','admin',1,NULL,NULL,NULL,'2026-06-07 07:45:32','2026-06-07 07:45:32'),('8bddeef5-c8ea-4b28-81b2-bba8a6d86f98','zenitsuidc@gmail.com','$2b$12$9dSpLyBnVypCrw8eL/F8.e1hmL3ldms9na9o9JUPq6qt/lVKidGIG','Zenitsu','YT','driver',1,NULL,NULL,NULL,'2026-06-07 07:58:46','2026-06-07 07:58:46');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlist_items`
--

DROP TABLE IF EXISTS `wishlist_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlist_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `wishlist_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` int NOT NULL,
  `added_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist_product` (`wishlist_id`,`product_id`),
  KEY `idx_wishlist_items_product_id` (`product_id`),
  KEY `ix_wishlist_items_wishlist_id` (`wishlist_id`),
  KEY `ix_wishlist_items_id` (`id`),
  KEY `idx_wishlist_items_wishlist_id` (`wishlist_id`),
  CONSTRAINT `wishlist_items_ibfk_1` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists` (`id`) ON DELETE CASCADE,
  CONSTRAINT `wishlist_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlist_items`
--

LOCK TABLES `wishlist_items` WRITE;
/*!40000 ALTER TABLE `wishlist_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlist_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wishlists`
--

DROP TABLE IF EXISTS `wishlists`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wishlists` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_wishlists_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wishlists`
--

LOCK TABLES `wishlists` WRITE;
/*!40000 ALTER TABLE `wishlists` DISABLE KEYS */;
/*!40000 ALTER TABLE `wishlists` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-08 20:59:26
