SET @user1 = CONCAT("drop user if exists '",  @dbUser, "'");
SET @user2 = CONCAT("create user if not exists '", @dbUser, "'@'%' identified by '", @dbPasswd, "'");
SET @user3 = CONCAT("flush privileges ");

SET @db1 = CONCAT("drop database if exists `", @dbName, "`");
SET @db2 = CONCAT("create database ", @dbName, " default character set utf8 default collate utf8_general_ci");
SET @db3 = CONCAT("grant all privileges on `", @dbName, "`.* TO '", @dbUser, "'@'%'");
SET @db4 = CONCAT("flush tables");
SET @db5 = CONCAT("flush privileges");

PREPARE stmt FROM @user1; EXECUTE stmt; DEALLOCATE PREPARE stmt;
PREPARE stmt FROM @user2; EXECUTE stmt; DEALLOCATE PREPARE stmt;
PREPARE stmt FROM @user3; EXECUTE stmt; DEALLOCATE PREPARE stmt;

PREPARE stmt FROM @db1; EXECUTE stmt; DEALLOCATE PREPARE stmt;
PREPARE stmt FROM @db2; EXECUTE stmt; DEALLOCATE PREPARE stmt;
PREPARE stmt FROM @db3; EXECUTE stmt; DEALLOCATE PREPARE stmt;
PREPARE stmt FROM @db4; EXECUTE stmt; DEALLOCATE PREPARE stmt;
PREPARE stmt FROM @db5; EXECUTE stmt; DEALLOCATE PREPARE stmt;
