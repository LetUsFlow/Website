-- (c) Klimostat

DROP DATABASE IF EXISTS `klimostat`;
CREATE  DATABASE IF NOT EXISTS `klimostat`;
USE `klimostat`;

DROP TABLE IF EXISTS `station`;
CREATE TABLE IF NOT EXISTS `station` (
    `pk_station_id` INT PRIMARY KEY  AUTO_INCREMENT,
    `alert_message` TEXT,
    `location` TEXT
);

DROP TABLE IF EXISTS `live_data`;
CREATE TABLE IF NOT EXISTS `live_data` (
    `pk_measurement_time` TIMESTAMP DEFAULT  UTC_TIMESTAMP(),
    `co2` FLOAT NOT NULL,
    `humidity` FLOAT NOT NULL,
    `temperature` FLOAT NOT NULL,
    `fk_station_id` INT NOT NULL,
    CONSTRAINT `fk_live_data_station` FOREIGN KEY (`fk_station_id`) REFERENCES `station` (`pk_station_id`),
    CONSTRAINT `pk_live_data` PRIMARY KEY (`pk_measurement_time`, `fk_station_id`)
);

DROP TABLE IF EXISTS `historical_data`;
CREATE TABLE IF NOT EXISTS `historical_data`(
    `pk_measurement_time` TIMESTAMP  DEFAULT  UTC_TIMESTAMP(),
    `co2` FLOAT NOT NULL,
    `humidity` FLOAT NOT NULL,
    `temperature` FLOAT NOT NULL,
    `fk_station_id` INT NOT NULL,
    CONSTRAINT `fk_historical_data_station` FOREIGN KEY (`fk_station_id`) REFERENCES `station` (`pk_station_id`),
    CONSTRAINT `pk_historical_data` PRIMARY KEY (`pk_measurement_time`, `fk_station_id`)
);

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
    `pk_user_id` INT PRIMARY KEY AUTO_INCREMENT,
    `username` VARCHAR(32) NOT NULL ,
    `passwordHash` text NOT NULL  ,
    CONSTRAINT `unique_username` UNIQUE (`username`)
);

DROP TABLE IF EXISTS `session`;
CREATE TABLE IF NOT EXISTS `session` (
    `pk_session_id` VARCHAR(256) PRIMARY KEY,
    `fk_user_id` INT NOT NULL ,
    `lastupdatetime` TIMESTAMP NOT NULL  DEFAULT UTC_TIMESTAMP(),
    CONSTRAINT `fk_session_user` FOREIGN KEY (`fk_user_id`) REFERENCES `user` (`pk_user_id`)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
