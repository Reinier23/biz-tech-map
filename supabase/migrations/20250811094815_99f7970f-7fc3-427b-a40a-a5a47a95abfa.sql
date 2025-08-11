-- 1) Add user_id to shares for ownership
ALTER TABLE public.shares
  ADD COLUMN IF NOT EXISTS user_id uuid;

-- 2) Attach validation triggers
DROP TRIGGER IF EXISTS validate_share_payload_bi ON public.shares;
CREATE TRIGGER validate_share_payload_bi
BEFORE INSERT OR UPDATE ON public.shares
FOR EACH ROW EXECUTE FUNCTION public.validate_share_payload();

DROP TRIGGER IF EXISTS validate_tool_suggestion_biu ON public.tool_suggestions;
CREATE TRIGGER validate_tool_suggestion_biu
BEFORE INSERT OR UPDATE ON public.tool_suggestions
FOR EACH ROW EXECUTE FUNCTION public.validate_tool_suggestion();

-- 3) Update RLS policies
-- Shares policies
DROP POLICY IF EXISTS "Only authenticated can insert shares" ON public.shares;
DROP POLICY IF EXISTS "Public can read public shares" ON public.shares;
DROP POLICY IF EXISTS "Owners can read their shares" ON public.shares;
DROP POLICY IF EXISTS "Owners can update their shares" ON public.shares;
DROP POLICY IF EXISTS "Owners can delete their shares" ON public.shares;

CREATE POLICY "Users can create their own shares"
ON public.shares
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can read public shares"
ON public.shares
FOR SELECT
USING (is_public = true);

CREATE POLICY "Owners can read their shares"
ON public.shares
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Owners can update their shares"
ON public.shares
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their shares"
ON public.shares
FOR DELETE
USING (auth.uid() = user_id);

-- tool_cost_defaults tightening
DROP POLICY IF EXISTS "Authenticated can delete tool cost defaults" ON public.tool_cost_defaults;
DROP POLICY IF EXISTS "Authenticated can insert tool cost defaults" ON public.tool_cost_defaults;
DROP POLICY IF EXISTS "Authenticated can update tool cost defaults" ON public.tool_cost_defaults;

CREATE POLICY "Admins or service role can insert tool cost defaults"
ON public.tool_cost_defaults
FOR INSERT
WITH CHECK (((auth.jwt() ->> 'role') = 'service_role') OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins or service role can update tool cost defaults"
ON public.tool_cost_defaults
FOR UPDATE
USING (((auth.jwt() ->> 'role') = 'service_role') OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins or service role can delete tool cost defaults"
ON public.tool_cost_defaults
FOR DELETE
USING (((auth.jwt() ->> 'role') = 'service_role') OR has_role(auth.uid(), 'admin'::app_role));

-- category_cost_fallbacks tightening
DROP POLICY IF EXISTS "Authenticated can delete category cost fallbacks" ON public.category_cost_fallbacks;
DROP POLICY IF EXISTS "Authenticated can insert category cost fallbacks" ON public.category_cost_fallbacks;
DROP POLICY IF EXISTS "Authenticated can update category cost fallbacks" ON public.category_cost_fallbacks;

CREATE POLICY "Admins or service role can insert category cost fallbacks"
ON public.category_cost_fallbacks
FOR INSERT
WITH CHECK (((auth.jwt() ->> 'role') = 'service_role') OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins or service role can update category cost fallbacks"
ON public.category_cost_fallbacks
FOR UPDATE
USING (((auth.jwt() ->> 'role') = 'service_role') OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins or service role can delete category cost fallbacks"
ON public.category_cost_fallbacks
FOR DELETE
USING (((auth.jwt() ->> 'role') = 'service_role') OR has_role(auth.uid(), 'admin'::app_role));

-- ui_settings tightening
DROP POLICY IF EXISTS "Authenticated can delete ui_settings" ON public.ui_settings;
DROP POLICY IF EXISTS "Authenticated can update ui_settings" ON public.ui_settings;
DROP POLICY IF EXISTS "Authenticated can upsert ui_settings" ON public.ui_settings;

CREATE POLICY "Admins or service role can insert ui_settings"
ON public.ui_settings
FOR INSERT
WITH CHECK (((auth.jwt() ->> 'role') = 'service_role') OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins or service role can update ui_settings"
ON public.ui_settings
FOR UPDATE
USING (((auth.jwt() ->> 'role') = 'service_role') OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins or service role can delete ui_settings"
ON public.ui_settings
FOR DELETE
USING (((auth.jwt() ->> 'role') = 'service_role') OR has_role(auth.uid(), 'admin'::app_role));