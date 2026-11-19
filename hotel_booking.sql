CREATE DATABASE hotel_booking_system;
USE hotel_booking_system;
CREATE TABLE hotels(
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(255) NOT NULL,
address VARCHAR(255),
city VARCHAR(100),
description TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rooms(
id INT AUTO_INCREMENT PRIMARY KEY,
hotel_id INT NOT NULL,
number VARCHAR(50) NOT NULL,
type VARCHAR(100),
capacity INT DEFAULT 1,
price DECIMAL(10,2) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  guest_name VARCHAR(100) NOT NULL,
  guest_email VARCHAR(150) NOT NULL,
  guest_phone VARCHAR(30),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INT GENERATED ALWAYS AS (DATEDIFF(check_out, check_in)) STORED,
  total_price DECIMAL(10,2) NOT NULL,
  status ENUM('active','completed','cancelled') DEFAULT 'active',
  payment_status ENUM('pending','paid','refunded') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

INSERT INTO hotels(name, address, city, description) VALUES
('Planet', 'hawelti', 'Mekelle', 'luxury city hotel'),
('Axum', '17 kebele', 'Mekelle', 'luxury city hotel');

INSERT INTO rooms(hotel_id, number, type, capacity, price) VALUES
(1, '101', 'Single', 1, 1500.00),
(1, '102', 'Double', 2, 2800.00),
(2, '201', 'Double', 2, 2600.00),
(2, '202', 'Suite', 4, 4150.00);
SELECT * FROM hotels;
select * from rooms;
ALTER TABLE rooms
ADD status ENUM('available', 'occupied', 'maintenance')
DEFAULT 'available';

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
UPDATE users SET role='admin' WHERE id = 1;
select * from users;
INSERT INTO users (name, email, password, role)
VALUES (
  'Hluf Admin',
  'hlufenticho@gmail.com',
  '$2b$10$GKL1zkjLQHaeZIGFgioB0eSFF1pnGj29eMNUJOeG3S1UGgpBiabBG',
  'admin'
);

SELECT * FROM users WHERE email = 'hlufenticho@gmail.com';
SELECT id, email, password, role FROM users;
DELETE FROM users WHERE email = 'hlufenticho@gmail.com';
DROP TABLE IF EXISTS users;



