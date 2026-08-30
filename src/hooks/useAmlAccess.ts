import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { invokeSecureFunction } from "@/lib/secureInvoke";

export type AmlRole = "analyst" | "reviewer" | "mlro" | "auditor";

const SUPERADMIN_AML_ROLES: AmlRole[] = ["analyst", "reviewer", "mlro", "auditor"];

export interface AmlAccess {
  loading: boolean;
  flagEnabled: boolean;
  roles: Set<AmlRole>;
  hasAnyRole: boolean;
  canWrite: boolean;
  isMlro: boolean;
  refresh: () => Promise<void>;
}

export function useAmlAccess(): AmlAccess {
  const { user, loading: authLoading, isSuperadmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [flagEnabled, setFlagEnabled] = useState(false);
  const [roles, setRoles] = useState<Set<AmlRole>>(new Set());

  const load = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    setLoading(true);
    try {
      const uid = user?.id;

      if (!uid) {
        setFlagEnabled(false);
        setRoles(new Set());
        return;
      }

      if (isSuperadmin) {
        setFlagEnabled(true);
        setRoles(new Set(SUPERADMIN_AML_ROLES));
        return;
      }

      const { data, error } = await invokeSecureFunction<{
        flagEnabled: boolean;
        roles: AmlRole[];
      }>("aml-access", { op: "summary" }, { timeoutMs: 15000 });

      if (error) throw new Error(error.message);

      setFlagEnabled(Boolean(data?.flagEnabled));
      setRoles(new Set((data?.roles ?? []) as AmlRole[]));
    } catch (e) {
      console.warn("useAmlAccess failed", e);
      if (isSuperadmin) {
        setFlagEnabled(true);
        setRoles(new Set(SUPERADMIN_AML_ROLES));
      } else {
        setFlagEnabled(false);
        setRoles(new Set());
      }
    } finally {
      setLoading(false);
    }
  }, [authLoading, user?.id, isSuperadmin]);

  useEffect(() => { load(); }, [load]);

  return {
    loading,
    flagEnabled,
    roles,
    hasAnyRole: roles.size > 0,
    canWrite: roles.has("analyst") || roles.has("reviewer") || roles.has("mlro"),
    isMlro: roles.has("mlro"),
    refresh: load,
  };
}
