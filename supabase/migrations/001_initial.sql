-- TurfNow schema for Supabase (Postgres + Auth)
-- Run via Supabase SQL editor or: supabase db push

CREATE TABLE IF NOT EXISTS public.turfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport text NOT NULL CHECK (sport IN ('football', 'cricket', 'basketball', 'badminton')),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  image text NOT NULL DEFAULT '',
  price_per_hour numeric NOT NULL,
  facilities jsonb NOT NULL DEFAULT '[]'::jsonb,
  size text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  owner_id text NOT NULL DEFAULT '',
  available boolean NOT NULL DEFAULT true,
  rating numeric NOT NULL DEFAULT 0,
  total_reviews integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_turfs_sport ON public.turfs (sport);
CREATE INDEX IF NOT EXISTS idx_turfs_city ON public.turfs (city);
CREATE INDEX IF NOT EXISTS idx_turfs_owner_id ON public.turfs (owner_id);

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport text NOT NULL CHECK (sport IN ('football', 'cricket', 'basketball', 'badminton')),
  turf_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  user_email text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_turf ON public.reviews (sport, turf_id);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  email text,
  turf_name text NOT NULL,
  turf_image text NOT NULL DEFAULT '',
  turf_address text NOT NULL DEFAULT '',
  turf_price numeric NOT NULL DEFAULT 0,
  sport text NOT NULL,
  time text NOT NULL,
  booking_date text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  cancelled_at timestamptz,
  updated_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_turf_date ON public.bookings (turf_name, booking_date);

CREATE TABLE IF NOT EXISTS public.owner_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  business_name text NOT NULL,
  business_address text NOT NULL,
  city text NOT NULL,
  sport_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid,
  rejected_at timestamptz,
  rejected_by uuid,
  rejection_reason text,
  turfs jsonb NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.turfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner_profiles ENABLE ROW LEVEL SECURITY;

-- API uses service role / direct Postgres connection (bypasses RLS).
-- Optional anon policies for future client-side reads can be added later.
