import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";

// Local typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauthApi = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

function isSafeRelative(path: string | null): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Falta el parámetro authorization_id.");
        setLoading(false);
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      try {
        const { data, error } = await oauthApi.getAuthorizationDetails(authorizationId);
        if (!active) return;
        if (error) {
          setError(error.message ?? "No se pudo cargar la autorización.");
          setLoading(false);
          return;
        }
        const immediate = data?.redirect_url ?? data?.redirect_to;
        if (immediate && !data?.client) {
          window.location.href = immediate;
          return;
        }
        setDetails(data);
      } catch (err: any) {
        setError(err?.message ?? "Error inesperado.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    try {
      const { data, error } = approve
        ? await oauthApi.approveAuthorization(authorizationId)
        : await oauthApi.denyAuthorization(authorizationId);
      if (error) {
        setError(error.message ?? "No se pudo procesar la decisión.");
        setBusy(false);
        return;
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setError("El servidor de autorización no devolvió una URL de retorno.");
        setBusy(false);
        return;
      }
      window.location.href = target;
    } catch (err: any) {
      setError(err?.message ?? "Error inesperado.");
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No se pudo cargar la autorización</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "una aplicación externa";
  const redirectUri = details?.client?.redirect_uri ?? details?.client?.redirect_uris?.[0];
  const scopes: string[] = details?.scopes ?? details?.requested_scopes ?? [];

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-secondary/30">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5" />
            <CardTitle>Conectar {clientName} con tu cuenta</CardTitle>
          </div>
          <CardDescription>
            Esto permitirá que {clientName} use las herramientas habilitadas de Asesores
            Migratorios actuando como tú mientras estés autenticado. No omite las políticas
            de seguridad ni RLS de la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {redirectUri && (
            <div className="text-xs text-muted-foreground break-all">
              <span className="font-semibold">Redirect URI:</span> {redirectUri}
            </div>
          )}
          {scopes.length > 0 && (
            <div className="text-sm">
              <div className="font-semibold mb-1">Permisos solicitados</div>
              <ul className="list-disc list-inside text-muted-foreground">
                {scopes.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button disabled={busy} onClick={() => decide(true)} className="flex-1" variant="gold">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Aprobar
            </Button>
            <Button disabled={busy} onClick={() => decide(false)} variant="outline" className="flex-1">
              Cancelar conexión
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

export { isSafeRelative };
