
-- Storage RLS for ds160-resources bucket
DROP POLICY IF EXISTS "Staff read ds160-resources" ON storage.objects;
CREATE POLICY "Staff read ds160-resources"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ds160-resources'
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'secretary')
    )
  );

DROP POLICY IF EXISTS "Admins manage ds160-resources" ON storage.objects;
CREATE POLICY "Admins manage ds160-resources"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id = 'ds160-resources'
    AND public.has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    bucket_id = 'ds160-resources'
    AND public.has_role(auth.uid(), 'admin')
  );
