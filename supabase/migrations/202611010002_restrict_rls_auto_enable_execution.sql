-- Keep the event trigger internal; application roles do not need to invoke it.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
