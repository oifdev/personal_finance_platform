-- Create a table for AI insights history
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL, -- 'budget_analysis', 'limit_suggestion', etc.
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own AI insights"
    ON public.ai_insights FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI insights"
    ON public.ai_insights FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI insights"
    ON public.ai_insights FOR DELETE
    USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS ai_insights_user_id_idx ON public.ai_insights(user_id);
CREATE INDEX IF NOT EXISTS ai_insights_created_at_idx ON public.ai_insights(created_at DESC);
