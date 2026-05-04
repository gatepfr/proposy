-- Create a bucket for logos
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true);

-- Allow public access to view logos
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'logos' );

-- Allow authenticated users to upload logos to their own folder
create policy "Authenticated users can upload logos"
on storage.objects for insert
with check (
  bucket_id = 'logos' AND
  auth.role() = 'authenticated'
);

-- Allow users to update/delete their own logos
create policy "Users can update their own logos"
on storage.objects for update
using ( bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1] );

create policy "Users can delete their own logos"
on storage.objects for delete
using ( bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1] );
