-- Users table (handled by Supabase Auth)
-- Just use auth.users

-- CSV uploads table
create table csv_uploads (
  id uuid default gen_random_uuid(),
  user_id uuid references auth.users(id),
  filename text,
  storage_path text,
  file_size integer,
  provider text default 'openai', -- 'openai', 'anthropic', etc.
  status text default 'pending', -- 'pending', 'analyzing', 'completed', 'concierge_queued'
  raw_data jsonb, -- parsed CSV stored as JSON
  created_at timestamp default now(),

  -- For concierge tier
  tier text default 'self_serve', -- 'self_serve', 'concierge_pending', 'concierge_delivered'
  stripe_payment_intent_id text,
  loom_video_url text,
  consultant_notes text,
  savings_estimate numeric,

  primary key (id)
);

-- Analysis results (automated)
create table analysis_results (
  id uuid default gen_random_uuid(),
  upload_id uuid references csv_uploads(id) unique,
  total_spend numeric,
  total_requests integer,
  top_models jsonb, -- [{model: 'gpt-4', cost: 123, tokens: 456}]
  recommendations jsonb, -- Array of recommendation objects
  created_at timestamp default now()
);

-- Manual recommendations (for concierge tier)
create table concierge_deliverables (
  id uuid default gen_random_uuid(),
  upload_id uuid references csv_uploads(id),
  consultant_id uuid references auth.users(id), -- you/admin (nullable if delivered via API key)
  loom_video_url text not null,
  written_report text,
  code_snippets jsonb, -- [{title: 'Batching fix', language: 'python', code: '...'}]
  top_savings numeric, -- estimated $ saved
  delivered_at timestamp default now()
);

-- RLS policies (enable after auth is set up)
alter table csv_uploads enable row level security;
alter table analysis_results enable row level security;
alter table concierge_deliverables enable row level security;

-- Users can only see their own uploads
create policy "Users can view own uploads" on csv_uploads
  for select using (auth.uid() = user_id);

create policy "Users can insert own uploads" on csv_uploads
  for insert with check (auth.uid() = user_id);

create policy "Users can update own uploads" on csv_uploads
  for update using (auth.uid() = user_id);

-- Analysis results: users can see results for their uploads
create policy "Users can view own analysis" on analysis_results
  for select using (
    exists (select 1 from csv_uploads where id = upload_id and user_id = auth.uid())
  );

create policy "Service role can insert analysis" on analysis_results
  for insert with check (true);

-- Concierge deliverables: users see their own; admin manages
create policy "Users can view own concierge" on concierge_deliverables
  for select using (
    exists (select 1 from csv_uploads where id = upload_id and user_id = auth.uid())
  );
