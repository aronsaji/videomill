-- ISO 27001 & ZERO TRUST RLS POLICIES FOR VIDEOMILL
-- 
-- Forebygger Broken Object Level Authorization (BOLA) og dataeksponering
-- ved å sikre at alle databasekall eksplisitt matches mot auth.uid().

-- Skru på RLS for alle berørte tabeller
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trending_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.performance_snapshots ENABLE ROW LEVEL SECURITY;

-- 1. Ordre-tabellen (BOLA Prevention)
-- INSERT: Brukere kan BARE sette inn ordrer hvor user_id stemmer med deres JWT token (auth.uid).
CREATE POLICY "Zero Trust: Insert own orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- SELECT: Brukere kan BARE se sine egne ordrer.
CREATE POLICY "Zero Trust: View own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

-- UPDATE: Brukere kan BARE oppdatere sine egne ordrer (hindrer ID-injection).
CREATE POLICY "Zero Trust: Update own orders" 
ON public.orders FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Brukere kan BARE slette sine egne ordrer.
CREATE POLICY "Zero Trust: Delete own orders" 
ON public.orders FOR DELETE 
USING (auth.uid() = user_id);


-- 2. Trending Topics (Begrenset Modifikasjon)
-- Gitt at "Trends" kan være globalt for alle, men kun Admin kan legge dem inn (n8n).
CREATE POLICY "Zero Trust: Authenticated users can view trends" 
ON public.trending_topics FOR SELECT 
USING (auth.role() = 'authenticated');

-- Eksempel på Admin-only Insert policy:
-- CREATE POLICY "Only admins or service role can insert trends" 
-- ON public.trending_topics FOR INSERT 
-- WITH CHECK (auth.jwt()->>'role' = 'admin' OR current_user = 'service_role');


-- 3. Performance Snapshots (Relasjonell BOLA)
-- Sørg for at brukere kun kan se statistikk for videoer/ordrer de selv eier.
CREATE POLICY "Zero Trust: View own performance data" 
ON public.performance_snapshots FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = performance_snapshots.order_id 
    AND orders.user_id = auth.uid()
  )
);
