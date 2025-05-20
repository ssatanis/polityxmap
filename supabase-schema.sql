-- PolityxMap Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up the database structure

-- Create the proposals table
CREATE TABLE IF NOT EXISTS public.proposals (
    id BIGSERIAL PRIMARY KEY,
    slug TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT DEFAULT 'United States',
    healthcareIssue TEXT NOT NULL,
    description TEXT,
    proposalText TEXT,
    background TEXT,
    policy TEXT,
    stakeholders TEXT,
    costs TEXT,
    metrics TEXT,
    timeline TEXT,
    imageLink TEXT,
    authorName TEXT DEFAULT 'Anonymous',
    authorEmail TEXT,
    authorInstitution TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Generate slug from city if not provided
CREATE OR REPLACE FUNCTION public.generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := lower(regexp_replace(NEW.city, '[^a-zA-Z0-9]', '-', 'g'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to auto-generate slug before insert if not provided
DROP TRIGGER IF EXISTS ensure_proposal_has_slug ON public.proposals;
CREATE TRIGGER ensure_proposal_has_slug
BEFORE INSERT ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.generate_slug();

-- Create index for searching by slug
CREATE INDEX IF NOT EXISTS idx_proposals_slug ON public.proposals (slug);

-- Create index for sorting by creation date
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals (created_at DESC);

-- Set up RLS (Row Level Security) policies
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read proposals (public data)
CREATE POLICY "Allow public read access to proposals" 
ON public.proposals FOR SELECT USING (true);

-- Allow authenticated users to insert proposals
CREATE POLICY "Allow authenticated users to insert proposals" 
ON public.proposals FOR INSERT TO authenticated WITH CHECK (true);

-- Allow full access to anon key for demo purposes
-- FOR PRODUCTION: You should modify these policies to be more restrictive
CREATE POLICY "Allow anon key full access for demo" 
ON public.proposals FOR ALL TO anon USING (true) WITH CHECK (true);

-- Create a trigger function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger on the proposals table to update the updated_at field
DROP TRIGGER IF EXISTS set_updated_at ON public.proposals;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.proposals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add comment to the table for documentation
COMMENT ON TABLE public.proposals IS 'Stores healthcare policy proposals created by users'; 