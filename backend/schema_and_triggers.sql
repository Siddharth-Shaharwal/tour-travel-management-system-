-- schema_and_triggers.sql
-- Complete Travel Management System Database Schema

CREATE DATABASE IF NOT EXISTS `travel_management`;
USE `travel_management`;

-- ============ CORE TABLES ============

CREATE TABLE vehicle_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  description TEXT
);

CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type_id INT NOT NULL,
  make VARCHAR(100),
  model VARCHAR(100),
  registration_no VARCHAR(50) UNIQUE,
  capacity INT NOT NULL,
  image_url VARCHAR(255),
  status ENUM('available','booked','maintenance') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES vehicle_types(id) ON DELETE RESTRICT
);

CREATE TABLE drivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  license_no VARCHAR(100) UNIQUE,
  phone VARCHAR(30),
  assigned_vehicle INT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_vehicle) REFERENCES vehicles(id) ON DELETE SET NULL
);

CREATE TABLE packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  short_description VARCHAR(255),
  long_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_days INT DEFAULT 1,
  image_url VARCHAR(255),
  guide_required BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(30),
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  package_id INT NULL,
  vehicle_id INT NULL,
  driver_id INT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  passengers INT NOT NULL,
  total_price DECIMAL(10,2) DEFAULT 0,
  status ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
  FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE SET NULL
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_mode ENUM('cash','card','upi','online') DEFAULT 'online',
  status ENUM('initiated','success','failed') DEFAULT 'initiated',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE booking_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

CREATE TABLE admin_verifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  verified_by INT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP NULL,
  note TEXT,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============ TRIGGERS ============

DELIMITER $$

CREATE TRIGGER trg_before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
  DECLARE v_capacity INT;
  DECLARE v_status VARCHAR(20);
  
  IF NEW.vehicle_id IS NOT NULL THEN
    SELECT capacity, status INTO v_capacity, v_status FROM vehicles WHERE id = NEW.vehicle_id;
    IF v_status <> 'available' THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Vehicle not available for booking.';
    END IF;
    IF NEW.passengers > v_capacity THEN
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Number of passengers exceed vehicle capacity.';
    END IF;
  END IF;
END$$

CREATE TRIGGER trg_after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
  DECLARE drv_id INT DEFAULT NULL;
  
  INSERT INTO admin_verifications (booking_id, verified) VALUES (NEW.id, FALSE);
  INSERT INTO booking_logs (booking_id, action, note) VALUES (NEW.id, 'created', CONCAT('Booking created with status=', NEW.status));

  IF NEW.vehicle_id IS NOT NULL THEN
    SELECT id INTO drv_id FROM drivers WHERE is_active = TRUE AND (assigned_vehicle IS NULL OR assigned_vehicle = 0) LIMIT 1;
    IF drv_id IS NOT NULL THEN
      UPDATE drivers SET assigned_vehicle = NEW.vehicle_id WHERE id = drv_id;
      UPDATE bookings SET driver_id = drv_id WHERE id = NEW.id;
      UPDATE vehicles SET status = 'booked' WHERE id = NEW.vehicle_id;
      INSERT INTO booking_logs (booking_id, action, note) VALUES (NEW.id, 'driver_assigned', CONCAT('Driver ID ', drv_id, ' assigned'));
    ELSE
      INSERT INTO booking_logs (booking_id, action, note) VALUES (NEW.id, 'driver_pending', 'No available driver; admin must assign.');
    END IF;
  END IF;
END$$

CREATE TRIGGER trg_after_booking_update
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF OLD.status <> 'cancelled' AND NEW.status = 'cancelled' THEN
    IF NEW.vehicle_id IS NOT NULL THEN
      UPDATE vehicles SET status = 'available' WHERE id = NEW.vehicle_id;
    END IF;
    IF NEW.driver_id IS NOT NULL THEN
      UPDATE drivers SET assigned_vehicle = NULL WHERE id = NEW.driver_id;
    END IF;
    INSERT INTO booking_logs (booking_id, action, note) VALUES (NEW.id, 'cancelled', CONCAT('Booking cancelled at ', NOW()));
  END IF;
END$$

DELIMITER ;

-- ============ VIEWS ============

CREATE OR REPLACE VIEW vw_booking_details AS
SELECT b.id AS booking_id, u.name AS user_name, u.email, p.title AS package_title, v.make, v.model, v.registration_no, d.name AS driver_name, b.start_date, b.end_date, b.passengers, b.total_price, b.status
FROM bookings b
LEFT JOIN users u ON b.user_id = u.id
LEFT JOIN packages p ON b.package_id = p.id
LEFT JOIN vehicles v ON b.vehicle_id = v.id
LEFT JOIN drivers d ON b.driver_id = d.id;

-- ============ STORED PROCEDURES ============

DELIMITER $$

CREATE PROCEDURE sp_get_available_vehicles(IN in_start DATE, IN in_end DATE)
BEGIN
  SELECT * FROM vehicles v
  WHERE v.status = 'available'
  AND v.id NOT IN (
    SELECT vehicle_id FROM bookings WHERE status IN ('pending','confirmed') AND (
      (start_date BETWEEN in_start AND in_end) OR (end_date BETWEEN in_start AND in_end) OR (start_date <= in_start AND end_date >= in_end)
    )
  );
END$$

DELIMITER ;

-- ============ INDEXES ============

CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_vehicle_status ON vehicles(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- ============ SEED DATA ============

INSERT INTO vehicle_types (name, description) VALUES
('Car','Sedan or hatchback for small groups'),
('Van','7-12 seater'),
('Bus','Large bus for >20 people');

INSERT INTO vehicles (type_id, make, model, registration_no, capacity, image_url, status) VALUES
(1,'Toyota','Etios','RJ14AB1234',4,'https://picsum.photos/seed/car1/400/300', 'available'),
(2,'Maruti','Eeco','RJ14CD5678',8,'https://picsum.photos/seed/van1/400/300', 'available'),
(3,'Volvo','9700','RJ14EF9012',40,'https://picsum.photos/seed/bus1/400/300', 'available');

INSERT INTO drivers (name, license_no, phone, is_active) VALUES
('Ramesh Kumar','LIC12345','+91-9000000001', TRUE),
('Suresh Singh','LIC67890','+91-9000000002', TRUE);

INSERT INTO packages (title, short_description, long_description, price, duration_days, image_url, guide_required, is_active) VALUES
('Historic Jaipur Tour','Walk through old city and palaces','Full day guided tour of Hawa Mahal, City Palace, Jantar Mantar',1200.00,1,'https://picsum.photos/seed/jaipur/600/400', TRUE, TRUE),
('Ranthambore Safari','Wildlife and nature','2-day safari with overnight stay near Ranthambore National Park',8000.00,2,'https://picsum.photos/seed/ranth/600/400', FALSE, TRUE),
('Udaipur City Tour','City of lakes','3-day package covering Lake Palace, Jagdish Temple, and local markets',5000.00,3,'https://picsum.photos/seed/udaipur/600/400', TRUE, TRUE);

-- Sample admin user (password: admin@123 - hashed with bcrypt)
INSERT INTO users (name, email, phone, password_hash, is_admin, is_active) VALUES
('Admin User','admin@travelms.com','+91-9999999999','$2a$10$YOu.bklL8FoQjEbkDKSVz.BYXpGH5h7yCsEAKRQmZNVgQaXI3vBCm', TRUE, TRUE);
-- Sample regular user (password: user@123 - hashed with bcrypt)
INSERT INTO users (name, email, phone, password_hash, is_admin, is_active) VALUES
('Test User','user@travelms.com','+91-9000000000','$2a$10$5G8F8lk7kL5KZFqJqQQqCOmCb5H5LqQH5mH8H5H5H5H5H5H5H5H5m', FALSE, TRUE);
