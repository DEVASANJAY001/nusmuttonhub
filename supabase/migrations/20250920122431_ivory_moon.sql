@@ .. @@
 -- Row Level Security (RLS) Policies

 -- Enable RLS on all tables
 ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
@@ .. @@
 ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
 ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

+-- Create a security definer function to check if user is owner
+-- This prevents infinite recursion in RLS policies
+CREATE OR REPLACE FUNCTION is_owner()
+RETURNS BOOLEAN AS $$
+BEGIN
+    RETURN EXISTS (
+        SELECT 1 FROM user_roles 
+        WHERE user_id = auth.uid() AND role = 'owner'
+    );
+END;
+$$ LANGUAGE plpgsql SECURITY DEFINER;
+
+-- Drop existing recursive policies
+DROP POLICY IF EXISTS "Owners can view all roles" ON user_roles;
+DROP POLICY IF EXISTS "Owners can manage roles" ON user_roles;
+DROP POLICY IF EXISTS "Admins and owners can manage buyers" ON buyers;
+DROP POLICY IF EXISTS "Admins and owners can manage sellers" ON sellers;
+DROP POLICY IF EXISTS "Accountants, admins and owners can manage buyer transactions" ON buyer_transactions;
+DROP POLICY IF EXISTS "Accountants, admins and owners can manage seller transactions" ON seller_transactions;
+DROP POLICY IF EXISTS "Only owners can view audit logs" ON audit_logs;
+DROP POLICY IF EXISTS "Only owners can view login logs" ON login_logs;
+
 -- User roles policies
 CREATE POLICY "Users can view their own role" ON user_roles
     FOR SELECT USING (auth.uid() = user_id);

-CREATE POLICY "Owners can view all roles" ON user_roles
-    FOR SELECT USING (
-        EXISTS (
-            SELECT 1 FROM user_roles 
-            WHERE user_id = auth.uid() AND role = 'owner'
-        )
-    );
-
-CREATE POLICY "Owners can manage roles" ON user_roles
-    FOR ALL USING (
-        EXISTS (
-            SELECT 1 FROM user_roles 
-            WHERE user_id = auth.uid() AND role = 'owner'
-        )
-    );
+CREATE POLICY "Owners can view all roles" ON user_roles
+    FOR SELECT USING (is_owner());
+
+CREATE POLICY "Owners can manage roles" ON user_roles
+    FOR ALL USING (is_owner());

 -- Buyers policies
 CREATE POLICY "Authenticated users can view buyers" ON buyers
@@ .. @@
     FOR SELECT USING (auth.role() = 'authenticated');

-CREATE POLICY "Admins and owners can manage buyers" ON buyers
-    FOR ALL USING (
-        EXISTS (
-            SELECT 1 FROM user_roles 
-            WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
-        )
-    );
+CREATE POLICY "Admins and owners can manage buyers" ON buyers
+    FOR ALL USING (
+        EXISTS (
+            SELECT 1 FROM user_roles 
+            WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
+        ) OR is_owner()
+    );

 -- Sellers policies
 CREATE POLICY "Authenticated users can view sellers" ON sellers
@@ .. @@
     FOR SELECT USING (auth.role() = 'authenticated');

-CREATE POLICY "Admins and owners can manage sellers" ON sellers
-    FOR ALL USING (
-        EXISTS (
-            SELECT 1 FROM user_roles 
-            WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
-        )
-    );
+CREATE POLICY "Admins and owners can manage sellers" ON sellers
+    FOR ALL USING (
+        EXISTS (
+            SELECT 1 FROM user_roles 
+            WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
+        ) OR is_owner()
+    );

 -- Buyer transactions policies
 CREATE POLICY "Authenticated users can view buyer transactions" ON buyer_transactions
@@ .. @@
     FOR SELECT USING (auth.role() = 'authenticated');

-CREATE POLICY "Accountants, admins and owners can manage buyer transactions" ON buyer_transactions
-    FOR ALL USING (
-        EXISTS (
-            SELECT 1 FROM user_roles 
-            WHERE user_id = auth.uid() AND role IN ('accountant', 'admin', 'owner')
-        )
-    );
+CREATE POLICY "Accountants, admins and owners can manage buyer transactions" ON buyer_transactions
+    FOR ALL USING (
+        EXISTS (
+            SELECT 1 FROM user_roles 
+            WHERE user_id = auth.uid() AND role IN ('accountant', 'admin', 'owner')
+        ) OR is_owner()
+    );

 -- Seller transactions policies
 CREATE POLICY "Authenticated users can view seller transactions" ON seller_transactions
@@ .. @@
     FOR SELECT USING (auth.role() = 'authenticated');

-CREATE POLICY "Accountants, admins and owners can manage seller transactions" ON seller_transactions
-    FOR ALL USING (
-        EXISTS (
-            SELECT 1 FROM user_roles 
-            WHERE user_id = auth.uid() AND role IN ('accountant', 'admin', 'owner')
-        )
-    );
+CREATE POLICY "Accountants, admins and owners can manage seller transactions" ON seller_transactions
+    FOR ALL USING (
+        EXISTS (
+            SELECT 1 FROM user_roles 
+            WHERE user_id = auth.uid() AND role IN ('accountant', 'admin', 'owner')
+        ) OR is_owner()
+    );

 -- Audit logs policies (only owners can view)
-CREATE POLICY "Only owners can view audit logs" ON audit_logs
-    FOR SELECT USING (
-        EXISTS (
-            SELECT 1 FROM user_roles 
-            WHERE user_id = auth.uid() AND role = 'owner'
-        )
-    );
+CREATE POLICY "Only owners can view audit logs" ON audit_logs
+    FOR SELECT USING (is_owner());

 CREATE POLICY "System can insert audit logs" ON audit_logs
@@ .. @@
     FOR INSERT WITH CHECK (true);

 -- Login logs policies (only owners can view)
-CREATE POLICY "Only owners can view login logs" ON login_logs
-    FOR SELECT USING (
-        EXISTS (
-            SELECT 1 FROM user_roles 
-            WHERE user_id = auth.uid() AND role = 'owner'
-        )
-    );
+CREATE POLICY "Only owners can view login logs" ON login_logs
+    FOR SELECT USING (is_owner());

 CREATE POLICY "System can insert login logs" ON login_logs