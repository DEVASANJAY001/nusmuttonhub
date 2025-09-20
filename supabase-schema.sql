-- Mutton Wholesale Management System Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create custom types
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'accountant');
CREATE TYPE payment_mode AS ENUM ('cash', 'upi', 'bank_transfer');

-- User roles table
CREATE TABLE user_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'accountant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Buyers table
CREATE TABLE buyers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sellers table
CREATE TABLE sellers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buyer transactions table
CREATE TABLE buyer_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID REFERENCES buyers(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    number_of_goats INTEGER NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    remaining_balance DECIMAL(12,2) NOT NULL,
    payment_mode payment_mode NOT NULL DEFAULT 'cash',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seller transactions table
CREATE TABLE seller_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_weight DECIMAL(8,2) NOT NULL,
    price_per_kg DECIMAL(8,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    remaining_balance DECIMAL(12,2) NOT NULL,
    payment_mode payment_mode NOT NULL DEFAULT 'cash',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action VARCHAR(20) NOT NULL, -- CREATE, UPDATE, DELETE
    table_name VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Login logs table (for tracking last login details)
CREATE TABLE login_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_buyer_transactions_buyer_id ON buyer_transactions(buyer_id);
CREATE INDEX idx_buyer_transactions_entry_date ON buyer_transactions(entry_date);
CREATE INDEX idx_seller_transactions_seller_id ON seller_transactions(seller_id);
CREATE INDEX idx_seller_transactions_entry_date ON seller_transactions(entry_date);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX idx_login_logs_login_time ON login_logs(login_time);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own role" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Owners can view all roles" ON user_roles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "Owners can manage roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

-- Buyers policies
CREATE POLICY "Authenticated users can view buyers" ON buyers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and owners can manage buyers" ON buyers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Sellers policies
CREATE POLICY "Authenticated users can view sellers" ON sellers
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and owners can manage sellers" ON sellers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Buyer transactions policies
CREATE POLICY "Authenticated users can view buyer transactions" ON buyer_transactions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Accountants, admins and owners can manage buyer transactions" ON buyer_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role IN ('accountant', 'admin', 'owner')
        )
    );

-- Seller transactions policies
CREATE POLICY "Authenticated users can view seller transactions" ON seller_transactions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Accountants, admins and owners can manage seller transactions" ON seller_transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role IN ('accountant', 'admin', 'owner')
        )
    );

-- Audit logs policies (only owners can view)
CREATE POLICY "Only owners can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Login logs policies (only owners can view)
CREATE POLICY "Only owners can view login logs" ON login_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() AND role = 'owner'
        )
    );

CREATE POLICY "System can insert login logs" ON login_logs
    FOR INSERT WITH CHECK (true);

-- Functions for automatic updates

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyer_transactions_updated_at BEFORE UPDATE ON buyer_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seller_transactions_updated_at BEFORE UPDATE ON seller_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user role on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'accountant');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user role on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to log user logins
CREATE OR REPLACE FUNCTION log_user_login()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO login_logs (user_id, ip_address, user_agent)
    VALUES (NEW.id, inet_client_addr(), current_setting('request.headers', true)::json->>'user-agent');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data (optional - remove in production)
-- Insert sample buyers
INSERT INTO buyers (name, phone, address) VALUES
('John Doe', '+1234567890', '123 Main St, City'),
('Jane Smith', '+0987654321', '456 Oak Ave, Town');

-- Insert sample sellers
INSERT INTO sellers (name, phone, address) VALUES
('Bob Johnson', '+1122334455', '789 Pine St, Village'),
('Alice Brown', '+5566778899', '321 Elm St, County');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
