-- customer_analysis.reports definition
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `campains` json DEFAULT NULL,
  `start_time` date DEFAULT NULL,
  `end_time` date DEFAULT NULL,
  `result` json DEFAULT NULL,
  `created_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- customer_analysis.site_reports definition
DROP TABLE IF EXISTS `site_reports`;
CREATE TABLE `site_reports` (
  `site_id` int unsigned NOT NULL,
  `report_id` bigint unsigned NOT NULL,
  PRIMARY KEY (`site_id`,`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;