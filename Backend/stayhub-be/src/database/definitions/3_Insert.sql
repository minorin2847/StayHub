-- 1. Destinations
INSERT INTO destinations (name, price, image, description, category)
VALUES 
    ('Paris, France', 128, '/images/Product-card-1.jpg', 'Romantic escapes, art, and cafés.', 'spring'),
    ('Kyoto, Japan', 190, '/images/Product-card-1.jpg', 'Cherry blossoms and temples.', 'spring'),
    ('Santorini, Greece', 225, '/images/Product-card-1.jpg', 'Sunsets, sea views, and serenity.', 'summer'),
    ('Bali, Indonesia', 26, '/images/Product-card-1.jpg', 'Beaches, nature, and calm vibes.', 'summer'),
    ('Tuscany, Italy', 160, '/images/Product-card-1.jpg', 'Vineyards and golden hills.', 'autumn'),
    ('Swiss Alps', 300, '/images/Product-card-1.jpg', 'Skiing and snowy mountains.', 'winter'),
    ('Barcelona, Spain', 110, '/images/Product-card-1.jpg', 'Urban beaches and tapas nights.', 'summer'),
    ('Nice, France', 128, '/images/Product-card-1.jpg', 'Pebbled beaches and coastal charm.', 'summer'),
    ('Prague, Czech', 189, '/images/Product-card-1.jpg', 'Cobblestone walks and cozy cafés.', 'autumn'),
    ('Reykjavik, Iceland', 128, '/images/Product-card-1.jpg', 'Auroras, hot springs, and winter wonders.', 'winter')
ON CONFLICT DO NOTHING;

-- 2. Deals
INSERT INTO deals (title, location, image, rating, review_count, price_original, price_discount)
VALUES 
    ('Seaside Serenity Villa', 'Amalfi Coast, Italy', '/images/Product-card-1.jpg', 4.8, 118, 250, 175),
    ('Tropical Bungalow', 'Phuket, Thailand', '/images/Product-card-1.jpg', 3.8, 210, 210, 160),
    ('Santorini Sunset Suites', 'Santorini, Greece', '/images/Product-card-1.jpg', 4.9, 185, 300, 255),
    ('Marbella Resort', 'Marbella, Spain', '/images/Product-card-1.jpg', 4.6, 142, 280, 190),
    ('Swiss Ski Chalet', 'Zermatt, Switzerland', '/images/Product-card-1.jpg', 4.9, 300, 400, 320)
ON CONFLICT DO NOTHING;

-- 3. Top Sights
INSERT INTO top_sights (name, flag_icon, image)
VALUES 
    ('Sassnitz', 'FI', '/images/Top-Sight-1.jpg'),
    ('Binz', 'VN', '/images/Top-Sight-1.jpg'),
    ('Sagard', 'FR', '/images/Top-Sight-1.jpg'),
    ('Bergen', 'GB', '/images/Top-Sight-1.jpg'),
    ('Freedom', 'US', '/images/Top-Sight-1.jpg')
ON CONFLICT DO NOTHING;

-- 4. Things To Do
INSERT INTO things_to_do (name, image, category)
VALUES 
    ('Sagrada Familia', '/images/Product-card-1.jpg', 'explore'),
    ('Park Güell', '/images/Product-card-1.jpg', 'explore'),
    ('Barceloneta Beach', '/images/Product-card-1.jpg', 'beach'),
    ('Picasso Museum', '/images/Product-card-1.jpg', 'museum'),
    ('Magic Fountain', '/images/Product-card-1.jpg', 'show'),
    ('Opium Club', '/images/Product-card-1.jpg', 'nightlife')
ON CONFLICT DO NOTHING;

-- 5. Home Guests
INSERT INTO home_Guests (title, location, image, rating, review_count, price_original)
VALUES 
    ('Seaside Serenity Villa', 'Amalfi Coast, Italy', '/images/Product-card-1.jpg', 4.8, 118, 250),
    ('Tropical Bungalow', 'Phuket, Thailand', '/images/Product-card-1.jpg', 3.8, 210, 210),
    ('Santorini Sunset Suites', 'Santorini, Greece', '/images/Product-card-1.jpg', 4.9, 185, 300),
    ('Marbella Resort', 'Marbella, Spain', '/images/Product-card-1.jpg', 4.6, 142, 280),
    ('Swiss Ski Chalet', 'Zermatt, Switzerland', '/images/Product-card-1.jpg', 4.9, 300, 400)
ON CONFLICT DO NOTHING;