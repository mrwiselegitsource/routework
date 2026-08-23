CREATE TABLE IF NOT EXISTS customer_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    order_id TEXT REFERENCES orders(order_id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'system',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customer_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can read their own messages
CREATE POLICY "Customers can read own messages" 
ON customer_messages FOR SELECT 
TO authenticated 
USING (auth.uid() = customer_id);

-- Policy: Admins can do anything
CREATE POLICY "Admins have full access to messages" 
ON customer_messages FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Insert into realtime publications if we want realtime messaging
ALTER PUBLICATION supabase_realtime ADD TABLE customer_messages;
