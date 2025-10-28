-- Table categories
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT 'amber',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table products avec clé étrangère
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  category_id BIGINT REFERENCES categories(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Catégories par défaut
INSERT INTO categories (name, color) VALUES
('Meubles', 'amber'),
('Luminaires', 'blue'), 
('Vaisselle', 'rose'),
('Décoration', 'emerald'),
('Livres', 'violet'),
('Divers', 'gray');

-- Produits avec category_id
INSERT INTO products (name, price, description, image, category_id, quantity) VALUES
('Chaise en bois sculpté vintage', 78500, 'Magnifique chaise ancienne...', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400', 1, 2),
('Lampe à huile en laiton', 55700, 'Lampe à huile authentique...', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', 2, 1);