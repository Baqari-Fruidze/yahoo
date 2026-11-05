import { createClient } from "@supabase/supabase-js";

function getSupabaseClient(token) {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}

// GET - User's watchlist
export async function getWatchlist(userId, token) {
  const supabase = getSupabaseClient(token);

  const { data, error } = await supabase
    .from("watchlist")
    .select("symbol")
    .eq("user_id", userId);

  if (error) throw error;

  return data;
}

// POST - Add symbol
export async function addSymbolToWatchlist(userId, symbol, token) {
  const supabase = getSupabaseClient(token);

  const { data, error } = await supabase
    .from("watchlist")
    .insert({
      user_id: userId,
      symbol: symbol.trim().toUpperCase(),
    })
    .select("symbol")
    .single();

  if (error) throw error;

  return data;
}

// DELETE - Remove symbol
export async function removeSymbolFromWatchlist(userId, symbol, token) {
  const supabase = getSupabaseClient(token);

  const { data, error } = await supabase
    .from("watchlist")
    .delete()
    .eq("user_id", userId)
    .eq("symbol", symbol.trim().toUpperCase())
    .select("symbol");

  if (error) throw error;

  return data[0] ?? null;
}
