import { supabase } from "@/integrations/supabase/client";

export async function createShare(payload: any): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('shares')
    .insert({ payload, is_public: true })
    .select('id')
    .single();

  if (error) {
    console.error('createShare error', error);
    throw error;
  }

  return { id: data.id };
}

export async function fetchShare(id: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('shares')
    .select('payload')
    .eq('id', id)
    .eq('is_public', true)
    .maybeSingle();

  if (error) {
    console.error('fetchShare error', error);
    throw error;
  }

  return data?.payload ?? null;
}
