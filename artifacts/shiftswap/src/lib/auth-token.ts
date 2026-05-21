import { supabase } from "./supabase";
import { setAuthTokenGetter } from "@workspace/api-client-react";

setAuthTokenGetter(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
});
