-- Table pour les commentaires
CREATE TABLE IF NOT EXISTS comment (
    id_comment SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    id_person INTEGER NOT NULL,
    parent_comment_id INTEGER,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Contraintes
    CONSTRAINT fk_comment_person FOREIGN KEY (id_person) REFERENCES person(id_person) ON DELETE CASCADE,
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES comment(id_comment) ON DELETE CASCADE,
    
    -- Index pour améliorer les performances
    CONSTRAINT check_content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_comment_person ON comment(id_person);
CREATE INDEX IF NOT EXISTS idx_comment_parent ON comment(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_created_at ON comment(created_at);
CREATE INDEX IF NOT EXISTS idx_comment_deleted ON comment(is_deleted);

-- Table pour les likes de commentaires
CREATE TABLE IF NOT EXISTS comment_like (
    id_comment_like SERIAL PRIMARY KEY,
    id_person INTEGER NOT NULL,
    id_comment INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Contraintes
    CONSTRAINT fk_comment_like_person FOREIGN KEY (id_person) REFERENCES person(id_person) ON DELETE CASCADE,
    CONSTRAINT fk_comment_like_comment FOREIGN KEY (id_comment) REFERENCES comment(id_comment) ON DELETE CASCADE,
    
    -- Contrainte unique pour éviter les likes multiples
    CONSTRAINT unique_person_comment_like UNIQUE(id_person, id_comment)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_comment_like_person ON comment_like(id_person);
CREATE INDEX IF NOT EXISTS idx_comment_like_comment ON comment_like(id_comment);
CREATE INDEX IF NOT EXISTS idx_comment_like_created_at ON comment_like(created_at);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_updated_at
    BEFORE UPDATE ON comment
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_updated_at(); 