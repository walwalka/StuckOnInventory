-- Migration: Seed reference data
-- Description: Populate lookup tables with initial reference data
-- Created: 2024-12-28

-- Seed mint locations
INSERT INTO mintlocations (name, city, state) VALUES
  ('Philadelphia Mint', 'Philadelphia', 'Pennsylvania'),
  ('Denver Mint', 'Denver', 'Colorado'),
  ('San Francisco Mint', 'San Francisco', 'California'),
  ('West Point Mint', 'West Point', 'New York'),
  ('Carson City Mint', 'Carson City', 'Nevada'),
  ('New Orleans Mint', 'New Orleans', 'Louisiana'),
  ('Charlotte Mint', 'Charlotte', 'North Carolina'),
  ('Dahlonega Mint', 'Dahlonega', 'Georgia'),
  ('Manila Mint', 'Manila', 'Philippines')
ON CONFLICT (name) DO UPDATE SET
  city = EXCLUDED.city,
  state = EXCLUDED.state;

-- Seed coin types
INSERT INTO cointypes (name, face_value) VALUES
  ('Penny', 0.01),
  ('Nickel', 0.05),
  ('Dime', 0.10),
  ('Quarter', 0.25),
  ('Half Dollar', 0.50),
  ('Dollar', 1.00),
  ('Susan B. Anthony Dollar', 1.00),
  ('Sacagawea Dollar', 1.00),
  ('Presidential Dollar', 1.00),
  ('Half Cent', 0.005),
  ('Large Cent', 0.01),
  ('Two Cent', 0.02),
  ('Three Cent (Silver)', 0.03),
  ('Three Cent (Nickel)', 0.03),
  ('Half Dime', 0.05),
  ('Twenty Cent', 0.20),
  ('Quarter Dollar', 0.25),
  ('Half Dollar (Historic)', 0.50),
  ('Silver Dollar', 1.00),
  ('Trade Dollar', 1.00),
  ('Gold Dollar', 1.00),
  ('Quarter Eagle', 2.50),
  ('Three Dollar Gold', 3.00),
  ('Four Dollar (Stella)', 4.00),
  ('Half Eagle', 5.00),
  ('Eagle', 10.00),
  ('Double Eagle', 20.00),
  ('Panama-Pacific $50 Gold', 50.00),
  ('American Silver Eagle', 1.00),
  ('American Gold Eagle $5', 5.00),
  ('American Gold Eagle $10', 10.00),
  ('American Gold Eagle $25', 25.00),
  ('American Gold Eagle $50', 50.00),
  ('American Platinum Eagle $10', 10.00),
  ('American Platinum Eagle $25', 25.00),
  ('American Platinum Eagle $50', 50.00),
  ('American Platinum Eagle $100', 100.00),
  ('American Palladium Eagle $25', 25.00),
  ('American Buffalo Gold $50', 50.00),
  ('American Liberty $100', 100.00)
ON CONFLICT (name) DO UPDATE SET
  face_value = EXCLUDED.face_value;

-- Seed relic types
INSERT INTO relictypes (name) VALUES
  ('Arrowhead'),
  ('Pottery'),
  ('Tool'),
  ('Jewelry'),
  ('Weapon'),
  ('Other')
ON CONFLICT (name) DO NOTHING;

-- Seed comic publishers
INSERT INTO comicpublishers (name) VALUES
  ('Marvel'),
  ('DC Comics'),
  ('Image Comics'),
  ('Dark Horse'),
  ('IDW Publishing'),
  ('Boom! Studios'),
  ('Valiant'),
  ('Archie Comics'),
  ('Other')
ON CONFLICT (name) DO NOTHING;
