-- ============================================================
-- 005_leads_module.sql
-- Full Leads module schema with RLS
-- ============================================================

-- ── leads ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id         uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by      uuid REFERENCES public.users(id) ON DELETE SET NULL,

  -- Core fields
  first_name      text,
  last_name       text,
  email           text,
  phone           text,
  company         text,
  title           text,
  website         text,
  linkedin_url    text,

  -- Qualification
  status          text NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','contacted','qualified','proposal','negotiation','won','lost','archived')),
  priority        text NOT NULL DEFAULT 'medium'
                    CHECK (priority IN ('low','medium','high','urgent')),
  score           integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  source          text,
  assigned_to     uuid REFERENCES public.users(id) ON DELETE SET NULL,

  -- Extra
  notes_count     integer DEFAULT 0,
  custom_fields   jsonb DEFAULT '{}'::jsonb,
  is_archived     boolean NOT NULL DEFAULT false,

  -- Timestamps
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  archived_at     timestamptz,
  last_contacted_at timestamptz
);

-- ── lead_tags ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lead_tags (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  name    text NOT NULL,
  color   text DEFAULT '#6366f1',
  UNIQUE (lead_id, name)
);

-- ── lead_activities ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lead_activities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  team_id     uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  actor_id    uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action      text NOT NULL,   -- e.g. 'status_changed','note_added','created','archived'
  metadata    jsonb DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── lead_notes ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.lead_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  team_id     uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  author_id   uuid REFERENCES public.users(id) ON DELETE SET NULL,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ── indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS leads_team_id_idx         ON public.leads(team_id);
CREATE INDEX IF NOT EXISTS leads_status_idx          ON public.leads(status);
CREATE INDEX IF NOT EXISTS leads_is_archived_idx     ON public.leads(is_archived);
CREATE INDEX IF NOT EXISTS leads_created_at_idx      ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS lead_tags_lead_id_idx     ON public.lead_tags(lead_id);
CREATE INDEX IF NOT EXISTS lead_activities_lead_id_idx ON public.lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS lead_activities_team_id_idx ON public.lead_activities(team_id);
CREATE INDEX IF NOT EXISTS lead_notes_lead_id_idx    ON public.lead_notes(lead_id);

-- Full-text search
CREATE INDEX IF NOT EXISTS leads_fts_idx ON public.leads
  USING gin(to_tsvector('english',
    coalesce(first_name,'') || ' ' ||
    coalesce(last_name,'')  || ' ' ||
    coalesce(email,'')      || ' ' ||
    coalesce(company,'')    || ' ' ||
    coalesce(title,'')
  ));

-- ── updated_at trigger ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leads_updated_at ON public.leads;
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS lead_notes_updated_at ON public.lead_notes;
CREATE TRIGGER lead_notes_updated_at
  BEFORE UPDATE ON public.lead_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── notes_count sync ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_lead_notes_count()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.leads SET notes_count = notes_count + 1 WHERE id = NEW.lead_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.leads SET notes_count = GREATEST(notes_count - 1, 0) WHERE id = OLD.lead_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS lead_notes_count_sync ON public.lead_notes;
CREATE TRIGGER lead_notes_count_sync
  AFTER INSERT OR DELETE ON public.lead_notes
  FOR EACH ROW EXECUTE FUNCTION public.sync_lead_notes_count();

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE public.leads           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tags       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_notes      ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user a member of the team?
CREATE OR REPLACE FUNCTION public.is_team_member(p_team_id uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id
      AND user_id = auth.uid()
  );
$$;

-- leads policies
DROP POLICY IF EXISTS "leads_select" ON public.leads;
CREATE POLICY "leads_select" ON public.leads
  FOR SELECT USING (public.is_team_member(team_id));

DROP POLICY IF EXISTS "leads_insert" ON public.leads;
CREATE POLICY "leads_insert" ON public.leads
  FOR INSERT WITH CHECK (public.is_team_member(team_id));

DROP POLICY IF EXISTS "leads_update" ON public.leads;
CREATE POLICY "leads_update" ON public.leads
  FOR UPDATE USING (public.is_team_member(team_id));

DROP POLICY IF EXISTS "leads_delete" ON public.leads;
CREATE POLICY "leads_delete" ON public.leads
  FOR DELETE USING (public.is_team_member(team_id));

-- lead_tags policies
DROP POLICY IF EXISTS "lead_tags_all" ON public.lead_tags;
CREATE POLICY "lead_tags_all" ON public.lead_tags
  USING (EXISTS (
    SELECT 1 FROM public.leads l WHERE l.id = lead_id AND public.is_team_member(l.team_id)
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.leads l WHERE l.id = lead_id AND public.is_team_member(l.team_id)
  ));

-- lead_activities policies
DROP POLICY IF EXISTS "lead_activities_select" ON public.lead_activities;
CREATE POLICY "lead_activities_select" ON public.lead_activities
  FOR SELECT USING (public.is_team_member(team_id));

DROP POLICY IF EXISTS "lead_activities_insert" ON public.lead_activities;
CREATE POLICY "lead_activities_insert" ON public.lead_activities
  FOR INSERT WITH CHECK (public.is_team_member(team_id));

-- lead_notes policies
DROP POLICY IF EXISTS "lead_notes_select" ON public.lead_notes;
CREATE POLICY "lead_notes_select" ON public.lead_notes
  FOR SELECT USING (public.is_team_member(team_id));

DROP POLICY IF EXISTS "lead_notes_insert" ON public.lead_notes;
CREATE POLICY "lead_notes_insert" ON public.lead_notes
  FOR INSERT WITH CHECK (public.is_team_member(team_id));

DROP POLICY IF EXISTS "lead_notes_update" ON public.lead_notes;
CREATE POLICY "lead_notes_update" ON public.lead_notes
  FOR UPDATE USING (author_id = auth.uid() AND public.is_team_member(team_id));

DROP POLICY IF EXISTS "lead_notes_delete" ON public.lead_notes;
CREATE POLICY "lead_notes_delete" ON public.lead_notes
  FOR DELETE USING (author_id = auth.uid() AND public.is_team_member(team_id));

-- Enable Realtime on leads table
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_notes;
