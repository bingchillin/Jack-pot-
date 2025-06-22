-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id_product SERIAL PRIMARY KEY,
    name VARCHAR(250) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stripe_product_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    image_url VARCHAR(1000),
    stock_quantity INTEGER DEFAULT 0,
    sku VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_stripe_product_id ON products(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Insert sample Jack Pot product
INSERT INTO products (name, description, price, currency, sku, stock_quantity, is_active) VALUES 
('Jack Pot Smart Planter', 'Revolutionary IoT smart pot with advanced plant monitoring, automated watering, and mobile app connectivity. Features soil moisture sensors, light monitoring, and temperature control for optimal plant growth.', 99.99, 'USD', 'JP-SMART-001', 50, true);

-- Add stripe_customer_id column to person table if it doesn't exist
ALTER TABLE person ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_person_stripe_customer_id ON person(stripe_customer_id); 