/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50726
 Source Host           : 127.0.0.1:3306
 Source Schema         : db_assets

 Target Server Type    : MySQL
 Target Server Version : 50726
 File Encoding         : 65001

 Date: 15/03/2021 16:08:34
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for tb_asset
-- ----------------------------
DROP TABLE IF EXISTS `tb_asset`;
CREATE TABLE `tb_asset`  (
  `id` bigint(20) UNSIGNED NOT NULL COMMENT '平台资产编号',
  `asset_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '资产名称',
  `asset_type` tinyint(1) UNSIGNED NOT NULL COMMENT '资产类型（0- 使用权，1-版权）',
  `category_id` bigint(20) UNSIGNED NOT NULL DEFAULT 0 COMMENT '资产分类大类',
  `sub_category_id` bigint(20) UNSIGNED NOT NULL DEFAULT 0 COMMENT '资产分类子类',
  `describe` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '资产描述',
  `tag` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '资产标签',
  `owner` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '当前所有者',
  `user_id` bigint(20) NOT NULL DEFAULT 0 COMMENT '原所有者',
  `price` decimal(10, 2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT '出售价格',
  `cover` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '资产图片封面',
  `total_size` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '资产文件总大小',
  `total_hash` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '资产文件数据指纹（所有文件拼接的哈希）',
  `is_verify` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否审核（0-未审核，1-已审核）',
  `is_proof` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否存证（0-未存证，1-已存证）',
  `is_register` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否已注册为ERC721资产',
  `is_sold` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否已出售（0-否，1-是）',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除（0-正常，1-已删除）',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '申请登记时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '资产表' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tb_asset
-- ----------------------------
INSERT INTO `tb_asset` VALUES (345926407777419265, '测试返回数据1', 1, 1, 2, '牛逼class', '1', 2, 2, 555555.00, '资产封面', 8003, 'QmWB1sTA9iRrtxnWrzUBnzfEQVjVE2dijd7F4bk8iz8Hge/', 1, 0, 0, 0, 0, 1615717811);
INSERT INTO `tb_asset` VALUES (345931608261394433, '大丽花', 1, 2, 0, '大丽花,绒球,鲜花,盛开,开花,开花植物,观赏植物,植物,植物区系,自然,花园', '大丽花,绒球,鲜花,盛开,开花,开花植物,观赏植物,植物,植物区系,自然,花园', 5, 1, 1.00, 'https://asset-rpc.vonechain.com/ipfs/QmesX92ZmKUw2BTmTDHuFjyaJv8J2qd9oeeS3UH2cmcF7s', 478178, 'QmesX92ZmKUw2BTmTDHuFjyaJv8J2qd9oeeS3UH2cmcF7s/', 1, 1, 1, 1, 0, 1615720906);
INSERT INTO `tb_asset` VALUES (345931963334393857, '夕阳下的桥', 1, 2, 0, '夕阳下的桥', '夕阳下的桥', 1, 1, 1.00, 'https://asset-rpc.vonechain.com/ipfs/QmUrZFi4toWUzSboiZgGFQfis8smifXd6Py6R6BwqD1xT1', 288146, 'QmUrZFi4toWUzSboiZgGFQfis8smifXd6Py6R6BwqD1xT1/', 1, 1, 0, 0, 0, 1615721117);
INSERT INTO `tb_asset` VALUES (345935897792872449, '现代设计', 1, 2, 0, '楼梯,玻璃,结构,室内,现代,设计,人,窗', '楼梯,玻璃', 1, 1, 8.00, 'https://asset-rpc.vonechain.com/ipfs/QmZ942A8MzyGh3fNyPcExxe4x2QW6FWsbYfAYatPWGUcSm', 586487, 'QmZ942A8MzyGh3fNyPcExxe4x2QW6FWsbYfAYatPWGUcSm/', 1, 1, 1, 0, 0, 1615723463);
INSERT INTO `tb_asset` VALUES (346044804674617345, 'alice发布的资产', 1, 2, 0, 'fdsafda', 'DD', 3, 3, 10.00, 'https://hackathon.vonechain.com/ipfs/QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf', 255774, 'QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf/', 1, 1, 1, 0, 0, 1615788376);

-- ----------------------------
-- Table structure for tb_asset_file
-- ----------------------------
DROP TABLE IF EXISTS `tb_asset_file`;
CREATE TABLE `tb_asset_file`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `assets_id` bigint(20) UNSIGNED NOT NULL DEFAULT 0 COMMENT '平台资产编号',
  `file_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '文件名称',
  `file_type` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件类型（0-图片，1-视频，3-其它）',
  `file_path` varchar(500) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '文件路径',
  `file_size` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小（Byte）',
  `file_hash` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '文件哈希',
  `is_valid` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否有效（0-垃圾文件，1-在用文件）',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除（0-正常，1-已删除）',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '上传时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 26 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '资产文件表' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tb_asset_file
-- ----------------------------
INSERT INTO `tb_asset_file` VALUES (1, 345926407777419265, 'moon-logo.png', 0, 'https://asset-rpc.vonechain.com/ipfs/QmWB1sTA9iRrtxnWrzUBnzfEQVjVE2dijd7F4bk8iz8Hge', 8003, 'QmWB1sTA9iRrtxnWrzUBnzfEQVjVE2dijd7F4bk8iz8Hge', 1, 0, 1615717772);
INSERT INTO `tb_asset_file` VALUES (2, 0, '6.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmesX92ZmKUw2BTmTDHuFjyaJv8J2qd9oeeS3UH2cmcF7s', 478178, 'QmesX92ZmKUw2BTmTDHuFjyaJv8J2qd9oeeS3UH2cmcF7s', 0, 0, 1615720893);
INSERT INTO `tb_asset_file` VALUES (3, 345931608261394433, '6.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmesX92ZmKUw2BTmTDHuFjyaJv8J2qd9oeeS3UH2cmcF7s', 478178, 'QmesX92ZmKUw2BTmTDHuFjyaJv8J2qd9oeeS3UH2cmcF7s', 1, 0, 1615720904);
INSERT INTO `tb_asset_file` VALUES (4, 0, '12.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmUrZFi4toWUzSboiZgGFQfis8smifXd6Py6R6BwqD1xT1', 288146, 'QmUrZFi4toWUzSboiZgGFQfis8smifXd6Py6R6BwqD1xT1', 0, 0, 1615721104);
INSERT INTO `tb_asset_file` VALUES (5, 345931963334393857, '12.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmUrZFi4toWUzSboiZgGFQfis8smifXd6Py6R6BwqD1xT1', 288146, 'QmUrZFi4toWUzSboiZgGFQfis8smifXd6Py6R6BwqD1xT1', 1, 0, 1615721109);
INSERT INTO `tb_asset_file` VALUES (6, 0, '11.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmZ942A8MzyGh3fNyPcExxe4x2QW6FWsbYfAYatPWGUcSm', 586487, 'QmZ942A8MzyGh3fNyPcExxe4x2QW6FWsbYfAYatPWGUcSm', 0, 0, 1615721210);
INSERT INTO `tb_asset_file` VALUES (7, 0, '8.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmRdWFjZkqgCHLuGBS7bJKoJ8ECb7T7NJNF4XsCoyErCi6', 332903, 'QmRdWFjZkqgCHLuGBS7bJKoJ8ECb7T7NJNF4XsCoyErCi6', 0, 0, 1615722224);
INSERT INTO `tb_asset_file` VALUES (8, 0, '10.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmVRRmq1S4kQhP2feYxL1ax4EA8GndeHGps5zusM9XF3Jz', 589791, 'QmVRRmq1S4kQhP2feYxL1ax4EA8GndeHGps5zusM9XF3Jz', 0, 0, 1615722351);
INSERT INTO `tb_asset_file` VALUES (9, 0, '7.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmVyT9UVNcLMtJpBVasNnnsPbmdg3gpr4mfzVKgsfUecaW', 316820, 'QmVyT9UVNcLMtJpBVasNnnsPbmdg3gpr4mfzVKgsfUecaW', 0, 0, 1615722584);
INSERT INTO `tb_asset_file` VALUES (10, 0, '10.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmVRRmq1S4kQhP2feYxL1ax4EA8GndeHGps5zusM9XF3Jz', 589791, 'QmVRRmq1S4kQhP2feYxL1ax4EA8GndeHGps5zusM9XF3Jz', 0, 0, 1615722585);
INSERT INTO `tb_asset_file` VALUES (11, 0, '11.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmZ942A8MzyGh3fNyPcExxe4x2QW6FWsbYfAYatPWGUcSm', 586487, 'QmZ942A8MzyGh3fNyPcExxe4x2QW6FWsbYfAYatPWGUcSm', 0, 0, 1615723346);
INSERT INTO `tb_asset_file` VALUES (12, 0, '13.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmSMhqHxW7EZasvNXjav3tAyuUwMjXyVMW8qEeGqfvPrWk', 421186, 'QmSMhqHxW7EZasvNXjav3tAyuUwMjXyVMW8qEeGqfvPrWk', 0, 0, 1615723349);
INSERT INTO `tb_asset_file` VALUES (13, 0, '11.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmZ942A8MzyGh3fNyPcExxe4x2QW6FWsbYfAYatPWGUcSm', 586487, 'QmZ942A8MzyGh3fNyPcExxe4x2QW6FWsbYfAYatPWGUcSm', 0, 0, 1615723421);
INSERT INTO `tb_asset_file` VALUES (14, 0, '11.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmZ942A8MzyGh3fNyPcExxe4x2QW6FWsbYfAYatPWGUcSm', 586487, 'QmZ942A8MzyGh3fNyPcExxe4x2QW6FWsbYfAYatPWGUcSm', 0, 0, 1615723455);
INSERT INTO `tb_asset_file` VALUES (15, 345935897792872449, '11.jpg', 0, 'https://asset-rpc.vonechain.com/ipfs/QmZ942A8MzyGh3fNyPcExxe4x2QW6FWsbYfAYatPWGUcSm', 586487, 'QmZ942A8MzyGh3fNyPcExxe4x2QW6FWsbYfAYatPWGUcSm', 1, 0, 1615723457);
INSERT INTO `tb_asset_file` VALUES (16, 0, 'moon-logo.png', 0, 'https://hackathon.vonechain.com/ipfs/QmWB1sTA9iRrtxnWrzUBnzfEQVjVE2dijd7F4bk8iz8Hge', 8003, 'QmWB1sTA9iRrtxnWrzUBnzfEQVjVE2dijd7F4bk8iz8Hge', 0, 0, 1615772781);
INSERT INTO `tb_asset_file` VALUES (17, 0, '20190811010739_avcfi.jpg', 0, 'https://hackathon.vonechain.com/ipfs/QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf', 255774, 'QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf', 0, 0, 1615788311);
INSERT INTO `tb_asset_file` VALUES (18, 0, '20190811010739_avcfi.jpg', 0, 'https://hackathon.vonechain.com/ipfs/QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf', 255774, 'QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf', 0, 0, 1615788318);
INSERT INTO `tb_asset_file` VALUES (19, 0, '20190811010739_avcfi.jpg', 0, 'https://hackathon.vonechain.com/ipfs/QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf', 255774, 'QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf', 0, 0, 1615788367);
INSERT INTO `tb_asset_file` VALUES (20, 346044804674617345, '20190811010739_avcfi.jpg', 0, 'https://hackathon.vonechain.com/ipfs/QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf', 255774, 'QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf', 1, 0, 1615788370);
INSERT INTO `tb_asset_file` VALUES (21, 0, '20200201134857_fkkxb.jpg', 0, 'https://hackathon.vonechain.com/ipfs/Qme6kbh8tqESuv2JMfsNwDMaNPxC8aoiDpnGBrKnryxLmZ', 433316, 'Qme6kbh8tqESuv2JMfsNwDMaNPxC8aoiDpnGBrKnryxLmZ', 0, 0, 1615792820);
INSERT INTO `tb_asset_file` VALUES (22, 0, '20190811010739_avcfi.jpg', 0, 'https://hackathon.vonechain.com/ipfs/QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf', 255774, 'QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf', 0, 0, 1615792920);
INSERT INTO `tb_asset_file` VALUES (23, 0, '20190811010739_avcfi.jpg', 0, 'https://hackathon.vonechain.com/ipfs/QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf', 255774, 'QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf', 0, 0, 1615793075);
INSERT INTO `tb_asset_file` VALUES (24, 0, '20190823133502_f8XYK.jpeg', 0, 'https://hackathon.vonechain.com/ipfs/QmUfTzgzpD1F1dWerF68CfxkaiQrRP2kA62ALEA13i36ES', 852772, 'QmUfTzgzpD1F1dWerF68CfxkaiQrRP2kA62ALEA13i36ES', 0, 0, 1615793079);
INSERT INTO `tb_asset_file` VALUES (25, 0, 'avatar.jpg', 0, 'https://hackathon.vonechain.com/ipfs/QmWkg672msZ43bqHRVMvUJkJFRoueMsfbmnkgEDueEkypx', 19857, 'QmWkg672msZ43bqHRVMvUJkJFRoueMsfbmnkgEDueEkypx', 0, 0, 1615793086);

-- ----------------------------
-- Table structure for tb_category
-- ----------------------------
DROP TABLE IF EXISTS `tb_category`;
CREATE TABLE `tb_category`  (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_name` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '资产分类名称',
  `parent_id` bigint(20) UNSIGNED NOT NULL DEFAULT 0 COMMENT '父级ID',
  `sort` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 10 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '资产分类表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tb_category
-- ----------------------------
INSERT INTO `tb_category` VALUES (1, '二次元动漫', 0, 1);
INSERT INTO `tb_category` VALUES (2, '摄影作品', 0, 2);
INSERT INTO `tb_category` VALUES (3, '短视频', 0, 3);
INSERT INTO `tb_category` VALUES (4, '原创音乐', 0, 4);
INSERT INTO `tb_category` VALUES (5, '原创文稿', 0, 5);
INSERT INTO `tb_category` VALUES (6, '设计图纸', 0, 6);
INSERT INTO `tb_category` VALUES (7, '机密文件', 0, 7);
INSERT INTO `tb_category` VALUES (8, '企业代码', 0, 8);
INSERT INTO `tb_category` VALUES (9, '电子合同', 0, 9);

-- ----------------------------
-- Table structure for tb_faucet
-- ----------------------------
DROP TABLE IF EXISTS `tb_faucet`;
CREATE TABLE `tb_faucet`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `address` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '钱包账号地址',
  `amount` decimal(10, 2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT '转账金额',
  `ip` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT 'IP地址',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for tb_order
-- ----------------------------
DROP TABLE IF EXISTS `tb_order`;
CREATE TABLE `tb_order`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `buyer` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID （买家）',
  `seller` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID （卖家）',
  `assets_id` bigint(20) UNSIGNED NOT NULL DEFAULT 0 COMMENT '资产ID',
  `price` decimal(10, 2) UNSIGNED NOT NULL DEFAULT 0.00 COMMENT '成交价格',
  `status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '交易状态（0-已取消，1-已支付，2-待卖家发货，3-成交）',
  `is_appealed` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否发起申诉（0-无，1-已申诉）',
  `multisig` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '多签地址',
  `create_time` int(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `tx_hash` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '交易哈希',
  `seller_address` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '卖家钱包地址',
  `buyer_address` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '买家钱包地址',
  `tx_status` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '交易状态（0-打包中，1-已打包）',
  `tx_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '交易打包时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '订单表' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tb_order
-- ----------------------------
INSERT INTO `tb_order` VALUES (1, 5, 1, 345931608261394433, 1.00, 1, 0, '', 1615724855, '0xaa2c16a2aaa202146845e623c7b716dca326a42ed7c87c894b5e1c58a0ed6e23', '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY', 1, 1615724845);

-- ----------------------------
-- Table structure for tb_proof
-- ----------------------------
DROP TABLE IF EXISTS `tb_proof`;
CREATE TABLE `tb_proof`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `assets_id` bigint(20) UNSIGNED NOT NULL DEFAULT 0 COMMENT '平台资产编号',
  `user_id` bigint(20) NOT NULL DEFAULT 0,
  `proof_no` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '存证编号',
  `assets_type` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '资产类型（0- 使用权，1-版权）',
  `token_id` int(10) NOT NULL DEFAULT 0 COMMENT '非同质化资产tokenId （即出售版权）',
  `total_hash` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '数据指纹（所有文件拼接的哈希）',
  `total_size` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件总大小',
  `tx_hash` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '交易哈希',
  `nft_hash` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '铸币哈希',
  `proof_book` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '存证证书',
  `letter` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '公证处保管函',
  `block_height` bigint(20) UNSIGNED NOT NULL DEFAULT 0 COMMENT '区块高度',
  `block_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '区块时间',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '存证时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM AUTO_INCREMENT = 10 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '存证表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of tb_proof
-- ----------------------------
INSERT INTO `tb_proof` VALUES (7, 345931963334393857, 1, 'ASS-723776-072182', 1, 68981084, 'QmUrZFi4toWUzSboiZgGFQfis8smifXd6Py6R6BwqD1xT1/', 288146, '0x3a5aed2d9063782c22025aa5b3e7bcc29831a09a570aa5897720e4eacc607536', '', 'https://asset-rpc.vonechain.com/ipfs/Qmf2ZAvDoBiNWq2ZvuBuwT75vVE19ZdogE75NhQ2KootvU', '', 30418, 1615723777, 1615723782);
INSERT INTO `tb_proof` VALUES (8, 345935897792872449, 1, 'ASS-723542-52fdfc', 1, 40768782, 'QmZ942A8MzyGh3fNyPcExxe4x2QW6FWsbYfAYatPWGUcSm/', 586487, '0x0d2a5d09e275daa81c1adc9e023063f7ca0a9a2f0405cabc7be36a228e482cb2', '0x64329bcc8028ff37e2e22d77560aa223733f400dd895142d3cd6a0db1fe947bc', 'https://asset-rpc.vonechain.com/ipfs/QmTrR7MZgw6QBH1DaDXpvpsT2TBSPM4eRLWrppZZF6nVct', '', 30379, 1615723543, 1615723657);
INSERT INTO `tb_proof` VALUES (5, 345926407777419265, 0, '', 0, 28372172, '', 0, '', '', '', '', 0, 0, 0);
INSERT INTO `tb_proof` VALUES (6, 345931608261394433, 5, 'ASS-720932-0df3ec', 1, 8306817, 'QmesX92ZmKUw2BTmTDHuFjyaJv8J2qd9oeeS3UH2cmcF7s/', 478178, '0x4a6490bf5399f95baeadb0294cacc5c932c169ff2ce385c106601dd8574d1ffd', '0x7aea955790bed59acdb0cc333c490a375735bc0f42102fcb18359cc013cc92a8', 'https://asset-rpc.vonechain.com/ipfs/QmemsRvMFK5ZP4Kpho8XoL1PV5JqGPTHUYsi179kZxXcFd', '', 29944, 1615720933, 1615720935);
INSERT INTO `tb_proof` VALUES (9, 346044804674617345, 3, 'ASS-788786-6c7071', 1, 46833535, 'QmeE2ctUekt1X9DnqsLogXKkp2fPsgoMKKPjvc43kVudWf/', 255774, '0xa4c69f648812828d951887d66801f3ad0e1668b5051b623c52751f7a7475dd3b', '0x33469c244d56a477b449ccf4bb8b145870fdbd80fe870899a7c11c8edb89f0f2', 'https://hackathon.vonechain.com/ipfs/QmVCU13npMpu2DtfrnRDTuVmikVoiJDLiVNf9j9y53axFG', '', 77, 1615788787, 1615788790);

-- ----------------------------
-- Table structure for tb_subscribe
-- ----------------------------
DROP TABLE IF EXISTS `tb_subscribe`;
CREATE TABLE `tb_subscribe`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tx_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `tx_type` tinyint(4) NOT NULL DEFAULT 0,
  `status` tinyint(4) NOT NULL DEFAULT 0,
  `create_time` bigint(20) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for tb_user
-- ----------------------------
DROP TABLE IF EXISTS `tb_user`;
CREATE TABLE `tb_user`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '用户名',
  `password` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '密码',
  `salt` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `nick_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '昵称',
  `real_name` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '真实姓名',
  `wallet_address` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '钱包地址',
  `ip` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT 'IP地址',
  `api_token` varchar(2048) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `last_login_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '最后登录时间',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '注册时间',
  `is_locked` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uni_wallet_address`(`wallet_address`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户表' ROW_FORMAT = Compact;

-- ----------------------------
-- Records of tb_user
-- ----------------------------
INSERT INTO `tb_user` VALUES (1, 'uairain', '', '', '', '', '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', '140.206.252.123', 'cd4115f4a5016ea49cc06a6b82e23d7897af031f', 0, 1615717082, 0);
INSERT INTO `tb_user` VALUES (2, '里斯0', '', '', '', '', '5GgGcwZ3S7748uZ9SEvv3zcRcRZb5cuMsC9qqmPvGfLNhwpn', '140.206.252.123', '971949a1a64a88b08605c02f3518247c5893d8f2', 0, 1615717734, 0);
INSERT INTO `tb_user` VALUES (3, 'uairain', '', '', '', '', '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', '140.206.252.123', '480f8f43e89d0c1e62581d3e6a03b45586e09b40', 0, 1615721941, 0);
INSERT INTO `tb_user` VALUES (4, 'uairain', '', '', '', '', '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', '140.206.252.123', 'd692f05cd6474af4c7b9a4431d5376b1af899dfe', 0, 1615724033, 0);
INSERT INTO `tb_user` VALUES (5, 'uairain', '', '', '', '', '5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY', '140.206.252.123', '25f7806351e28e9b06c60dccc41a911e64de9ca3', 0, 1615724034, 0);

-- ----------------------------
-- Table structure for tb_user_log
-- ----------------------------
DROP TABLE IF EXISTS `tb_user_log`;
CREATE TABLE `tb_user_log`  (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` int(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '用户ID',
  `operate_type` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '不同的状态值代表不同的操作,0:登录,1:注册,2:修改密码,3:忘记密码,4:退出,5:版权存证,6:资产上链,7:交易',
  `ip` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '操作IP',
  `content` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '详细描述',
  `create_time` int(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `operate_time` int(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '操作时间',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除（0-正常，1-已删除）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `user_id`(`user_id`) USING BTREE COMMENT '用户ID'
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户操作日志表' ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for tb_user_real
-- ----------------------------
DROP TABLE IF EXISTS `tb_user_real`;
CREATE TABLE `tb_user_real`  (
  `id` bigint(20) NOT NULL COMMENT '用户ID',
  `user_id` int(11) UNSIGNED NOT NULL COMMENT '用户ID',
  `realname` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '姓名',
  `mobile` varchar(11) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '手机号码',
  `id_type` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '证件类型',
  `id_no` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '证件号码',
  `id_expire` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '到期日期',
  `id_front` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '正面照',
  `id_back` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '背面照',
  `is_verify` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '是否实名通过（0-否，1-是）',
  `update_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '更新时间',
  `create_time` int(10) UNSIGNED NOT NULL DEFAULT 0 COMMENT '创建时间',
  `is_delete` tinyint(1) UNSIGNED NOT NULL DEFAULT 0 COMMENT '逻辑删除（0-正常，1-已删除）',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = MyISAM CHARACTER SET = utf8 COLLATE = utf8_general_ci COMMENT = '用户实名表' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
