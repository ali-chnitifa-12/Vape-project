CREATE TABLE IF NOT EXISTS products (
    id         BIGINT       PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    category   VARCHAR(100) NOT NULL,
    price      DECIMAL(10,2) NOT NULL,
    originalPrice DECIMAL(10,2) DEFAULT NULL,
    badge      VARCHAR(50)  DEFAULT 'new',
    rating     INT          DEFAULT 5,
    reviews    INT          DEFAULT 0,
    image      VARCHAR(500) DEFAULT '/images/vape_device_1_1777480668776.png',
    color      VARCHAR(50)  DEFAULT '#00ffaa',
    description TEXT,
    specs      JSON,
    flavors    JSON,
    stock      INT          DEFAULT 0,
    outOfStock TINYINT(1)   DEFAULT 0,
    createdAt  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id           BIGINT       PRIMARY KEY,
    customerName VARCHAR(255) NOT NULL,
    customerEmail VARCHAR(255) NOT NULL,
    total        DECIMAL(10,2) NOT NULL,
    status       VARCHAR(100) DEFAULT 'Paid (CMI)',
    authCode     VARCHAR(100) DEFAULT NULL,
    tranId       VARCHAR(100) DEFAULT NULL,
    createdAt    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id        INT AUTO_INCREMENT PRIMARY KEY,
    orderId   BIGINT NOT NULL,
    productId BIGINT NOT NULL,
    name      VARCHAR(255),
    price     DECIMAL(10,2),
    qty       INT,
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
    id        BIGINT       PRIMARY KEY,
    productId BIGINT       NOT NULL,
    name      VARCHAR(255) NOT NULL,
    rating    INT          NOT NULL,
    comment   TEXT,
    createdAt TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
);
