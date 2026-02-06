-- Storage bucket for CSV uploads (private; access via RLS)
insert into storage.buckets (id, name, public)
values ('csv-uploads', 'csv-uploads', false)
on conflict (id) do nothing;

-- Allow authenticated users to upload to their own folder: user_id/*
create policy "Users can upload own CSVs"
  on storage.objects for insert
  with check (
    bucket_id = 'csv-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can read their own files
create policy "Users can read own CSVs"
  on storage.objects for select
  using (
    bucket_id = 'csv-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Service role bypasses RLS for API uploads (no policy needed for service role)

-- Add spend_by_day for line chart (cost over time)
alter table analysis_results
  add column if not exists spend_by_day jsonb;
-- Format: [{ date: 'YYYY-MM-DD', cost: number }, ...]

-- Allow service role to insert/update concierge_deliverables (API uses service role; no extra policy needed)
