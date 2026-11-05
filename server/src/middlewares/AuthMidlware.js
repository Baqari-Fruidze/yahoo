import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
);

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const { data, error } = await supabase.auth.getClaims(token);

    if (error || !data?.claims?.sub) {
      return res.sendStatus(401);
    }

    req.userId = data.claims.sub;
    next();
  } catch (error) {
    next(error);
  }
}
