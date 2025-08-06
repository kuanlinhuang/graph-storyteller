-- Create network_counter table for global counter
CREATE TABLE IF NOT EXISTS network_counter (
  id TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial global counter if it doesn't exist
INSERT INTO network_counter (id, count) 
VALUES ('global', 0) 
ON CONFLICT (id) DO NOTHING;

-- Create function to increment network counter atomically
CREATE OR REPLACE FUNCTION increment_network_counter()
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE network_counter 
  SET count = count + 1, updated_at = NOW()
  WHERE id = 'global'
  RETURNING count INTO new_count;
  
  -- If no row was updated, insert a new one
  IF new_count IS NULL THEN
    INSERT INTO network_counter (id, count) 
    VALUES ('global', 1)
    RETURNING count INTO new_count;
  END IF;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security
ALTER TABLE network_counter ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to the global counter
CREATE POLICY "Allow public read access to global counter" ON network_counter
  FOR SELECT USING (id = 'global');

-- Create policy to allow public update access to the global counter
CREATE POLICY "Allow public update access to global counter" ON network_counter
  FOR UPDATE USING (id = 'global');