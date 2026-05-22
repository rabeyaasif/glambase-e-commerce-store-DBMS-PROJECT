
DROP DATABASE IF EXISTS glambase;
CREATE DATABASE glambase;
USE glambase;


CREATE TABLE brands (
    brand_id    INT AUTO_INCREMENT PRIMARY KEY,
    brand_name  VARCHAR(100) NOT NULL,
    country     VARCHAR(60),
    website     VARCHAR(200)
);


CREATE TABLE categories (
    category_id   INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    parent_id     INT,
    description   VARCHAR(255),
    FOREIGN KEY (parent_id) REFERENCES categories(category_id)
);



CREATE TABLE shades (
    shade_id   INT AUTO_INCREMENT PRIMARY KEY,
    shade_name VARCHAR(80) NOT NULL,
    hex_code   VARCHAR(7),
    finish     VARCHAR(20) DEFAULT 'natural'
    -- finish can be: matte, satin, glossy, metallic, shimmer, natural
);


CREATE TABLE products (
    product_id   INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(150) NOT NULL,
    brand_id     INT NOT NULL,
    category_id  INT NOT NULL,
    description  TEXT,
    base_price   DECIMAL(10, 2) NOT NULL,
    is_active    INT DEFAULT 1,   -- 1 means available, 0 means hidden
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (brand_id)    REFERENCES brands(brand_id),
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);



CREATE TABLE product_images (
    image_id   INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url  VARCHAR(300) NOT NULL,
    is_primary INT DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);



CREATE TABLE product_shades (
    ps_id       INT AUTO_INCREMENT PRIMARY KEY,
    product_id  INT NOT NULL,
    shade_id    INT NOT NULL,
    sku         VARCHAR(60) NOT NULL UNIQUE,  -- unique code for each product+shade combo
    price_diff  DECIMAL(8, 2) DEFAULT 0.00,  -- some shades cost a bit more or less
    stock_qty   INT DEFAULT 0,               -- how many units we have right now
    min_stock   INT DEFAULT 10,              -- alert when stock falls below this number

    FOREIGN KEY (product_id) REFERENCES products(product_id),
    FOREIGN KEY (shade_id)   REFERENCES shades(shade_id)
);


CREATE TABLE customers (
    customer_id   INT AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(60) NOT NULL,
    last_name     VARCHAR(60) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    phone         VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,  -- we never store plain text passwords
    date_of_birth DATE,
    gender        VARCHAR(30),
    glam_points   INT DEFAULT 0,
    tier          VARCHAR(20) DEFAULT 'bronze',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);




CREATE TABLE customer_addresses (
    address_id  INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    label       VARCHAR(30) DEFAULT 'Home',
    street      VARCHAR(200) NOT NULL,
    city        VARCHAR(80) NOT NULL,
    province    VARCHAR(80),
    postal_code VARCHAR(20),
    country     VARCHAR(60) DEFAULT 'Pakistan',
    is_default  INT DEFAULT 0,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);




CREATE TABLE glam_points_log (
    log_id      INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    change_amt  INT NOT NULL,
    reason      VARCHAR(150),
    order_id    INT,
    logged_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);




CREATE TABLE orders (
    order_id        INT AUTO_INCREMENT PRIMARY KEY,
    customer_id     INT NOT NULL,
    address_id      INT,
    order_status    VARCHAR(30) DEFAULT 'pending',
    -- status can be: pending, confirmed, processing, shipped, delivered, cancelled
    subtotal        DECIMAL(12, 2) DEFAULT 0.00,   -- total before discount and tax
    discount_amt    DECIMAL(10, 2) DEFAULT 0.00,   -- discount applied
    tax_amt         DECIMAL(10, 2) DEFAULT 0.00,   -- GST 17%
    shipping_amt    DECIMAL(10, 2) DEFAULT 0.00,   -- delivery fee
    total_amt       DECIMAL(12, 2) DEFAULT 0.00,   -- final amount
    points_redeemed INT DEFAULT 0,
    notes           TEXT,
    ordered_at      DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (address_id)  REFERENCES customer_addresses(address_id)
);




CREATE TABLE order_items (
    item_id    INT AUTO_INCREMENT PRIMARY KEY,
    order_id   INT NOT NULL,
    ps_id      INT NOT NULL,      -- which product + shade was ordered
    quantity   INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(12, 2),    -- quantity x unit_price (calculated in our procedure)

    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (ps_id)    REFERENCES product_shades(ps_id)
);




CREATE TABLE payments (
    payment_id      INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT NOT NULL UNIQUE,  -- one payment per order
    method          VARCHAR(50) NOT NULL,
    -- options: cash_on_delivery, easypaisa, jazzcash, bank_transfer, credit_card
    status          VARCHAR(20) DEFAULT 'pending',
    -- options: pending, completed, failed, refunded
    transaction_ref VARCHAR(120),
    amount_paid     DECIMAL(12, 2) NOT NULL,
    paid_at         DATETIME,

    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);



CREATE TABLE inventory_log (
    log_id     INT AUTO_INCREMENT PRIMARY KEY,
    ps_id      INT NOT NULL,
    change_qty INT NOT NULL,
    reason     VARCHAR(30) DEFAULT 'adjustment',
    -- options: sale, restock, return, adjustment, damage
    order_id   INT,
    staff_id   INT,
    qty_after  INT NOT NULL,   -- stock level after this change
    logged_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ps_id) REFERENCES product_shades(ps_id)
);


-

CREATE TABLE staff (
    staff_id      INT AUTO_INCREMENT PRIMARY KEY,
    first_name    VARCHAR(60) NOT NULL,
    last_name     VARCHAR(60) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    phone         VARCHAR(20),
    role          VARCHAR(30) NOT NULL,
    -- options: admin, manager, beauty_advisor, cashier, warehouse
    password_hash VARCHAR(255) NOT NULL,
    is_active     INT DEFAULT 1,
    hired_at      DATE
);


ALTER TABLE inventory_log
ADD FOREIGN KEY (staff_id) REFERENCES staff(staff_id);




CREATE TABLE shifts (
    shift_id   INT AUTO_INCREMENT PRIMARY KEY,
    staff_id   INT NOT NULL,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time   TIME NOT NULL,
    location   VARCHAR(30) DEFAULT 'store',
    notes      TEXT,

    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);




CREATE TABLE advisor_bookings (
    booking_id   INT AUTO_INCREMENT PRIMARY KEY,
    customer_id  INT NOT NULL,
    advisor_id   INT NOT NULL,   -- must be a staff member with role = beauty_advisor
    session_type VARCHAR(40) DEFAULT 'everyday_glam',
    -- options: bridal, skincare, everyday_glam, colour_matching, virtual
    booked_date  DATE NOT NULL,
    booked_time  TIME NOT NULL,
    duration_min INT DEFAULT 45,
    status       VARCHAR(20) DEFAULT 'pending',
    notes        TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (advisor_id)  REFERENCES staff(staff_id)
);




CREATE TABLE reviews (
    review_id   INT AUTO_INCREMENT PRIMARY KEY,
    product_id  INT NOT NULL,
    customer_id INT NOT NULL,
    rating      INT NOT NULL,         -- must be 1 to 5 stars
    title       VARCHAR(150),
    body        TEXT,
    is_verified INT DEFAULT 0,        -- trigger sets this to 1 if they bought the product
    is_approved INT DEFAULT 0,        -- admin approves before review shows on website
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (product_id)  REFERENCES products(product_id),
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);




CREATE TABLE promo_codes (
    promo_id      INT AUTO_INCREMENT PRIMARY KEY,
    code          VARCHAR(30) NOT NULL UNIQUE,
    discount_type VARCHAR(20) DEFAULT 'percentage',  -- 'percentage' or 'fixed'
    discount_val  DECIMAL(8, 2) NOT NULL,
    min_order_amt DECIMAL(10, 2) DEFAULT 0.00,
    max_uses      INT DEFAULT 1,
    used_count    INT DEFAULT 0,
    valid_from    DATETIME,
    valid_until   DATETIME,
    is_active     INT DEFAULT 1
);





CREATE INDEX idx_orders_customer   ON orders(customer_id);
CREATE INDEX idx_orders_date       ON orders(ordered_at);
CREATE INDEX idx_orders_status     ON orders(order_status);

-- We look up order items by order id very often
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Product catalog is searched by brand and category
CREATE INDEX idx_products_brand    ON products(brand_id);
CREATE INDEX idx_products_category ON products(category_id);

-- Inventory history is searched by shade
CREATE INDEX idx_inventory_ps      ON inventory_log(ps_id);

-- Reviews are searched by product
CREATE INDEX idx_reviews_product   ON reviews(product_id);

-- Customer login looks up by email
CREATE INDEX idx_customers_email   ON customers(email);

-- Low stock view needs to scan stock_qty column quickly
CREATE INDEX idx_ps_stock          ON product_shades(stock_qty);


-- =====================================================
-- VIEWS
-- Views are basically saved SELECT queries.
-- We use them so we do not have to write the same
-- complicated JOIN query every time.
-- =====================================================


-- VIEW 1: top_selling_products
-- Shows which products sell the most, their total revenue,
-- and their average star rating.
-- Used in the admin dashboard to see bestsellers.

CREATE VIEW top_selling_products AS
SELECT
    p.product_id,
    p.product_name,
    b.brand_name,
    c.category_name,
    SUM(oi.quantity)                     AS total_units_sold,
    SUM(oi.quantity * oi.unit_price)     AS total_revenue,
    AVG(r.rating)                        AS avg_rating,
    COUNT(r.review_id)                   AS total_reviews
FROM products       p
JOIN brands         b  ON b.brand_id    = p.brand_id
JOIN categories     c  ON c.category_id = p.category_id
JOIN product_shades ps ON ps.product_id = p.product_id
JOIN order_items    oi ON oi.ps_id      = ps.ps_id
JOIN orders         o  ON o.order_id    = oi.order_id
LEFT JOIN reviews   r  ON r.product_id  = p.product_id AND r.is_approved = 1
WHERE o.order_status NOT IN ('cancelled', 'refunded')
GROUP BY p.product_id, p.product_name, b.brand_name, c.category_name
ORDER BY total_units_sold DESC;


-- VIEW 2: low_stock_alerts
-- Shows all product shades where stock has dropped
-- to or below the minimum level. Staff check this daily
-- to know what needs to be restocked.

CREATE VIEW low_stock_alerts AS
SELECT
    ps.sku,
    p.product_name,
    s.shade_name,
    s.hex_code,
    ps.stock_qty  AS current_stock,
    ps.min_stock  AS minimum_allowed
FROM product_shades ps
JOIN products p ON p.product_id = ps.product_id
JOIN shades   s ON s.shade_id   = ps.shade_id
WHERE ps.stock_qty <= ps.min_stock
ORDER BY ps.stock_qty ASC;


-- VIEW 3: order_details_full
-- Joins 6 tables together to show full order info.
-- Used on the admin orders page and customer order history.
-- Instead of writing this big JOIN every time, we just
-- query this view.

CREATE VIEW order_details_full AS
SELECT
    o.order_id,
    o.ordered_at,
    o.order_status,
    CONCAT(c.first_name, ' ', c.last_name)  AS customer_name,
    c.email,
    p.product_name,
    sh.shade_name,
    oi.quantity,
    oi.unit_price,
    (oi.quantity * oi.unit_price)            AS line_total,
    o.total_amt,
    pay.method   AS payment_method,
    pay.status   AS payment_status
FROM orders         o
JOIN customers      c   ON c.customer_id = o.customer_id
JOIN order_items    oi  ON oi.order_id   = o.order_id
JOIN product_shades ps  ON ps.ps_id      = oi.ps_id
JOIN products       p   ON p.product_id  = ps.product_id
JOIN shades         sh  ON sh.shade_id   = ps.shade_id
LEFT JOIN payments  pay ON pay.order_id  = o.order_id;


-- VIEW 4: customer_loyalty_summary
-- Shows each customer's tier, points, and total spending.
-- Used in admin panel to manage loyalty program.

CREATE VIEW customer_loyalty_summary AS
SELECT
    c.customer_id,
    CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
    c.email,
    c.glam_points,
    c.tier,
    COUNT(o.order_id)  AS total_orders,
    SUM(o.total_amt)   AS lifetime_spend
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
    AND o.order_status NOT IN ('cancelled', 'refunded')
GROUP BY c.customer_id, c.first_name, c.last_name, c.email, c.glam_points, c.tier;


-- VIEW 5: monthly_sales_summary
-- Shows how much we sold each month.
-- Used for the revenue chart in the admin panel.

CREATE VIEW monthly_sales_summary AS
SELECT
    YEAR(o.ordered_at)                    AS year,
    MONTH(o.ordered_at)                   AS month,
    COUNT(o.order_id)                     AS total_orders,
    SUM(o.total_amt)                      AS gross_revenue,
    SUM(o.discount_amt)                   AS total_discounts,
    SUM(o.total_amt - o.discount_amt)     AS net_revenue
FROM orders o
WHERE o.order_status NOT IN ('cancelled', 'refunded')
GROUP BY YEAR(o.ordered_at), MONTH(o.ordered_at)
ORDER BY year DESC, month DESC;


-- =====================================================
-- STORED PROCEDURES
-- Stored procedures are like saved programs in MySQL.
-- We write the logic once and PHP just calls them.
-- =====================================================


DELIMITER $$


-- PROCEDURE 1: place_order
-- =====================================================
-- This is our main checkout procedure.
-- When a customer clicks "Place Order", PHP calls this.
--
-- It handles everything step by step:
--   Step 1 - check if all items are in stock
--   Step 2 - calculate the price, tax, and shipping
--   Step 3 - apply promo code if customer has one
--   Step 4 - create the order record
--   Step 5 - add each item to order_items
--   Step 6 - reduce stock for each shade that was ordered
--   Step 7 - write to inventory_log so we have a record
--   Step 8 - create the payment record
--
-- We use a TRANSACTION so if anything goes wrong at
-- any step, ALL changes get rolled back. This is important
-- because we never want an order saved but stock not
-- deducted, or stock deducted but order not created.
-- =====================================================

CREATE PROCEDURE place_order(
    IN  p_customer_id INT,
    IN  p_address_id  INT,
    IN  p_ps_id_1     INT,     -- first item: which shade
    IN  p_qty_1       INT,     -- first item: how many
    IN  p_ps_id_2     INT,     -- second item (NULL if only 1 item)
    IN  p_qty_2       INT,
    IN  p_ps_id_3     INT,     -- third item (NULL if less than 3 items)
    IN  p_qty_3       INT,
    IN  p_promo_code  VARCHAR(30),
    IN  p_pay_method  VARCHAR(50),
    OUT p_order_id    INT,
    OUT p_message     VARCHAR(200)
)
BEGIN

    DECLARE v_stock     INT DEFAULT 0;
    DECLARE v_price     DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_subtotal  DECIMAL(12, 2) DEFAULT 0;
    DECLARE v_discount  DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_tax       DECIMAL(10, 2) DEFAULT 0;
    DECLARE v_shipping  DECIMAL(10, 2) DEFAULT 150;   -- default shipping PKR 150
    DECLARE v_total     DECIMAL(12, 2) DEFAULT 0;
    DECLARE v_new_id    INT DEFAULT 0;

    -- if any error happens, undo everything
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_order_id = 0;
        SET p_message  = 'Something went wrong. Order was not placed.';
    END;

    START TRANSACTION;

    -- STEP 1: Check stock for each item
    -- We check before doing anything else so we fail fast

    IF p_ps_id_1 IS NOT NULL THEN
        SELECT stock_qty INTO v_stock
        FROM product_shades
        WHERE ps_id = p_ps_id_1;

        IF v_stock < p_qty_1 THEN
            SET p_message = 'Not enough stock for item 1.';
            ROLLBACK;
            LEAVE place_order;
        END IF;
    END IF;

    IF p_ps_id_2 IS NOT NULL THEN
        SELECT stock_qty INTO v_stock
        FROM product_shades
        WHERE ps_id = p_ps_id_2;

        IF v_stock < p_qty_2 THEN
            SET p_message = 'Not enough stock for item 2.';
            ROLLBACK;
            LEAVE place_order;
        END IF;
    END IF;

    IF p_ps_id_3 IS NOT NULL THEN
        SELECT stock_qty INTO v_stock
        FROM product_shades
        WHERE ps_id = p_ps_id_3;

        IF v_stock < p_qty_3 THEN
            SET p_message = 'Not enough stock for item 3.';
            ROLLBACK;
            LEAVE place_order;
        END IF;
    END IF;

    -- STEP 2: Calculate the subtotal price

    IF p_ps_id_1 IS NOT NULL THEN
        SELECT (p.base_price + ps.price_diff) INTO v_price
        FROM product_shades ps
        JOIN products p ON p.product_id = ps.product_id
        WHERE ps.ps_id = p_ps_id_1;
        SET v_subtotal = v_subtotal + (v_price * p_qty_1);
    END IF;

    IF p_ps_id_2 IS NOT NULL THEN
        SELECT (p.base_price + ps.price_diff) INTO v_price
        FROM product_shades ps
        JOIN products p ON p.product_id = ps.product_id
        WHERE ps.ps_id = p_ps_id_2;
        SET v_subtotal = v_subtotal + (v_price * p_qty_2);
    END IF;

    IF p_ps_id_3 IS NOT NULL THEN
        SELECT (p.base_price + ps.price_diff) INTO v_price
        FROM product_shades ps
        JOIN products p ON p.product_id = ps.product_id
        WHERE ps.ps_id = p_ps_id_3;
        SET v_subtotal = v_subtotal + (v_price * p_qty_3);
    END IF;

    -- STEP 3: Apply promo code if customer entered one

    IF p_promo_code IS NOT NULL AND p_promo_code != '' THEN
        SELECT discount_val INTO v_discount
        FROM promo_codes
        WHERE code       = p_promo_code
          AND is_active  = 1
          AND used_count < max_uses
          AND min_order_amt <= v_subtotal
          AND (valid_until IS NULL OR valid_until >= NOW());

        -- if discount is still 0 the promo code was not valid, no error needed
        IF v_discount > 0 THEN
            UPDATE promo_codes
            SET used_count = used_count + 1
            WHERE code = p_promo_code;
        END IF;
    END IF;

    -- STEP 4: Add tax (17% GST) and check if shipping is free
    -- Orders above PKR 5000 get free shipping

    SET v_tax = (v_subtotal - v_discount) * 0.17;

    IF (v_subtotal - v_discount) >= 5000 THEN
        SET v_shipping = 0;
    END IF;

    SET v_total = v_subtotal - v_discount + v_tax + v_shipping;

    -- STEP 5: Save the order to the orders table

    INSERT INTO orders (customer_id, address_id, subtotal, discount_amt, tax_amt, shipping_amt, total_amt)
    VALUES (p_customer_id, p_address_id, v_subtotal, v_discount, v_tax, v_shipping, v_total);

    SET v_new_id = LAST_INSERT_ID();

    -- STEP 6, 7, 8: For each item - insert into order_items, reduce stock, log it

    IF p_ps_id_1 IS NOT NULL THEN
        SELECT (p.base_price + ps.price_diff) INTO v_price
        FROM product_shades ps
        JOIN products p ON p.product_id = ps.product_id
        WHERE ps.ps_id = p_ps_id_1;

        INSERT INTO order_items (order_id, ps_id, quantity, unit_price, line_total)
        VALUES (v_new_id, p_ps_id_1, p_qty_1, v_price, p_qty_1 * v_price);

        UPDATE product_shades
        SET stock_qty = stock_qty - p_qty_1
        WHERE ps_id = p_ps_id_1;

        INSERT INTO inventory_log (ps_id, change_qty, reason, order_id, qty_after)
        SELECT p_ps_id_1, -p_qty_1, 'sale', v_new_id, stock_qty
        FROM product_shades WHERE ps_id = p_ps_id_1;
    END IF;

    IF p_ps_id_2 IS NOT NULL THEN
        SELECT (p.base_price + ps.price_diff) INTO v_price
        FROM product_shades ps
        JOIN products p ON p.product_id = ps.product_id
        WHERE ps.ps_id = p_ps_id_2;

        INSERT INTO order_items (order_id, ps_id, quantity, unit_price, line_total)
        VALUES (v_new_id, p_ps_id_2, p_qty_2, v_price, p_qty_2 * v_price);

        UPDATE product_shades
        SET stock_qty = stock_qty - p_qty_2
        WHERE ps_id = p_ps_id_2;

        INSERT INTO inventory_log (ps_id, change_qty, reason, order_id, qty_after)
        SELECT p_ps_id_2, -p_qty_2, 'sale', v_new_id, stock_qty
        FROM product_shades WHERE ps_id = p_ps_id_2;
    END IF;

    IF p_ps_id_3 IS NOT NULL THEN
        SELECT (p.base_price + ps.price_diff) INTO v_price
        FROM product_shades ps
        JOIN products p ON p.product_id = ps.product_id
        WHERE ps.ps_id = p_ps_id_3;

        INSERT INTO order_items (order_id, ps_id, quantity, unit_price, line_total)
        VALUES (v_new_id, p_ps_id_3, p_qty_3, v_price, p_qty_3 * v_price);

        UPDATE product_shades
        SET stock_qty = stock_qty - p_qty_3
        WHERE ps_id = p_ps_id_3;

        INSERT INTO inventory_log (ps_id, change_qty, reason, order_id, qty_after)
        SELECT p_ps_id_3, -p_qty_3, 'sale', v_new_id, stock_qty
        FROM product_shades WHERE ps_id = p_ps_id_3;
    END IF;

    -- STEP 9: Create the payment record

    INSERT INTO payments (order_id, method, amount_paid)
    VALUES (v_new_id, p_pay_method, v_total);

    -- everything worked so we commit (save) all changes
    COMMIT;

    SET p_order_id = v_new_id;
    SET p_message  = 'Order placed successfully!';

END $$


-- PROCEDURE 2: restock_product_shade
-- Called when new stock arrives at the warehouse.
-- Updates stock_qty and writes a record to inventory_log.

CREATE PROCEDURE restock_product_shade(
    IN p_ps_id    INT,
    IN p_quantity INT,
    IN p_staff_id INT
)
BEGIN
    DECLARE v_new_qty INT;

    START TRANSACTION;

        UPDATE product_shades
        SET stock_qty = stock_qty + p_quantity
        WHERE ps_id = p_ps_id;

        -- find out the new stock level after adding
        SELECT stock_qty INTO v_new_qty
        FROM product_shades
        WHERE ps_id = p_ps_id;

        -- save this restock in the inventory history
        INSERT INTO inventory_log (ps_id, change_qty, reason, staff_id, qty_after)
        VALUES (p_ps_id, p_quantity, 'restock', p_staff_id, v_new_qty);

    COMMIT;
END $$


-- PROCEDURE 3: get_customer_order_history
-- Returns all past orders for one customer.
-- PHP calls this when customer opens "My Orders" page.

CREATE PROCEDURE get_customer_order_history(IN p_customer_id INT)
BEGIN
    SELECT
        o.order_id,
        o.ordered_at,
        o.order_status,
        o.total_amt,
        pay.method  AS payment_method,
        pay.status  AS payment_status
    FROM orders      o
    LEFT JOIN payments pay ON pay.order_id = o.order_id
    WHERE o.customer_id = p_customer_id
    ORDER BY o.ordered_at DESC;
END $$
DELIMITER ;


-- PROCEDURE 4: generate_sales_report
-- Admin can run this to see sales between two dates.
-- Shows daily breakdown of orders and revenue.

CREATE PROCEDURE generate_sales_report(IN p_from DATE, IN p_to DATE)
BEGIN
    SELECT
        DATE(o.ordered_at)   AS sale_date,
        COUNT(o.order_id)    AS number_of_orders,
        SUM(o.total_amt)     AS total_revenue,
        SUM(o.discount_amt)  AS total_discounts,
        SUM(oi.quantity)     AS total_units_sold
    FROM orders      o
    JOIN order_items oi ON oi.order_id = o.order_id
    WHERE DATE(o.ordered_at) BETWEEN p_from AND p_to
      AND o.order_status NOT IN ('cancelled', 'refunded')
    GROUP BY DATE(o.ordered_at)
    ORDER BY sale_date;
END $$


-- PROCEDURE 5: update_customer_tier
-- Recalculates what tier a customer should be in
-- based on their total amount spent.
-- Tiers: Bronze (default) > Silver > Gold > Platinum

CREATE PROCEDURE update_customer_tier(IN p_customer_id INT)
BEGIN
    DECLARE v_total_spend DECIMAL(12, 2) DEFAULT 0;

    -- calculate total spending (not counting cancelled orders)
    SELECT SUM(total_amt) INTO v_total_spend
    FROM orders
    WHERE customer_id  = p_customer_id
      AND order_status NOT IN ('cancelled', 'refunded');

    -- handle case where customer has no orders yet
    IF v_total_spend IS NULL THEN
        SET v_total_spend = 0;
    END IF;

    -- update their tier based on how much they have spent
    UPDATE customers
    SET tier = CASE
        WHEN v_total_spend >= 100000 THEN 'platinum'
        WHEN v_total_spend >= 50000  THEN 'gold'
        WHEN v_total_spend >= 20000  THEN 'silver'
        ELSE 'bronze'
    END
    WHERE customer_id = p_customer_id;
END $$


DELIMITER ;


-- =====================================================
-- TRIGGERS
-- Triggers run automatically when something happens
-- in the database. We do not call them from PHP.
-- MySQL fires them on its own.
-- =====================================================


DELIMITER $$


-- TRIGGER 1: trg_award_glam_points
-- =====================================================
-- This trigger fires AFTER a payment row is updated.
-- When a payment changes to 'completed', we automatically
-- give the customer their loyalty points.
--
-- Rule: customer earns 1 point for every PKR 100 spent.
-- So an order of PKR 2500 gives 25 points.
--
-- We also update their tier in case they moved up.
-- =====================================================

CREATE TRIGGER trg_award_glam_points
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    DECLARE v_points     INT DEFAULT 0;
    DECLARE v_amount     DECIMAL(12, 2);
    DECLARE v_cust_id    INT;

    -- only run when payment BECOMES completed (not on every update)
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN

        -- get the order amount and the customer id
        SELECT total_amt, customer_id
        INTO   v_amount, v_cust_id
        FROM   orders
        WHERE  order_id = NEW.order_id;

        -- 1 point for every 100 rupees, FLOOR removes decimals
        SET v_points = FLOOR(v_amount / 100);

        -- add the points to the customer account
        UPDATE customers
        SET glam_points = glam_points + v_points
        WHERE customer_id = v_cust_id;

        -- write a log entry so customer can see where points came from
        INSERT INTO glam_points_log (customer_id, change_amt, reason, order_id)
        VALUES (v_cust_id, v_points, 'earned from purchase', NEW.order_id);

        -- update their loyalty tier in case they crossed a threshold
        CALL update_customer_tier(v_cust_id);

    END IF;
END $$


-- TRIGGER 2: trg_prevent_negative_stock
-- =====================================================
-- This trigger fires BEFORE any stock update.
-- If the new stock_qty would be negative (less than 0),
-- we block the update and show an error.
--
-- This is our safety net against overselling.
-- Even if a bug in our PHP code tries to deduct too much,
-- the database itself will stop it.
-- =====================================================

CREATE TRIGGER trg_prevent_negative_stock
BEFORE UPDATE ON product_shades
FOR EACH ROW
BEGIN
    IF NEW.stock_qty < 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: stock cannot go below zero. Not enough items in stock.';
    END IF;
END $$


-- TRIGGER 3: trg_confirm_order_on_payment
-- =====================================================
-- When a customer pays, the order status should
-- automatically move from "pending" to "confirmed".
-- Without this trigger someone would have to do it manually.
-- =====================================================

CREATE TRIGGER trg_confirm_order_on_payment
AFTER UPDATE ON payments
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE orders
        SET order_status = 'confirmed'
        WHERE order_id    = NEW.order_id
          AND order_status = 'pending';
    END IF;
END $$


-- TRIGGER 4: trg_log_inventory_on_item
-- =====================================================
-- This fires AFTER a new item is added to an order.
-- It is a backup log trigger - our procedure already
-- logs inventory changes, but this makes sure nothing
-- ever gets missed even if someone inserts order items
-- directly without using the procedure.
-- =====================================================

CREATE TRIGGER trg_log_inventory_on_item
AFTER INSERT ON order_items
FOR EACH ROW
BEGIN
    -- only write a log if one does not already exist for this order+shade
    IF NOT EXISTS (
        SELECT 1 FROM inventory_log
        WHERE ps_id = NEW.ps_id AND order_id = NEW.order_id
    ) THEN
        INSERT INTO inventory_log (ps_id, change_qty, reason, order_id, qty_after)
        SELECT NEW.ps_id, -NEW.quantity, 'sale', NEW.order_id, stock_qty
        FROM product_shades
        WHERE ps_id = NEW.ps_id;
    END IF;
END $$


-- TRIGGER 5: trg_verify_review
-- =====================================================
-- This fires BEFORE a review is saved.
-- We check if the customer actually ordered and received
-- this product. If they did, we set is_verified = 1.
--
-- This way the "Verified Purchase" badge is handled
-- by the database automatically. The customer cannot
-- fake it because we check the orders table directly.
-- =====================================================

CREATE TRIGGER trg_verify_review
BEFORE INSERT ON reviews
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1
        FROM orders         o
        JOIN order_items    oi ON oi.order_id  = o.order_id
        JOIN product_shades ps ON ps.ps_id     = oi.ps_id
        WHERE o.customer_id  = NEW.customer_id
          AND ps.product_id  = NEW.product_id
          AND o.order_status = 'delivered'
    ) THEN
        SET NEW.is_verified = 1;
    END IF;
END $$


DELIMITER ;


-- =====================================================
-- ROLE-BASED ACCESS CONTROL
-- We create 3 roles with different permissions.
-- This is for database security. Each type of user
-- can only do what they are supposed to do.
-- =====================================================

-- Role 1: glambase_customer
-- Customers can browse products and manage their own orders.
-- They cannot touch inventory or staff data.
CREATE ROLE 'glambase_customer';
GRANT SELECT ON glambase.products             TO 'glambase_customer';
GRANT SELECT ON glambase.product_shades       TO 'glambase_customer';
GRANT SELECT ON glambase.shades               TO 'glambase_customer';
GRANT SELECT ON glambase.brands               TO 'glambase_customer';
GRANT SELECT ON glambase.categories           TO 'glambase_customer';
GRANT SELECT ON glambase.reviews              TO 'glambase_customer';
GRANT INSERT, UPDATE ON glambase.reviews      TO 'glambase_customer';
GRANT INSERT, SELECT ON glambase.orders       TO 'glambase_customer';
GRANT INSERT, SELECT ON glambase.order_items  TO 'glambase_customer';
GRANT INSERT, SELECT ON glambase.payments     TO 'glambase_customer';
GRANT INSERT, SELECT, UPDATE ON glambase.customer_addresses TO 'glambase_customer';
GRANT INSERT, SELECT ON glambase.advisor_bookings TO 'glambase_customer';
GRANT EXECUTE ON PROCEDURE glambase.place_order                TO 'glambase_customer';
GRANT EXECUTE ON PROCEDURE glambase.get_customer_order_history TO 'glambase_customer';

-- Role 2: glambase_staff
-- Staff can update orders and manage inventory.
-- They cannot delete anything or access payment details.
CREATE ROLE 'glambase_staff';
GRANT SELECT, UPDATE ON glambase.orders           TO 'glambase_staff';
GRANT SELECT         ON glambase.order_items      TO 'glambase_staff';
GRANT SELECT, UPDATE ON glambase.product_shades   TO 'glambase_staff';
GRANT SELECT, INSERT ON glambase.inventory_log    TO 'glambase_staff';
GRANT SELECT, UPDATE ON glambase.advisor_bookings TO 'glambase_staff';
GRANT SELECT         ON glambase.customers        TO 'glambase_staff';
GRANT SELECT         ON glambase.low_stock_alerts TO 'glambase_staff';
GRANT EXECUTE ON PROCEDURE glambase.restock_product_shade TO 'glambase_staff';

-- Role 3: glambase_admin
-- Admin has full access to everything
CREATE ROLE 'glambase_admin';
GRANT ALL PRIVILEGES ON glambase.* TO 'glambase_admin';


-- =====================================================
-- SAMPLE DATA
-- Test data so we can see everything working
-- =====================================================

-- Adding brands
INSERT INTO brands (brand_name, country) VALUES
    ('Huda Beauty',       'UAE'),
    ('Charlotte Tilbury', 'UK'),
    ('L.A. Girl',         'USA'),
    ('Medora',            'Pakistan'),
    ('Rivaj UK',          'Pakistan'),
    ('NYX Professional',  'USA');

-- Adding main categories
INSERT INTO categories (category_name, description) VALUES
    ('Lips',     'Lipsticks, glosses, liners'),
    ('Eyes',     'Mascaras, eyeshadows, liners'),
    ('Face',     'Foundations, blushes, highlighters'),
    ('Skincare', 'Serums, moisturizers, cleansers'),
    ('Tools',    'Brushes, sponges, accessories');

-- Adding sub-categories under main ones
-- parent_id 1 = Lips, 2 = Eyes, 3 = Face
INSERT INTO categories (category_name, parent_id, description) VALUES
    ('Lipstick',   1, 'Bullet lipsticks'),
    ('Lip Gloss',  1, 'Glossy lip products'),
    ('Eyeshadow',  2, 'Palettes and singles'),
    ('Foundation', 3, 'Liquid and powder foundations'),
    ('Blush',      3, 'Powder and cream blushes');

-- Adding shades with their colour codes
INSERT INTO shades (shade_name, hex_code, finish) VALUES
    ('Classic Red',   '#C0392B', 'matte'),
    ('Nude Beige',    '#D4A574', 'satin'),
    ('Rose Gold',     '#B76E79', 'metallic'),
    ('Berry Wine',    '#722F37', 'matte'),
    ('Coral Crush',   '#FF6B6B', 'glossy'),
    ('Desert Sand',   '#EDC9AF', 'natural'),
    ('Midnight Plum', '#4A0E4E', 'matte'),
    ('Cotton Candy',  '#FFB7C5', 'shimmer'),
    ('Ivory',         '#FFFFF0', 'natural'),
    ('Warm Peach',    '#FFAD88', 'satin');

-- Adding products
-- brand_id 1=Huda, 2=Charlotte, 3=LAGirl, 4=Medora, 5=Rivaj, 6=NYX
-- category_id 6=Lipstick, 7=LipGloss, 9=Foundation, 10=Blush
INSERT INTO products (product_name, brand_id, category_id, description, base_price) VALUES
    ('Power Bullet Lipstick', 1, 6,  'High-pigment matte formula, lasts 12 hours',         2500.00),
    ('Pillow Lips Gloss',     1, 7,  'Plumping lip gloss with hyaluronic acid',             1800.00),
    ('Pro HD Foundation',     3, 9,  'Full-coverage liquid foundation',                     1200.00),
    ('Flawless Finish Base',  2, 9,  'Medium coverage with satin finish',                   4500.00),
    ('Glow Blush Duo',        6, 10, 'Pressed blush and highlighter in one palette',        1600.00),
    ('Mega Lash Mascara',     4, 2,  'Volumising mascara, smudge-proof',                     900.00),
    ('Intense Kohl Liner',    5, 2,  'Waterproof kohl pencil',                               550.00),
    ('Velvet Matte Lipstick', 5, 6,  'Long-lasting matte lipstick, made in Pakistan',        650.00);

-- Adding which shades each product comes in, with stock levels
-- SKU format: GB (GlamBase) - short product name - shade code
INSERT INTO product_shades (product_id, shade_id, sku, price_diff, stock_qty) VALUES
    (1, 1, 'GB-PBL-RED',  0,    45),
    (1, 2, 'GB-PBL-NUD',  0,    60),
    (1, 4, 'GB-PBL-BRY',  0,    30),
    (1, 7, 'GB-PBL-PLM',  0,    8),    -- only 8 left, will trigger low stock alert
    (2, 3, 'GB-PLG-RGD',  200,  50),   -- Rose Gold costs PKR 200 extra
    (2, 5, 'GB-PLG-CRL',  0,    40),
    (3, 6, 'GB-PHF-SND',  0,    100),
    (3, 9, 'GB-PHF-IVY',  0,    85),
    (4, 6, 'GB-FFB-SND',  500,  25),
    (4, 9, 'GB-FFB-IVY',  500,  15),
    (5, 3, 'GB-GBD-RGD',  0,    70),
    (5, 8, 'GB-GBD-CCY',  0,    55),
    (6, 1, 'GB-MML-BLK',  0,    200),
    (7, 1, 'GB-IKL-BLK',  0,    300),
    (8, 1, 'GB-VML-RED',  0,    9),    -- also running low
    (8, 2, 'GB-VML-NUD',  0,    75);

-- Adding staff members
INSERT INTO staff (first_name, last_name, email, phone, role, password_hash, hired_at) VALUES
    ('Ayesha', 'Khan',  'ayesha.admin@glambase.pk',  '0300-1111111', 'admin',          SHA2('Admin@123', 256), '2023-01-01'),
    ('Zara',   'Ahmed', 'zara.advisor@glambase.pk',  '0301-2222222', 'beauty_advisor', SHA2('Adv@2023',  256), '2023-03-15'),
    ('Hamza',  'Ali',   'hamza.cashier@glambase.pk', '0302-3333333', 'cashier',         SHA2('Cash@456',  256), '2023-06-01'),
    ('Fatima', 'Malik', 'fatima.mgr@glambase.pk',    '0303-4444444', 'manager',         SHA2('Mgr@789',   256), '2023-01-10');

-- Adding test customers
INSERT INTO customers (first_name, last_name, email, phone, password_hash, date_of_birth, gender) VALUES
    ('Sara',  'Qureshi',  'sara.q@email.com',  '0311-1234567', SHA2('Sara@pass',  256), '1995-05-12', 'female'),
    ('Laiba', 'Hassan',   'laiba.h@email.com', '0321-9876543', SHA2('Laiba@pass', 256), '1998-08-22', 'female'),
    ('Nadia', 'Siddiqui', 'nadia.s@email.com', '0331-5551234', SHA2('Nadia@pass', 256), '1990-11-30', 'female');

-- Adding addresses for each customer
INSERT INTO customer_addresses (customer_id, label, street, city, province, postal_code, is_default) VALUES
    (1, 'Home',   'B-12 Block 5, Clifton',  'Karachi', 'Sindh',  '75600', 1),
    (2, 'Home',   'House 7, DHA Phase 4',   'Karachi', 'Sindh',  '75500', 1),
    (3, 'Office', 'Room 4, Liberty Market', 'Lahore',  'Punjab', '54000', 1);

-- Adding a promo code for testing
INSERT INTO promo_codes (code, discount_type, discount_val, min_order_amt, max_uses, valid_until) VALUES
    ('GLAM20', 'percentage', 20.00, 1000.00, 100, '2025-12-31');


-- =====================================================
-- TEST QUERIES - run these to check everything works
-- =====================================================

-- See which shades are running low on stock
SELECT * FROM low_stock_alerts;

-- See customer loyalty info
SELECT * FROM customer_loyalty_summary;

-- Test placing an order (Sara buys 2x Classic Red lipstick + 1x Rose Gold gloss):
-- CALL place_order(1, 1, 1, 2, 5, 1, NULL, NULL, 'GLAM20', 'easypaisa', @oid, @msg);
-- SELECT @oid AS order_id, @msg AS result_message;

-- See all order details after placing one
-- SELECT * FROM order_details_full;

-- Run a sales report
-- CALL generate_sales_report('2024-01-01', '2024-12-31');

-- See top selling products (needs orders placed first)
-- SELECT * FROM top_selling_products;
