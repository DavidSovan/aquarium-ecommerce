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
  KEY `ix_addresses_id` (`id`),
  KEY `idx_addresses_user_id` (`user_id`),
  KEY `ix_addresses_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `addresses`
--

LOCK TABLES `addresses` WRITE;
/*!40000 ALTER TABLE `addresses` DISABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
INSERT INTO `banners` VALUES (1,'Modern Living Collection','Discover contemporary furniture for every room',NULL,'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200',NULL,NULL,NULL,NULL,'hero',0,1,NULL,NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(2,'Outdoor Essentials','Create your perfect outdoor space',NULL,'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',NULL,NULL,NULL,NULL,'hero',1,1,NULL,NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56');
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
INSERT INTO `branding_settings` VALUES (1,'Furniture Store',NULL,NULL,NULL,'© 2026 Furniture Store. All rights reserved.','support@furniturestore.com','+1 (555) 123-4567','123 Design Street, Suite 100, San Francisco, CA 94105','https://facebook.com/furniturestore','https://twitter.com/furniturestore','https://instagram.com/furniturestore','https://youtube.com/@furniturestore','https://linkedin.com/company/furniturestore','2026-06-08 14:28:56','2026-06-08 14:28:56');
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
  KEY `idx_cart_items_product_id` (`product_id`),
  KEY `idx_cart_items_cart_id` (`cart_id`),
  KEY `ix_cart_items_cart_id` (`cart_id`),
  KEY `ix_cart_items_id` (`id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
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
  KEY `ix_categories_parent_id` (`parent_id`),
  KEY `ix_categories_id` (`id`),
  KEY `idx_parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Living Room','living-room','Sofas, coffee tables, and entertainment units for your living space',NULL,NULL,1,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(2,'Bedroom','bedroom','Beds, dressers, nightstands, and bedroom sets',NULL,NULL,1,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(3,'Dining Room','dining-room','Dining tables, chairs, and storage solutions',NULL,NULL,1,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(4,'Office','office','Desks, office chairs, and workstation accessories',NULL,NULL,1,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(5,'Lighting','lighting','Lamps, chandeliers, and ambient lighting',NULL,NULL,1,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(6,'Outdoor','outdoor','Patio furniture, garden sets, and outdoor decor',NULL,NULL,1,'2026-06-08 14:28:56','2026-06-08 14:28:56');
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
INSERT INTO `coupons` VALUES (1,'WELCOME15','15% off for new customers','percentage',15,0,100,0,1,NULL,NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(2,'FREEDELIVERY','$10 off order','fixed',10,100,50,0,1,NULL,NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(3,'HOMESALE20','20% off home collection','percentage',20,0,200,0,1,NULL,'2026-08-07 14:28:56','2026-06-08 14:28:56','2026-06-08 14:28:56');
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
  KEY `ix_homepage_sections_section_type` (`section_type`),
  KEY `ix_homepage_sections_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `homepage_sections`
--

LOCK TABLES `homepage_sections` WRITE;
/*!40000 ALTER TABLE `homepage_sections` DISABLE KEYS */;
INSERT INTO `homepage_sections` VALUES (1,'hero',0,1,'Modern Living Collection 2026','Transform your space with contemporary furniture designed for comfort and style.','Shop Now','/products?collection=modern-living-2026','https://images.unsplash.com/photo-1618220179428-22790b461013?w=1600&q=80',NULL,'#1e293b',0.4,'#ffffff','New Collection','color',NULL,NULL,NULL,NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(2,'categories',1,1,NULL,NULL,NULL,NULL,NULL,NULL,'#0c1445',0.6,'#ffffff',NULL,'color',NULL,NULL,NULL,'{\"items\": [{\"name\": \"Living Room\", \"slug\": \"living-room\", \"image\": \"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80\"}, {\"name\": \"Bedroom\", \"slug\": \"bedroom\", \"image\": \"https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=500&q=80\"}, {\"name\": \"Dining Room\", \"slug\": \"dining-room\", \"image\": \"https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&q=80\"}, {\"name\": \"Office\", \"slug\": \"office\", \"image\": \"https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=500&q=80\"}], \"title\": \"Shop by Room\", \"subtitle\": \"Find everything you need to furnish every room in your home.\"}','2026-06-08 14:28:56','2026-06-08 14:28:56'),(3,'featured_products',2,1,NULL,NULL,NULL,NULL,NULL,NULL,'#0c1445',0.6,'#ffffff',NULL,'color','#f8fafc',NULL,NULL,'{\"limit\": 8, \"title\": \"Best Sellers\", \"subtitle\": \"Our most popular furniture pieces loved by customers everywhere.\"}','2026-06-08 14:28:56','2026-06-08 14:28:56'),(4,'promo_banner',3,1,'Free Delivery on Orders Over $500','Enjoy complimentary white-glove delivery on all orders above $500. Assembly included.','Start Shopping','/products','https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',NULL,'#1e293b',0.7,'#ffffff',NULL,'color',NULL,NULL,NULL,NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(5,'newsletter',4,1,NULL,NULL,NULL,NULL,NULL,NULL,'#0c1445',0.6,'#ffffff',NULL,'color',NULL,NULL,NULL,'{\"title\": \"Get Interior Inspiration\", \"subtitle\": \"Subscribe for design tips, new arrivals, and exclusive offers delivered to your inbox.\", \"button_text\": \"Subscribe\", \"placeholder\": \"Enter your email address\"}','2026-06-08 14:28:56','2026-06-08 14:28:56');
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
  KEY `idx_inventory_logs_product_id` (`product_id`),
  KEY `ix_inventory_logs_product_id` (`product_id`),
  KEY `ix_inventory_logs_id` (`id`),
  KEY `idx_inventory_logs_created_at` (`created_at`),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media_library`
--

LOCK TABLES `media_library` WRITE;
/*!40000 ALTER TABLE `media_library` DISABLE KEYS */;
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
  KEY `ix_order_items_order_id` (`order_id`),
  KEY `ix_order_items_id` (`id`),
  KEY `idx_order_items_order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
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
  KEY `idx_orders_user_id` (`user_id`),
  KEY `ix_orders_user_id` (`user_id`),
  KEY `ix_orders_id` (`id`),
  KEY `ix_orders_driver_id` (`driver_id`),
  KEY `ix_orders_khqr_md5` (`khqr_md5`),
  KEY `idx_orders_khqr_md5` (`khqr_md5`),
  KEY `ix_orders_delivery_slot_id` (`delivery_slot_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`shipping_address_id`) REFERENCES `addresses` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`billing_address_id`) REFERENCES `addresses` (`id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`delivery_slot_id`) REFERENCES `delivery_slots` (`id`),
  CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`driver_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
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
  KEY `idx_product_images_product_id` (`product_id`),
  KEY `ix_product_images_product_id` (`product_id`),
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
  KEY `ix_product_option_values_option_id` (`option_id`),
  KEY `ix_product_option_values_id` (`id`),
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
  KEY `ix_product_options_product_id` (`product_id`),
  KEY `ix_product_options_id` (`id`),
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
  KEY `idx_category_id` (`category_id`),
  KEY `ix_products_category_id` (`category_id`),
  KEY `idx_sku` (`sku`),
  KEY `ix_products_id` (`id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,1,'Mid-Century Velvet Sofa','mid-century-velvet-sofa','FUR-MID-CENTURY-VELVET-SOFA','Premium Mid-Century Velvet Sofa — ModaLiving.',NULL,899.99,NULL,15,'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80','ModaLiving',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(2,1,'Farmhouse Coffee Table','farmhouse-coffee-table','FUR-FARMHOUSE-COFFEE-TABLE','Premium Farmhouse Coffee Table — Rustic Charm.',NULL,349.99,NULL,25,'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=500&q=80','Rustic Charm',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(3,1,'L-shaped Sectional Sofa','l-shaped-sectional-sofa','FUR-L-SHAPED-SECTIONAL-SOFA','Premium L-shaped Sectional Sofa — ComfortCraft.',NULL,1299.99,NULL,10,'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&q=80','ComfortCraft',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(4,1,'Glass Top TV Stand','glass-top-tv-stand','FUR-GLASS-TOP-TV-STAND','Premium Glass Top TV Stand — EntertainMe.',NULL,279.99,NULL,20,'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=500&q=80','EntertainMe',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(5,1,'Accent Armchair','accent-armchair','FUR-ACCENT-ARMCHAIR','Premium Accent Armchair — ModaLiving.',NULL,449.99,NULL,18,'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&q=80','ModaLiving',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(6,2,'Upholstered Queen Bed Frame','upholstered-queen-bed-frame','FUR-UPHOLSTERED-QUEEN-BED-FRAME','Premium Upholstered Queen Bed Frame — DreamWell.',NULL,699.99,NULL,12,'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80','DreamWell',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(7,2,'6-Drawer Dresser','6-drawer-dresser','FUR-6-DRAWER-DRESSER','Premium 6-Drawer Dresser — DreamWell.',NULL,549.99,NULL,14,'https://images.unsplash.com/photo-1597006335771-4b4eebf47f4e?w=500&q=80','DreamWell',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(8,2,'Nightstand with USB Ports','nightstand-with-usb-ports','FUR-NIGHTSTAND-WITH-USB-PORTS','Premium Nightstand with USB Ports — SmartSleep.',NULL,179.99,NULL,35,'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=500&q=80','SmartSleep',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(9,2,'King Size Platform Bed','king-size-platform-bed','FUR-KING-SIZE-PLATFORM-BED','Premium King Size Platform Bed — DreamWell.',NULL,899.99,NULL,8,'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=500&q=80','DreamWell',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(10,2,'Wardrobe Closet Cabinet','wardrobe-closet-cabinet','FUR-WARDROBE-CLOSET-CABINET','Premium Wardrobe Closet Cabinet — OrganizePlus.',NULL,649.99,NULL,10,'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&q=80','OrganizePlus',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(11,3,'Solid Wood Dining Table','solid-wood-dining-table','FUR-SOLID-WOOD-DINING-TABLE','Premium Solid Wood Dining Table — Heritage Wood.',NULL,749.99,NULL,12,'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&q=80','Heritage Wood',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(12,3,'Set of 4 Dining Chairs','set-of-4-dining-chairs','FUR-SET-OF-4-DINING-CHAIRS','Premium Set of 4 Dining Chairs — Heritage Wood.',NULL,499.99,NULL,20,'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&q=80','Heritage Wood',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(13,3,'Buffet Sideboard Cabinet','buffet-sideboard-cabinet','FUR-BUFFET-SIDEBOARD-CABINET','Premium Buffet Sideboard Cabinet — OrganizePlus.',NULL,599.99,NULL,10,'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?w=500&q=80','OrganizePlus',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(14,3,'Glass Display Cabinet','glass-display-cabinet','FUR-GLASS-DISPLAY-CABINET','Premium Glass Display Cabinet — ShowcasePro.',NULL,449.99,NULL,8,'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&q=80','ShowcasePro',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(15,3,'Round Pedestal Table','round-pedestal-table','FUR-ROUND-PEDESTAL-TABLE','Premium Round Pedestal Table — Heritage Wood.',NULL,599.99,NULL,15,'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=500&q=80','Heritage Wood',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(16,4,'Executive Office Desk','executive-office-desk','FUR-EXECUTIVE-OFFICE-DESK','Premium Executive Office Desk — WorkSpace Pro.',NULL,549.99,NULL,15,'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80','WorkSpace Pro',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(17,4,'Ergonomic Mesh Chair','ergonomic-mesh-chair','FUR-ERGONOMIC-MESH-CHAIR','Premium Ergonomic Mesh Chair — ErgoComfort.',NULL,379.99,NULL,30,'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80','ErgoComfort',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(18,4,'Standing Desk Converter','standing-desk-converter','FUR-STANDING-DESK-CONVERTER','Premium Standing Desk Converter — WorkSpace Pro.',NULL,299.99,NULL,20,'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80','WorkSpace Pro',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(19,4,'Bookshelf 5-Tier','bookshelf-5-tier','FUR-BOOKSHELF-5-TIER','Premium Bookshelf 5-Tier — OrganizePlus.',NULL,199.99,NULL,25,'https://images.unsplash.com/photo-1588279104182-c3ad1c9c5bf4?w=500&q=80','OrganizePlus',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(20,4,'Filing Cabinet 2-Drawer','filing-cabinet-2-drawer','FUR-FILING-CABINET-2-DRAWER','Premium Filing Cabinet 2-Drawer — WorkSpace Pro.',NULL,159.99,NULL,22,'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=500&q=80','WorkSpace Pro',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(21,5,'Crystal Chandelier','crystal-chandelier','FUR-CRYSTAL-CHANDELIER','Premium Crystal Chandelier — Luminous.',NULL,399.99,NULL,8,'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=500&q=80','Luminous',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(22,5,'Arc Floor Lamp','arc-floor-lamp','FUR-ARC-FLOOR-LAMP','Premium Arc Floor Lamp — Glow & Co.',NULL,249.99,NULL,18,'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500&q=80','Glow & Co',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(23,5,'Modern Pendant Light','modern-pendant-light','FUR-MODERN-PENDANT-LIGHT','Premium Modern Pendant Light — Luminous.',NULL,179.99,NULL,25,'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=500&q=80','Luminous',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(24,5,'Table Lamp with USB','table-lamp-with-usb','FUR-TABLE-LAMP-WITH-USB','Premium Table Lamp with USB — Glow & Co.',NULL,89.99,NULL,40,'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=500&q=80','Glow & Co',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(25,5,'Wall Sconce Set','wall-sconce-set','FUR-WALL-SCONCE-SET','Premium Wall Sconce Set — Luminous.',NULL,129.99,NULL,30,'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&q=80','Luminous',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(26,6,'Wicker Patio Sofa Set','wicker-patio-sofa-set','FUR-WICKER-PATIO-SOFA-SET','Premium Wicker Patio Sofa Set — SunSet Living.',NULL,1099.99,NULL,8,'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80','SunSet Living',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(27,6,'Outdoor Dining Table','outdoor-dining-table','FUR-OUTDOOR-DINING-TABLE','Premium Outdoor Dining Table — Garden Elite.',NULL,599.99,NULL,12,'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&q=80','Garden Elite',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(28,6,'Adirondack Chair (Set of 2)','adirondack-chair-set-of-2','FUR-ADIRONDACK-CHAIR-SET-OF-2','Premium Adirondack Chair (Set of 2) — SunSet Living.',NULL,249.99,NULL,20,'https://images.unsplash.com/photo-1591828018381-9bda0b94c518?w=500&q=80','SunSet Living',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(29,6,'Umbrella Patio 10ft','umbrella-patio-10ft','FUR-UMBRELLA-PATIO-10FT','Premium Umbrella Patio 10ft — ShadeMaster.',NULL,189.99,NULL,15,'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80','ShadeMaster',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(30,6,'Hanging Egg Chair','hanging-egg-chair','FUR-HANGING-EGG-CHAIR','Premium Hanging Egg Chair — SunSet Living.',NULL,329.99,NULL,10,'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80','SunSet Living',NULL,NULL,NULL,NULL,0,1,0,'2026-06-08 14:28:56','2026-06-08 14:28:56');
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
  KEY `idx_reviews_product_id` (`product_id`),
  KEY `ix_reviews_user_id` (`user_id`),
  KEY `idx_reviews_user_id` (`user_id`),
  KEY `ix_reviews_product_id` (`product_id`),
  KEY `ix_reviews_id` (`id`),
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
INSERT INTO `settings` VALUES (1,'store_name','Furniture Store','Store display name','2026-06-08 14:28:56','2026-06-08 14:28:56'),(2,'store_email','support@furniturestore.com','Store contact email','2026-06-08 14:28:56','2026-06-08 14:28:56'),(3,'shipping_rate','15.00','Default shipping rate','2026-06-08 14:28:56','2026-06-08 14:28:56'),(4,'tax_rate','0.08','Tax rate (decimal)','2026-06-08 14:28:56','2026-06-08 14:28:56'),(5,'low_stock_threshold','5','Low stock alert threshold','2026-06-08 14:28:56','2026-06-08 14:28:56'),(6,'homepage_video_enabled','false','Enable background video on storefront homepage','2026-06-08 14:39:12','2026-06-08 14:39:12'),(7,'homepage_video_url','','Direct MP4 URL for homepage background video','2026-06-08 14:39:12','2026-06-08 14:39:12'),(8,'enable_delivery_scheduling','false','Enable delivery scheduling feature for checkout','2026-06-08 14:39:12','2026-06-08 14:39:12');
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `theme_settings`
--

LOCK TABLES `theme_settings` WRITE;
/*!40000 ALTER TABLE `theme_settings` DISABLE KEYS */;
INSERT INTO `theme_settings` VALUES (1,'Midnight Pro',0,1,'#3b82f6','#1d4ed8','#60a5fa','#0f172a','#1e293b','#0f172a','#0f172a','#f8fafc','#94a3b8','#3b82f6','#ffffff','#10b981','#f59e0b','#ef4444','#334155','\'Inter\', sans-serif','2.5rem','1rem','400','1.6','1280px',4,'rounded-2xl','1rem','0 10px 15px -3px rgba(0, 0, 0, 0.3)','5rem','4.5rem','auto','0.75rem','0.875rem 1.75rem','#2563eb','scale-up','0 4px 6px -1px rgba(0, 0, 0, 0.2)',NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(2,'Warm Oak',0,0,'#b45309','#92400e','#f59e0b','#fffbeb','#ffffff','#451a03','#451a03','#451a03','#78350f','#b45309','#ffffff','#10b981','#f59e0b','#ef4444','#fef3c7','\'Lora\', serif','2.75rem','1.05rem','400','1.7','1200px',4,'rounded-3xl','1.5rem','0 4px 20px -2px rgba(180, 83, 9, 0.1)','6rem','5rem','auto','2rem','1rem 2rem','#92400e','bounce','0 10px 15px -3px rgba(180, 83, 9, 0.2)',NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(3,'Nordic Minimal',0,0,'#64748b','#475569','#94a3b8','#f8fafc','#ffffff','#1e293b','#1e293b','#1e293b','#64748b','#64748b','#ffffff','#10b981','#f59e0b','#ef4444','#e2e8f0','\'Inter\', sans-serif','2.5rem','1rem','400','1.6','1280px',4,'rounded-xl','0.75rem','0 4px 6px -1px rgba(0, 0, 0, 0.05)','5rem','4.5rem','auto','0.5rem','0.875rem 1.5rem','#475569','scale','0 4px 6px -1px rgba(100, 116, 139, 0.2)',NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56'),(4,'Default Theme',1,0,'#2563eb','#4f46e5','#38bdf8','#f9fafb','#ffffff','#0c1445','#0c1445','#111827','#6b7280','#2563eb','#ffffff','#10b981','#f59e0b','#ef4444','#e5e7eb','Inter, system-ui, sans-serif','2.5rem','1rem','400','1.6','1280px',4,'rounded-xl','0.75rem','0 1px 3px rgba(0,0,0,0.1)','4rem','4rem','auto','0.5rem','0.75rem 1.5rem','#1d4ed8','scale','0 4px 6px rgba(0,0,0,0.1)',NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56');
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
INSERT INTO `users` VALUES ('7ad3c4b2-e9c4-49ad-b0f6-f25ec36f773c','staff@furniturestore.com','$2b$12$GBt7vdsjZW1SmU5SkQ9pBOl4j90qlAl8d5sgs6g73Jl0FiydEkF4m','Staff','User','staff',1,NULL,NULL,NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56'),('91a4715e-8b77-4719-ba19-5ab4375f89a5','driver@furniturestore.com','$2b$12$d6SLJElWeulkrnGy3z14Tu8QTPqMn9nE2l773Laay0CK3rn.7NeqW','Delivery','Driver','driver',1,NULL,NULL,NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56'),('c2ae1d4b-6ec0-48e2-b780-91f0747421a8','admin@furniturestore.com','$2b$12$eolYEugK/nAw8/Q.kN5S7ex00NLeUlc9XvpkNKzTI.RMSQGpQ9v66','Admin','User','admin',1,NULL,NULL,NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56'),('f22a451a-b130-439d-9856-d93f44983d65','customer@example.com','$2b$12$qQd6iyxv9YhnJzVnE4o1GuiO9j74M.NgulI1ZdbHBiOpuLd7hvNtW','John','Doe','customer',1,NULL,NULL,NULL,'2026-06-08 14:28:56','2026-06-08 14:28:56');
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
  KEY `ix_wishlist_items_wishlist_id` (`wishlist_id`),
  KEY `ix_wishlist_items_id` (`id`),
  KEY `idx_wishlist_items_wishlist_id` (`wishlist_id`),
  KEY `idx_wishlist_items_product_id` (`product_id`),
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

-- Dump completed on 2026-06-08 21:40:54
