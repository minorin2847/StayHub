-- 3_Insert.sql
-- Mock Data Insertion Script (10 rows per table)
-- IMPORTANT: Run this on a fresh database or handle conflicts appropriately.

-- 1. Cities
INSERT INTO cities (abbreviation, name, description) VALUES
('NYC', 'New York City', 'The Big Apple'),
('LAX', 'Los Angeles', 'City of Angels'),
('ORD', 'Chicago', 'The Windy City'),
('MIA', 'Miami', 'Magic City'),
('SFO', 'San Francisco', 'The Golden City'),
('LAS', 'Las Vegas', 'Sin City'),
('SEA', 'Seattle', 'Emerald City'),
('BOS', 'Boston', 'Beantown'),
('ATX', 'Austin', 'Live Music Capital'),
('DEN', 'Denver', 'Mile High City')
ON CONFLICT DO NOTHING;

-- 2. Branch
INSERT INTO branch (name, location, description) VALUES
('North East Branch', 'New York Region', 'Managing NE properties'),
('West Coast Branch', 'California Region', 'Managing Pacific properties'),
('Midwest Branch', 'Illinois Region', 'Managing Midwest properties'),
('South East Branch', 'Florida Region', 'Managing SE properties'),
('Texas Branch', 'Texas Region', 'Managing Texas properties'),
('Mountain Branch', 'Colorado Region', 'Managing Mountain properties'),
('North West Branch', 'Washington Region', 'Managing NW properties'),
('New England Branch', 'Mass. Region', 'Managing NE coastal properties'),
('South West Branch', 'Nevada/AZ Region', 'Managing SW properties'),
('Hawaii Branch', 'Hawaii Region', 'Managing Tropical properties')
ON CONFLICT DO NOTHING;

-- 3. Hotels
INSERT INTO hotels (name, classification, branchID, city_abbreviation, location, description, contact_email, contact_phone) VALUES
('The Plaza NYC', 5, 1, 'NYC', '768 5th Ave, New York', 'Luxury hotel', 'plaza@stayhub.com', '1234567890'),
('LA Grand', 4, 2, 'LAX', '123 LA St, Los Angeles', 'Modern hotel', 'la@stayhub.com', '1234567891'),
('Chicago Downtown', 4, 3, 'ORD', '456 Chicago Ave, Chicago', 'Business hotel', 'chi@stayhub.com', '1234567892'),
('Miami Beach Resort', 5, 4, 'MIA', '789 Ocean Dr, Miami', 'Beachfront resort', 'mia@stayhub.com', '1234567893'),
('SF Bay View', 4, 2, 'SFO', '321 Bay St, SF', 'Scenic views', 'sf@stayhub.com', '1234567894'),
('Vegas Casino Hotel', 4, 9, 'LAS', '654 Strip, Las Vegas', 'Entertainment hub', 'las@stayhub.com', '1234567895'),
('Seattle Space Hotel', 3, 7, 'SEA', '987 Space Rd, Seattle', 'Tech hub hotel', 'sea@stayhub.com', '1234567896'),
('Boston Harbor Inn', 4, 8, 'BOS', '147 Harbor Rd, Boston', 'Historic inn', 'bos@stayhub.com', '1234567897'),
('Austin Live Resort', 3, 5, 'ATX', '258 Music Ln, Austin', 'Vibrant stay', 'atx@stayhub.com', '1234567898'),
('Denver Mountain Lodge', 5, 6, 'DEN', '369 Peak Way, Denver', 'Ski resort', 'den@stayhub.com', '1234567899')
ON CONFLICT DO NOTHING;

-- 4. Room Types
INSERT INTO roomTypes (hotelID, name, size, capacity, base_price, description) VALUES
(1, 'Presidential Suite', 150, 4, 1000, 'Ultimate luxury'),
(2, 'Deluxe Ocean View', 80, 2, 500, 'Beautiful view'),
(3, 'Executive Suite', 100, 3, 400, 'For business leaders'),
(4, 'Beachfront Cabana', 60, 2, 350, 'Right on the sand'),
(5, 'Bay View Double', 70, 4, 300, 'Great for families'),
(6, 'Penthouse', 200, 6, 1200, 'Top floor luxury'),
(7, 'Tech Studio', 45, 2, 200, 'Modern and efficient'),
(8, 'Historic Suite', 90, 2, 450, 'Classic design'),
(9, 'Music Loft', 85, 4, 250, 'Funky and spacious'),
(10, 'Ski Chalet', 120, 5, 600, 'Warm and cozy')
ON CONFLICT DO NOTHING;

-- 5. Rooms
INSERT INTO rooms (hotelID, name, typeID, note) VALUES
(1, '101', 1, 'Near elevator'),
(2, '201', 2, 'Ocean facing'),
(3, '301', 3, 'Quiet zone'),
(4, '401', 4, 'Pool access'),
(5, '501', 5, 'Corner room'),
(6, '601', 6, 'VIP access'),
(7, '701', 7, 'Extra monitors'),
(8, '801', 8, 'Antique bed'),
(9, '901', 9, 'Soundproof'),
(10, '1001', 10, 'Fireplace included')
ON CONFLICT DO NOTHING;

-- 6. Beds
INSERT INTO beds (name) VALUES
('King'), ('Queen'), ('Double'), ('Twin'), ('Single'),
('Sofa Bed'), ('Bunk Bed'), ('Crib'), ('Rollaway'), ('Waterbed')
ON CONFLICT DO NOTHING;

-- 7. Amenities
INSERT INTO amenities (name, icon, category) VALUES
('Free WiFi', 'wifi', 'Internet'),
('Pool', 'pool', 'Recreation'),
('Gym', 'gym', 'Fitness'),
('Spa', 'spa', 'Wellness'),
('Room Service', 'food', 'Dining'),
('Parking', 'parking', 'Transport'),
('Bar', 'bar', 'Dining'),
('Laundry', 'laundry', 'Service'),
('AC', 'ac', 'Comfort'),
('TV', 'tv', 'Entertainment')
ON CONFLICT DO NOTHING;

-- 8. Policies
INSERT INTO policies (name, icon, category, description) VALUES
('No Smoking', 'nosmoking', 'Rules', 'Smoking is strictly prohibited.'),
('Pets Allowed', 'pets', 'Rules', 'Furry friends are welcome.'),
('Late Checkout', 'time', 'Flexibility', 'Checkout extended to 2 PM.'),
('Free Cancellation', 'cancel', 'Booking', 'Cancel up to 24h before.'),
('Adults Only', 'adult', 'Rules', 'Must be 18 or older.'),
('Quiet Hours', 'quiet', 'Rules', '10 PM to 7 AM.'),
('No Parties', 'party', 'Rules', 'Parties are not allowed.'),
('ID Required', 'id', 'Check-in', 'Valid ID needed at check-in.'),
('Deposit Required', 'money', 'Booking', 'Security deposit held.'),
('Eco Friendly', 'eco', 'General', 'Please reuse towels.')
ON CONFLICT DO NOTHING;

-- 9. Users
-- Hash and salt are dummy bytes just to satisfy non-null bytea. 
INSERT INTO users (username, salt, hash, email, firstName, lastName, phoneNumber) VALUES
('user1', decode('00', 'hex'), decode('00', 'hex'), 'user1@test.com', 'Alice', 'Smith', '1111111111'),
('user2', decode('00', 'hex'), decode('00', 'hex'), 'user2@test.com', 'Bob', 'Jones', '2222222222'),
('user3', decode('00', 'hex'), decode('00', 'hex'), 'user3@test.com', 'Charlie', 'Brown', '3333333333'),
('user4', decode('00', 'hex'), decode('00', 'hex'), 'user4@test.com', 'Diana', 'Prince', '4444444444'),
('user5', decode('00', 'hex'), decode('00', 'hex'), 'user5@test.com', 'Ethan', 'Hunt', '5555555555'),
('user6', decode('00', 'hex'), decode('00', 'hex'), 'user6@test.com', 'Fiona', 'Gallagher', '6666666666'),
('user7', decode('00', 'hex'), decode('00', 'hex'), 'user7@test.com', 'George', 'Clooney', '7777777777'),
('user8', decode('00', 'hex'), decode('00', 'hex'), 'user8@test.com', 'Hannah', 'Montana', '8888888888'),
('user9', decode('00', 'hex'), decode('00', 'hex'), 'user9@test.com', 'Ian', 'Somerhalder', '9999999999'),
('user10', decode('00', 'hex'), decode('00', 'hex'), 'user10@test.com', 'Jane', 'Doe', '0000000000')
ON CONFLICT DO NOTHING;

-- 10. Employees
INSERT INTO employees (username, salt, hash, email, firstName, lastName, salary, branchID, hotelID) VALUES
('emp1', decode('00', 'hex'), decode('00', 'hex'), 'emp1@stayhub.com', 'Manager', 'One', 50000, 1, 1),
('emp2', decode('00', 'hex'), decode('00', 'hex'), 'emp2@stayhub.com', 'Staff', 'Two', 30000, 2, 2),
('emp3', decode('00', 'hex'), decode('00', 'hex'), 'emp3@stayhub.com', 'Staff', 'Three', 35000, 3, 3),
('emp4', decode('00', 'hex'), decode('00', 'hex'), 'emp4@stayhub.com', 'Manager', 'Four', 60000, 4, 4),
('emp5', decode('00', 'hex'), decode('00', 'hex'), 'emp5@stayhub.com', 'Staff', 'Five', 32000, 5, 5),
('emp6', decode('00', 'hex'), decode('00', 'hex'), 'emp6@stayhub.com', 'Staff', 'Six', 31000, 6, 6),
('emp7', decode('00', 'hex'), decode('00', 'hex'), 'emp7@stayhub.com', 'Manager', 'Seven', 55000, 7, 7),
('emp8', decode('00', 'hex'), decode('00', 'hex'), 'emp8@stayhub.com', 'Staff', 'Eight', 33000, 8, 8),
('emp9', decode('00', 'hex'), decode('00', 'hex'), 'emp9@stayhub.com', 'Staff', 'Nine', 34000, 9, 9),
('emp10', decode('00', 'hex'), decode('00', 'hex'), 'emp10@stayhub.com', 'Manager', 'Ten', 65000, 10, 10)
ON CONFLICT DO NOTHING;

-- 11. Guests
INSERT INTO guests (hotelID, first_name, last_name, email, phone) VALUES
(1, 'Guest', 'One', 'guest1@mail.com', '1231231234'),
(2, 'Guest', 'Two', 'guest2@mail.com', '2342342345'),
(3, 'Guest', 'Three', 'guest3@mail.com', '3453453456'),
(4, 'Guest', 'Four', 'guest4@mail.com', '4564564567'),
(5, 'Guest', 'Five', 'guest5@mail.com', '5675675678'),
(6, 'Guest', 'Six', 'guest6@mail.com', '6786786789'),
(7, 'Guest', 'Seven', 'guest7@mail.com', '7897897890'),
(8, 'Guest', 'Eight', 'guest8@mail.com', '8908908901'),
(9, 'Guest', 'Nine', 'guest9@mail.com', '9019019012'),
(10, 'Guest', 'Ten', 'guest10@mail.com', '0120120123')
ON CONFLICT DO NOTHING;

-- 12. Reserves
INSERT INTO reserves (userID, guestID, status) VALUES
(1, 1, 'Confirmed'),
(2, 2, 'Pending'),
(3, 3, 'Confirmed'),
(4, 4, 'Cancelled'),
(5, 5, 'Confirmed'),
(6, 6, 'Pending'),
(7, 7, 'Confirmed'),
(8, 8, 'Confirmed'),
(9, 9, 'Cancelled'),
(10, 10, 'Pending')
ON CONFLICT DO NOTHING;

-- 13. Reserved Rooms
INSERT INTO reserved_room (reserveID, hotelID, roomTypeID, roomID, confirmation_code, checkin_date, checkout_date, final_price) VALUES
(1, 1, 1, 1, 'CONF001', CURRENT_DATE, CURRENT_DATE + 3, 3000),
(2, 2, 2, 2, 'CONF002', CURRENT_DATE + 5, CURRENT_DATE + 8, 1500),
(3, 3, 3, 3, 'CONF003', CURRENT_DATE + 1, CURRENT_DATE + 4, 1200),
(4, 4, 4, 4, 'CONF004', CURRENT_DATE + 10, CURRENT_DATE + 15, 1750),
(5, 5, 5, 5, 'CONF005', CURRENT_DATE, CURRENT_DATE + 2, 600),
(6, 6, 6, 6, 'CONF006', CURRENT_DATE + 20, CURRENT_DATE + 22, 2400),
(7, 7, 7, 7, 'CONF007', CURRENT_DATE + 2, CURRENT_DATE + 5, 600),
(8, 8, 8, 8, 'CONF008', CURRENT_DATE, CURRENT_DATE + 1, 450),
(9, 9, 9, 9, 'CONF009', CURRENT_DATE + 30, CURRENT_DATE + 35, 1250),
(10, 10, 10, 10, 'CONF010', CURRENT_DATE + 15, CURRENT_DATE + 20, 3000)
ON CONFLICT DO NOTHING;

-- 14. Booking
INSERT INTO booking (guestID, hotelID, reserveID, booking_status) VALUES
(1, 1, 1, 'Checked-In'),
(2, 2, 2, 'Confirmed'),
(3, 3, 3, 'Checked-In'),
(4, 4, 4, 'Cancelled'),
(5, 5, 5, 'Checked-In'),
(6, 6, 6, 'Confirmed'),
(7, 7, 7, 'Checked-Out'),
(8, 8, 8, 'Checked-Out'),
(9, 9, 9, 'Cancelled'),
(10, 10, 10, 'Confirmed')
ON CONFLICT DO NOTHING;

-- 15. Booked Room
INSERT INTO booked_room (bookingID, roomID, checkin_date, checkout_date, room_status, room_price) VALUES
(1, 1, CURRENT_DATE, CURRENT_DATE + 3, 'Checked-In', 1000),
(2, 2, CURRENT_DATE + 5, CURRENT_DATE + 8, 'Reserved', 500),
(3, 3, CURRENT_DATE + 1, CURRENT_DATE + 4, 'Checked-In', 400),
(4, 4, CURRENT_DATE + 10, CURRENT_DATE + 15, 'Cancelled', 350),
(5, 5, CURRENT_DATE, CURRENT_DATE + 2, 'Checked-In', 300),
(6, 6, CURRENT_DATE + 20, CURRENT_DATE + 22, 'Reserved', 1200),
(7, 7, CURRENT_DATE - 5, CURRENT_DATE - 2, 'Checked-Out', 200),
(8, 8, CURRENT_DATE - 2, CURRENT_DATE - 1, 'Checked-Out', 450),
(9, 9, CURRENT_DATE + 30, CURRENT_DATE + 35, 'Cancelled', 250),
(10, 10, CURRENT_DATE + 15, CURRENT_DATE + 20, 'Reserved', 600)
ON CONFLICT DO NOTHING;

-- 16. Services
INSERT INTO services (hotelID, type, name, price) VALUES
(1, 'Dining', 'Breakfast Buffet', 50),
(2, 'Wellness', 'Massage 60min', 120),
(3, 'Transport', 'Airport Shuttle', 40),
(4, 'Recreation', 'Jet Ski Rental', 150),
(5, 'Service', 'Laundry Express', 30),
(6, 'Entertainment', 'Casino Chips', 100),
(7, 'Business', 'Meeting Room', 200),
(8, 'Dining', 'Dinner for Two', 150),
(9, 'Entertainment', 'Live Music Ticket', 75),
(10, 'Recreation', 'Ski Pass', 100)
ON CONFLICT DO NOTHING;

-- 17. Reviews
INSERT INTO reviews (userID, roomID, rating, description) VALUES
(1, 1, 5, 'Amazing stay, very luxurious!'),
(2, 2, 4, 'Great view, but a bit pricey.'),
(3, 3, 5, 'Perfect for my business trip.'),
(4, 4, 3, 'Pool was crowded.'),
(5, 5, 4, 'Nice family room.'),
(6, 6, 5, 'Unbelievable experience!'),
(7, 7, 4, 'Fast wifi, good tech setup.'),
(8, 8, 5, 'Loved the historic vibe.'),
(9, 9, 4, 'Cool area, nice loft.'),
(10, 10, 5, 'Best ski trip ever!')
ON CONFLICT DO NOTHING;

-- 18. Top Sights
INSERT INTO top_sights (name, flag_icon, image) VALUES
('Statue of Liberty', '🗽', 'liberty.jpg'),
('Hollywood Sign', '🎬', 'hollywood.jpg'),
('Willis Tower', '🏢', 'willis.jpg'),
('South Beach', '🏖️', 'southbeach.jpg'),
('Golden Gate Bridge', '🌉', 'goldengate.jpg'),
('Las Vegas Strip', '🎰', 'strip.jpg'),
('Space Needle', '🗼', 'needle.jpg'),
('Fenway Park', '⚾', 'fenway.jpg'),
('Texas State Capitol', '🏛️', 'capitol.jpg'),
('Red Rocks', '⛰️', 'redrocks.jpg')
ON CONFLICT DO NOTHING;

-- 19. Things To Do
INSERT INTO things_to_do (name, category, image) VALUES
('City Tour', 'Tour', 'tour.jpg'),
('Wine Tasting', 'Food', 'wine.jpg'),
('Scuba Diving', 'Adventure', 'scuba.jpg'),
('Museum Visit', 'Culture', 'museum.jpg'),
('Helicopter Ride', 'Tour', 'heli.jpg'),
('Cooking Class', 'Food', 'cooking.jpg'),
('Hiking', 'Adventure', 'hiking.jpg'),
('Theater Show', 'Culture', 'theater.jpg'),
('Boat Cruise', 'Tour', 'boat.jpg'),
('Theme Park', 'Entertainment', 'park.jpg')
ON CONFLICT DO NOTHING;

-- 20. Destinations
INSERT INTO destinations (name, category, price, image) VALUES
('Paris', 'International', 1500, 'paris.jpg'),
('Tokyo', 'International', 2000, 'tokyo.jpg'),
('Rome', 'International', 1600, 'rome.jpg'),
('London', 'International', 1800, 'london.jpg'),
('Dubai', 'International', 2200, 'dubai.jpg'),
('Bali', 'Tropical', 1200, 'bali.jpg'),
('Cancun', 'Tropical', 1000, 'cancun.jpg'),
('Sydney', 'International', 2500, 'sydney.jpg'),
('Cape Town', 'International', 1900, 'capetown.jpg'),
('Rio de Janeiro', 'International', 1700, 'rio.jpg')
ON CONFLICT DO NOTHING;

-- 21. Deals
INSERT INTO deals (roomTypeID, price_discount, startDate, endDate, name) VALUES
(1, 200, CURRENT_DATE, CURRENT_DATE + 30, 'Summer Special'),
(2, 100, CURRENT_DATE, CURRENT_DATE + 30, 'Ocean Promo'),
(3, 50, CURRENT_DATE, CURRENT_DATE + 15, 'Business Deal'),
(4, 75, CURRENT_DATE, CURRENT_DATE + 20, 'Beach Getaway'),
(5, 60, CURRENT_DATE, CURRENT_DATE + 10, 'Family Pack'),
(6, 300, CURRENT_DATE, CURRENT_DATE + 45, 'Luxury Upgrade'),
(7, 40, CURRENT_DATE, CURRENT_DATE + 14, 'Tech Worker Discount'),
(8, 80, CURRENT_DATE, CURRENT_DATE + 25, 'Historic Tour Deal'),
(9, 45, CURRENT_DATE, CURRENT_DATE + 12, 'Music Festival Rate'),
(10, 150, CURRENT_DATE, CURRENT_DATE + 60, 'Early Bird Ski')
ON CONFLICT DO NOTHING;