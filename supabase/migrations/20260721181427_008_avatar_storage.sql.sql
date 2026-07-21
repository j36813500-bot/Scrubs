-- Storage policies for customer-avatars bucket: users can CRUD their own avatar files
CREATE POLICY "avatar_select_own" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'customer-avatars');
CREATE POLICY "avatar_insert_own" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'customer-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatar_update_own" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'customer-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "avatar_delete_own" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'customer-avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
