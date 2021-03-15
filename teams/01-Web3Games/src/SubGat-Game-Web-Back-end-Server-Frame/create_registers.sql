CREATE TABLE `registers_db` (
    id INT(4) PRIMARY KEY AUTO_INCREMENT,
    `uuid` varchar(100) NOT NULL,
    `phone_number` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `web3_address` varchar(255) NOT NULL,
    `sign_time` varchar(255) NOT NULL,
    `login_time` varchar(255) NOT NULL
);

INSERT INTO `registers_db`(uuid, phone_number, password, web3_address, sign_time, login_time)  VALUES ('239934993423', '17366503261', '123456', '12bzRJfh7arnnfPPUZHeJUaE62QLEwhK48QnH9LXeK2m1322', '2020-1-1', '2020-1-2'),
                                ('239934993494', '1025185920', '123456', '12bzRJfh7arnnfPPUZHeJUaE62QLEwhK48QnH9LXeK2m1iZ2', '2020-1-1', '2020-1-2'),
                                ('239934993495', '17366503260', '123456', '12bzRJfh7arnnfPPUZHeJUaE62QLEwhK48QnH9LXeK2m1i3U','2020-1-1', '2020-1-2');

CREATE TABLE `daily_reward` (
	`id` int PRIMARY KEY AUTO_INCREMENT,
	`address` varchar(1024) NOT NULL,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` datetime
);