import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionState {
  hasActive: boolean;
  expiresAt: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Determina si la secretaria autenticada tiene un permiso de edición global
 * activo (no revocado y no expirado).
 */
export const useSecretaryEditPermission = (): PermissionState => {
  const { user, isSecretary } = useAuth();
  const [hasActive, setHasActive] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user || !isSecretary) {
      setHasActive(false);
      setExpiresAt(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("secretary_edit_permissions")
      .select("expires_at")
      .eq("secretary_id", user.id)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setHasActive(!!data);
    setExpiresAt(data?.expires_at ?? null);
    setLoading(false);
  }, [user, isSecretary]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { hasActive, expiresAt, loading, refresh };
};
