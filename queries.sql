-- Create the database
CREATE DATABASE IF NOT EXISTS capstone;

-- Use the capstone database
USE capstone;

-- Create the users table
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY (email)
);

-- Verify the table structure
DESC users;

-- Create the measurements table
CREATE TABLE IF NOT EXISTS measurements (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT DEFAULT NULL,
  height DECIMAL(5,2) DEFAULT NULL,
  shoulder_width DECIMAL(5,2) DEFAULT NULL,
  arm_length DECIMAL(5,2) DEFAULT NULL,
  neck DECIMAL(5,2) DEFAULT NULL,
  wrist DECIMAL(5,2) DEFAULT NULL,
  chest DECIMAL(5,2) DEFAULT NULL,
  waist DECIMAL(5,2) DEFAULT NULL,
  hip DECIMAL(5,2) DEFAULT NULL,
  thigh DECIMAL(5,2) DEFAULT NULL,
  ankle DECIMAL(5,2) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY (id)
);
