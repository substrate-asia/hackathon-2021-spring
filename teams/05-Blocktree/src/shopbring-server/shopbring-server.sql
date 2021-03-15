SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `sbg_block`
-- ----------------------------
DROP TABLE IF EXISTS `sbg_block`;
CREATE TABLE `sbg_block` (
  `id` bigint(20) NOT NULL,
  `prev` varchar(150) NOT NULL,
  `hash` varchar(150) NOT NULL,
  `ctime` bigint(20) NOT NULL,
  `utime` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for `sbg_commodity`
-- ----------------------------
DROP TABLE IF EXISTS `sbg_commodity`;
CREATE TABLE `sbg_commodity` (
  `id` varchar(20) NOT NULL,
  `skuid` varchar(100) DEFAULT '',
  `o_id` varchar(100) DEFAULT '',
  `name` varchar(100) DEFAULT '',
  `url` varchar(200) DEFAULT '',
  `img` varchar(300) DEFAULT '',
  `options` varchar(650) DEFAULT '',
  `amount` bigint(20) DEFAULT '0',
  `price` varchar(100) DEFAULT '0',
  `total` varchar(100) DEFAULT '0',
  `note` varchar(300) DEFAULT '',
  `ctime` bigint(20) DEFAULT '0',
  `utime` bigint(20) DEFAULT '0',
  `state` bigint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for `sbg_commodity_refund`
-- ----------------------------
DROP TABLE IF EXISTS `sbg_commodity_refund`;
CREATE TABLE `sbg_commodity_refund` (
  `id` varchar(20) NOT NULL,
  `skuid` varchar(100) DEFAULT '',
  `commodity_id` varchar(50) DEFAULT '',
  `refund_o_id` varchar(255) DEFAULT '',
  `o_id` varchar(100) DEFAULT '',
  `name` varchar(100) DEFAULT '',
  `url` varchar(200) DEFAULT '',
  `img` varchar(300) DEFAULT '',
  `options` varchar(650) DEFAULT '',
  `amount` bigint(20) DEFAULT '0',
  `price` varchar(100) DEFAULT '0',
  `total` varchar(300) DEFAULT '0',
  `note` varchar(100) DEFAULT '',
  `ctime` bigint(20) DEFAULT '0',
  `utime` bigint(20) DEFAULT '0',
  `state` bigint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for `sbg_ebplatform`
-- ----------------------------
DROP TABLE IF EXISTS `sbg_ebplatform`;
CREATE TABLE `sbg_ebplatform` (
  `id` varchar(20) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `url` varchar(100) DEFAULT NULL,
  `introduction` varchar(200) DEFAULT NULL,
  `ctime` bigint(20) DEFAULT NULL,
  `utime` bigint(20) DEFAULT '0',
  `state` bigint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of sbg_ebplatform
-- ----------------------------
INSERT INTO `sbg_ebplatform` VALUES ('1367439605804171265', '淘宝', 'www.taobao.com', '淘宝网', '1615083974868', '1615083974868', '1');

-- ----------------------------
-- Table structure for `sbg_mail`
-- ----------------------------
DROP TABLE IF EXISTS `sbg_mail`;
CREATE TABLE `sbg_mail` (
  `id` varchar(20) NOT NULL,
  `receiver` varchar(100) DEFAULT NULL,
  `sender` varchar(100) DEFAULT NULL,
  `result` varchar(600) DEFAULT NULL,
  `link` varchar(300) DEFAULT NULL,
  `userId` varchar(20) DEFAULT NULL,
  `ctime` bigint(20) DEFAULT NULL,
  `utime` bigint(20) DEFAULT '0',
  `state` bigint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for `sbg_order`
-- ----------------------------
DROP TABLE IF EXISTS `sbg_order`;
CREATE TABLE `sbg_order` (
  `id` varchar(20) NOT NULL,
  `userId` varchar(100) DEFAULT '',
  `consumer` varchar(100) DEFAULT '',
  `shopping_agent` varchar(100) DEFAULT '',
  `payment_amount` varchar(100) DEFAULT '',
  `return_amount` varchar(100) DEFAULT '',
  `tip` varchar(100) DEFAULT '',
  `currency` varchar(20) DEFAULT '',
  `create_time` bigint(20) DEFAULT '0',
  `accept_time` bigint(20) DEFAULT '0',
  `shipping_time` bigint(20) DEFAULT '0',
  `end_time` bigint(20) DEFAULT '0',
  `required_deposit` varchar(100) DEFAULT '',
  `required_credit` varchar(100) DEFAULT '',
  `logistics_company` varchar(50) DEFAULT '',
  `shipping_num` varchar(100) DEFAULT '',
  `receiver` varchar(50) DEFAULT '',
  `receiver_phone` varchar(50) DEFAULT '',
  `shipping_address` varchar(100) DEFAULT '',
  `is_return` bigint(1) DEFAULT '0',
  `platform_id` varchar(20) DEFAULT '',
  `platform_name` varchar(50) DEFAULT '',
  `platform_order_num` varchar(50) DEFAULT '',
  `merchant` varchar(50) DEFAULT '',
  `note` varchar(300) DEFAULT '',
  `fare` varchar(100) DEFAULT '',
  `total` varchar(100) DEFAULT '',
  `version` varchar(10) DEFAULT '',
  `onchain_status` varchar(10) DEFAULT '',
  `ext_order_hash` varchar(100) DEFAULT '',
  `shipping_hash` varchar(100) DEFAULT '',
  `block_index` bigint(20) DEFAULT '0',
  `ctime` bigint(20) DEFAULT '0',
  `utime` bigint(20) DEFAULT '0',
  `state` bigint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for `sbg_order_refund`
-- ----------------------------
DROP TABLE IF EXISTS `sbg_order_refund`;
CREATE TABLE `sbg_order_refund` (
  `id` varchar(20) NOT NULL,
  `userId` varchar(100) DEFAULT '',
  `consumer` varchar(100) DEFAULT '',
  `shopping_agent` varchar(100) DEFAULT '',
  `o_id` varchar(50) DEFAULT '',
  `return_amount` varchar(100) DEFAULT '',
  `create_time` bigint(20) DEFAULT '0',
  `accept_time` bigint(20) DEFAULT '0',
  `shipping_time` bigint(20) DEFAULT '0',
  `end_time` bigint(20) DEFAULT '0',
  `logistics_company` varchar(50) DEFAULT '',
  `shipping_num` varchar(100) DEFAULT '',
  `receiver` varchar(50) DEFAULT '',
  `receiver_phone` varchar(50) DEFAULT '',
  `shipping_address` varchar(100) DEFAULT '',
  `platform_id` varchar(20) DEFAULT '',
  `platform_name` varchar(50) DEFAULT '',
  `platform_order_num` varchar(50) DEFAULT '',
  `merchant` varchar(50) DEFAULT '',
  `note` varchar(300) DEFAULT '',
  `total` varchar(100) DEFAULT '',
  `version` varchar(10) DEFAULT '',
  `return_type` bigint(1) DEFAULT '0',
  `return_reason` varchar(100) DEFAULT '',
  `onchain_status` varchar(10) DEFAULT '',
  `ext_order_hash` varchar(100) DEFAULT '',
  `ext_return_hash` varchar(100) DEFAULT '',
  `shipping_hash` varchar(100) DEFAULT '',
  `block_index` bigint(20) DEFAULT '0',
  `ctime` bigint(20) DEFAULT '0',
  `utime` bigint(20) DEFAULT '0',
  `state` bigint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for `sbg_place`
-- ----------------------------
DROP TABLE IF EXISTS `sbg_place`;
CREATE TABLE `sbg_place` (
  `id` varchar(20) NOT NULL,
  `userId` varchar(50) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `mobile` varchar(100) DEFAULT NULL,
  `address` varchar(200) DEFAULT NULL,
  `ctime` bigint(20) DEFAULT NULL,
  `utime` bigint(20) DEFAULT '0',
  `state` bigint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for `sbg_user`
-- ----------------------------
DROP TABLE IF EXISTS `sbg_user`;
CREATE TABLE `sbg_user` (
  `id` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `mobile` varchar(50) DEFAULT NULL,
  `pubkey` varchar(150) DEFAULT NULL,
  `address` varchar(150) DEFAULT NULL,
  `nickname` varchar(20) DEFAULT NULL,
  `validEmail` bigint(1) DEFAULT '0',
  `validMobile` bigint(1) DEFAULT '0',
  `ctime` bigint(20) DEFAULT NULL,
  `utime` bigint(20) DEFAULT '0',
  `state` bigint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `pubkey` (`pubkey`) USING BTREE,
  UNIQUE KEY `email` (`email`) USING BTREE,
  UNIQUE KEY `address` (`address`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
