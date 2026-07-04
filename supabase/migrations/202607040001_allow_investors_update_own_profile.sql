-- Enable users to update their own investor profiles
CREATE POLICY "Enable update for users based on user_id" ON public.investors
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
