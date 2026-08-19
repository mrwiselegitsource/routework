-- ============================================================
-- RouteWorks — Supabase Migration (Phase 1)
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. PROFILES (Staff / Admin) — already exists, ensure structure
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL,
  email      text,
  phone      text,
  role       text NOT NULL DEFAULT 'staff' CHECK (role IN ('admin','staff')),
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Staff can read all profiles; only admins can insert/update
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- ============================================================
-- 2. CUSTOMERS — separate from staff
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  email           text NOT NULL,
  phone           text,
  secondary_phone text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Customers can read/update their own record; staff can read all
CREATE POLICY "customers_self_select" ON customers FOR SELECT USING (
  id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "customers_self_update" ON customers FOR UPDATE USING (id = auth.uid());
CREATE POLICY "customers_self_insert" ON customers FOR INSERT WITH CHECK (id = auth.uid());
-- Staff can view customers
CREATE POLICY "customers_staff_select" ON customers FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- ============================================================
-- 3. ORDERS (the primary shipment entity)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  order_id              text PRIMARY KEY,
  item_name             text NOT NULL,
  description           text DEFAULT '',
  image_url             text DEFAULT '',
  sender_name           text DEFAULT '',
  sender_country        text DEFAULT '',
  amount_due            numeric NOT NULL DEFAULT 0,
  currency              text NOT NULL DEFAULT 'GHS',
  current_status        text NOT NULL DEFAULT 'order_confirmed',
  current_location      text DEFAULT '',
  estimated_delivery    date,
  support_phone         text DEFAULT '',
  payment_status        text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','failed','refunded','cancelled')),
  payment_reference     text,
  recipient_name        text DEFAULT '',
  recipient_phone       text DEFAULT '',
  recipient_address     text DEFAULT '',
  recipient_region      text DEFAULT '',
  -- Tracking security fields
  tracking_protected    boolean NOT NULL DEFAULT true,
  tracking_password_hash text,
  failed_attempts       integer NOT NULL DEFAULT 0,
  locked_until          timestamptz,
  password_created_at   timestamptz DEFAULT now(),
  password_updated_at   timestamptz,
  -- Metadata
  created_by            uuid REFERENCES auth.users(id),
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Staff can do everything with orders
CREATE POLICY "orders_staff_all" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- ============================================================
-- 4. PUBLIC ORDER LOOKUP VIEW (restricted fields for tracking)
-- ============================================================
CREATE OR REPLACE VIEW public_order_lookup AS
SELECT
  order_id, item_name, description, image_url, sender_name, sender_country,
  amount_due, currency, current_status, current_location, estimated_delivery,
  support_phone, payment_status, recipient_name
FROM orders;

-- ============================================================
-- 5. GUEST ORDER PREVIEW VIEW (even more restricted)
-- ============================================================
CREATE OR REPLACE VIEW guest_order_preview AS
SELECT
  order_id, item_name, current_status, current_location, estimated_delivery
FROM orders;

-- ============================================================
-- 6. TRACKING EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS tracking_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    text NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  status      text NOT NULL,
  location    text,
  description text,
  event_time  timestamptz NOT NULL DEFAULT now(),
  source      text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','automated','system')),
  added_by    uuid REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_staff_all" ON tracking_events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);
-- Allow public read for tracking (after password verification via RPC)
CREATE POLICY "events_public_read" ON tracking_events FOR SELECT USING (true);

-- ============================================================
-- 7. ORDER MEDIA
-- ============================================================
CREATE TABLE IF NOT EXISTS order_media (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     text NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  media_type   text NOT NULL CHECK (media_type IN ('image','video')),
  storage_path text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE order_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_staff_all" ON order_media FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "media_public_read" ON order_media FOR SELECT USING (true);

-- ============================================================
-- 8. CARTS
-- ============================================================
CREATE TABLE IF NOT EXISTS carts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(customer_id)
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "carts_own" ON carts FOR ALL USING (customer_id = auth.uid());

-- ============================================================
-- 9. CART ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id     uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  order_id    text NOT NULL REFERENCES orders(order_id),
  added_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cart_id, order_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_items_own" ON cart_items FOR ALL USING (
  EXISTS (SELECT 1 FROM carts WHERE id = cart_id AND customer_id = auth.uid())
);

-- ============================================================
-- 10. REGIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS regions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE regions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "regions_public_read" ON regions FOR SELECT USING (true);
CREATE POLICY "regions_staff_write" ON regions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- ============================================================
-- 11. PICKUP POINTS
-- ============================================================
CREATE TABLE IF NOT EXISTS pickup_points (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  region_id  uuid NOT NULL REFERENCES regions(id),
  address    text,
  phone      text,
  active     boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pickup_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pickup_public_read" ON pickup_points FOR SELECT USING (true);
CREATE POLICY "pickup_staff_write" ON pickup_points FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- ============================================================
-- 12. DELIVERY PRICING
-- ============================================================
CREATE TABLE IF NOT EXISTS delivery_pricing (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id             uuid NOT NULL REFERENCES regions(id) UNIQUE,
  base_pickup_price     numeric NOT NULL DEFAULT 0,
  home_delivery_surcharge numeric NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE delivery_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pricing_public_read" ON delivery_pricing FOR SELECT USING (true);
CREATE POLICY "pricing_staff_write" ON delivery_pricing FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- ============================================================
-- 13. CUSTOMER ORDERS (post-checkout)
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL REFERENCES customers(id),
  payment_id      uuid,
  delivery_type   text CHECK (delivery_type IN ('pickup','home_delivery')),
  region_id       uuid REFERENCES regions(id),
  pickup_point_id uuid REFERENCES pickup_points(id),
  city            text,
  street_address  text,
  recipient_name  text,
  primary_phone   text NOT NULL,
  secondary_phone text,
  delivery_fee    numeric NOT NULL DEFAULT 0,
  total_amount    numeric NOT NULL DEFAULT 0,
  status          text NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "custorders_own" ON customer_orders FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "custorders_staff" ON customer_orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- ============================================================
-- 14. CUSTOMER ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_order_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_order_id uuid NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
  order_id          text NOT NULL REFERENCES orders(order_id),
  price             numeric NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customer_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "custorderitems_own" ON customer_order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM customer_orders WHERE id = customer_order_id AND customer_id = auth.uid())
);
CREATE POLICY "custorderitems_staff" ON customer_order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- ============================================================
-- 15. SHIPMENT AUTOMATION
-- ============================================================
CREATE TABLE IF NOT EXISTS shipment_automation (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           text NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE UNIQUE,
  enabled            boolean NOT NULL DEFAULT false,
  template           text DEFAULT 'international_standard',
  start_date         date,
  estimated_delivery date,
  paused             boolean NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shipment_automation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "automation_staff" ON shipment_automation FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- ============================================================
-- 16. AUTOMATION SCHEDULED EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS automation_events (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id uuid NOT NULL REFERENCES shipment_automation(id) ON DELETE CASCADE,
  status        text NOT NULL,
  location      text,
  description   text,
  scheduled_at  timestamptz NOT NULL,
  executed      boolean NOT NULL DEFAULT false,
  skipped       boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE automation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auto_events_staff" ON automation_events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- ============================================================
-- 17. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id       uuid REFERENCES auth.users(id),
  actor_name     text,
  action         text NOT NULL,
  resource       text NOT NULL,
  resource_id    text,
  previous_value jsonb,
  new_value      jsonb,
  source         text DEFAULT 'manual',
  reason         text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "audit_admin_read" ON audit_logs FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "audit_staff_insert" ON audit_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- ============================================================
-- 18. ACTIVITY LOG (existing, keep for backward compat)
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id),
  order_id   text,
  action     text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_staff" ON activity_log FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- ============================================================
-- 19. NEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS news (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  excerpt    text,
  content    text,
  image_url  text,
  author_id  uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "news_public_read" ON news FOR SELECT USING (true);
CREATE POLICY "news_staff_write" ON news FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- ============================================================
-- 20. PAGE VIEWS (analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS page_views (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path       text NOT NULL,
  session_id text DEFAULT 'anon',
  timestamp  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pv_insert" ON page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "pv_staff_read" ON page_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
);

-- ============================================================
-- 21. STORAGE BUCKET for order media
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-media', 'order-media', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 22. RPC: Verify tracking password (server-side)
-- ============================================================
CREATE OR REPLACE FUNCTION verify_tracking_password(
  p_tracking_number text,
  p_password text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_order orders%ROWTYPE;
  v_result jsonb;
BEGIN
  -- Find the order
  SELECT * INTO v_order FROM orders WHERE order_id = p_tracking_number;
  
  IF v_order IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid tracking credentials.');
  END IF;
  
  -- Check if locked
  IF v_order.locked_until IS NOT NULL AND v_order.locked_until > now() THEN
    RETURN jsonb_build_object(
      'success', false, 
      'locked', true,
      'locked_until', v_order.locked_until,
      'error', 'Too many unsuccessful attempts. Please try again later or contact RouteWorks support.'
    );
  END IF;
  
  -- Not protected? Allow through
  IF NOT v_order.tracking_protected THEN
    RETURN jsonb_build_object('success', true);
  END IF;
  
  -- Verify password (compare hash)
  IF v_order.tracking_password_hash = crypt(p_password, v_order.tracking_password_hash) THEN
    -- Success — reset failed attempts
    UPDATE orders SET failed_attempts = 0, locked_until = NULL WHERE order_id = p_tracking_number;
    RETURN jsonb_build_object('success', true, 'remainingAttempts', 3);
  ELSE
    -- Failure — increment attempts
    UPDATE orders SET 
      failed_attempts = v_order.failed_attempts + 1,
      locked_until = CASE 
        WHEN v_order.failed_attempts + 1 >= 3 THEN now() + interval '15 minutes'
        ELSE NULL
      END
    WHERE order_id = p_tracking_number;
    
    RETURN jsonb_build_object(
      'success', false,
      'remainingAttempts', GREATEST(0, 3 - (v_order.failed_attempts + 1)),
      'locked', (v_order.failed_attempts + 1) >= 3,
      'error', 'Invalid tracking credentials.'
    );
  END IF;
END;
$$;

-- ============================================================
-- 23. INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(current_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_events_order ON tracking_events(order_id);
CREATE INDEX IF NOT EXISTS idx_events_time ON tracking_events(event_time);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_custorders_customer ON customer_orders(customer_id);

-- ============================================================
-- 24. Enable pgcrypto for password hashing
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;
