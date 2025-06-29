-- Create refresh_token table
CREATE TABLE IF NOT EXISTS refresh_token (
    id SERIAL PRIMARY KEY,
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES person(id_person) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON refresh_token(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_token_expires_at ON refresh_token(expires_at); 