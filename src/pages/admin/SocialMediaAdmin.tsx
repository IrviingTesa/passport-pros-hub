import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Youtube,
  Facebook,
  Instagram,
  Phone,
  MessageCircle,
  Mail,
  FileText,
  Upload,
  Download,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface VideoChannelsRow {
  id: string;
  youtube_channel_id: string | null;
  youtube_channel_url: string | null;
  tiktok_profile_url: string | null;
  last_synced_at?: string | null;
  last_sync_error?: string | null;
}

interface SiteSettings {
  id: string;
  whatsapp_number: string | null;
  phone_number: string | null;
  contact_email: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
}

interface DS160Resource {
  id: string;
  slug: string;
  title: string;
  storage_path: string | null;
  file_name: string | null;
  size_bytes: number | null;
  updated_at: string;
}

const RESOURCE_SLUGS = ["preguntas-posibles", "preguntas-posibles-renovacion"] as const;

export default function SocialMediaAdmin() {
  const [channels, setChannels] = useState<VideoChannelsRow | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [resources, setResources] = useState<DS160Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = async () => {
    setLoading(true);
    const [ch, st, rs] = await Promise.all([
      supabase
        .from("video_channels")
        .select(
          "id, youtube_channel_id, youtube_channel_url, tiktok_profile_url, last_synced_at, last_sync_error",
        )
        .limit(1)
        .maybeSingle(),
      supabase
        .from("site_settings" as never)
        .select("*")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("ds160_resources" as never)
        .select("*")
        .in("slug", RESOURCE_SLUGS as unknown as string[]),
    ]);
    if (ch.error) toast.error(ch.error.message);
    if (st.error) toast.error(st.error.message);
    if (rs.error) toast.error(rs.error.message);
    setChannels(ch.data as VideoChannelsRow | null);
    setSettings((st.data as unknown) as SiteSettings | null);
    setResources(((rs.data ?? []) as unknown) as DS160Resource[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!channels || !settings) return;
    setSaving(true);
    const [chRes, stRes] = await Promise.all([
      supabase
        .from("video_channels")
        .update({
          youtube_channel_id: channels.youtube_channel_id?.trim() || null,
          youtube_channel_url: channels.youtube_channel_url?.trim() || null,
          tiktok_profile_url: channels.tiktok_profile_url?.trim() || null,
        })
        .eq("id", channels.id),
      supabase
        .from("site_settings" as never)
        .update({
          whatsapp_number: settings.whatsapp_number?.trim() || null,
          phone_number: settings.phone_number?.trim() || null,
          contact_email: settings.contact_email?.trim() || null,
          facebook_url: settings.facebook_url?.trim() || null,
          instagram_url: settings.instagram_url?.trim() || null,
          tiktok_url: settings.tiktok_url?.trim() || null,
          youtube_url: settings.youtube_url?.trim() || null,
        } as never)
        .eq("id", settings.id),
    ]);
    setSaving(false);
    if (chRes.error) return toast.error(chRes.error.message);
    if (stRes.error) return toast.error(stRes.error.message);
    toast.success("Cambios guardados");
  };

  const syncNow = async () => {
    setSyncing(true);
    const { data, error } = await supabase.functions.invoke<{
      ok: boolean;
      synced?: number;
      error?: string;
    }>("youtube-sync", { body: {} });
    setSyncing(false);
    if (error || !data?.ok) {
      toast.error(data?.error ?? error?.message ?? "Error al sincronizar");
    } else {
      toast.success(`Videos actualizados (${data.synced ?? 0})`);
    }
    load();
  };


  const handleUpload = async (resource: DS160Resource, file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Sólo se permiten archivos PDF");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("El PDF debe pesar menos de 20MB");
      return;
    }
    const path = `${resource.slug}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error: upErr } = await supabase.storage
      .from("ds160-resources")
      .upload(path, file, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (upErr) {
      toast.error(upErr.message);
      return;
    }
    // Remove previous file
    if (resource.storage_path) {
      await supabase.storage
        .from("ds160-resources")
        .remove([resource.storage_path]);
    }
    const { error: updErr } = await supabase
      .from("ds160_resources" as never)
      .update({
        storage_path: path,
        file_name: file.name,
        mime_type: "application/pdf",
        size_bytes: file.size,
      } as never)
      .eq("id", resource.id);
    if (updErr) return toast.error(updErr.message);
    toast.success("PDF actualizado");
    load();
  };

  const downloadResource = async (resource: DS160Resource) => {
    if (!resource.storage_path) return;
    const { data, error } = await supabase.storage
      .from("ds160-resources")
      .createSignedUrl(resource.storage_path, 60);
    if (error || !data) return toast.error(error?.message ?? "Error");
    window.open(data.signedUrl, "_blank");
  };

  const removeResource = async (resource: DS160Resource) => {
    if (!resource.storage_path) return;
    if (!confirm("¿Eliminar el PDF actual?")) return;
    await supabase.storage
      .from("ds160-resources")
      .remove([resource.storage_path]);
    await supabase
      .from("ds160_resources" as never)
      .update({
        storage_path: null,
        file_name: null,
        mime_type: null,
        size_bytes: null,
      } as never)
      .eq("id", resource.id);
    toast.success("PDF eliminado");
    load();
  };

  if (loading || !channels || !settings) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary">
          Redes sociales y contacto
        </h1>
        <p className="text-muted-foreground mt-1">
          Datos de contacto, canales sociales y recursos compartidos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos de contacto</CardTitle>
          <CardDescription>
            Se usan en el footer, WhatsApp flotante y secciones de contacto.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          <Field
            icon={MessageCircle}
            label="WhatsApp (10 dígitos sin +52)"
            value={settings.whatsapp_number}
            onChange={(v) =>
              setSettings({ ...settings, whatsapp_number: v })
            }
            placeholder="5512345678"
          />
          <Field
            icon={Phone}
            label="Teléfono fijo"
            value={settings.phone_number}
            onChange={(v) => setSettings({ ...settings, phone_number: v })}
            placeholder="+52 55 1234 5678"
          />
          <Field
            icon={Mail}
            label="Email de contacto"
            value={settings.contact_email}
            onChange={(v) => setSettings({ ...settings, contact_email: v })}
            placeholder="contacto@ejemplo.com"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Redes sociales</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          <Field
            icon={Facebook}
            label="Facebook"
            value={settings.facebook_url}
            onChange={(v) => setSettings({ ...settings, facebook_url: v })}
            placeholder="https://facebook.com/…"
          />
          <Field
            icon={Instagram}
            label="Instagram"
            value={settings.instagram_url}
            onChange={(v) => setSettings({ ...settings, instagram_url: v })}
            placeholder="https://instagram.com/…"
          />
          <Field
            icon={Youtube}
            label="YouTube (perfil)"
            value={settings.youtube_url}
            onChange={(v) => setSettings({ ...settings, youtube_url: v })}
            placeholder="https://youtube.com/@…"
          />
          <Field
            label="TikTok"
            value={settings.tiktok_url}
            onChange={(v) => setSettings({ ...settings, tiktok_url: v })}
            placeholder="https://tiktok.com/@…"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Youtube className="w-6 h-6 text-destructive" />
            <div>
              <CardTitle>Canal de YouTube (videos del sitio)</CardTitle>
              <CardDescription>
                Los últimos videos del canal se muestran en la landing.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>ID del canal o handle</Label>
            <Input
              value={channels.youtube_channel_id ?? ""}
              onChange={(e) =>
                setChannels({ ...channels, youtube_channel_id: e.target.value })
              }
              placeholder="UCxxxxxxxxxxxxxxxxxx  o  @miCanal"
            />
          </div>
          <div>
            <Label>URL pública del canal</Label>
            <Input
              value={channels.youtube_channel_url ?? ""}
              onChange={(e) =>
                setChannels({ ...channels, youtube_channel_url: e.target.value })
              }
              placeholder="https://youtube.com/@miCanal"
            />
          </div>
          <div>
            <Label>Perfil TikTok (videos del sitio)</Label>
            <Input
              value={channels.tiktok_profile_url ?? ""}
              onChange={(e) =>
                setChannels({ ...channels, tiktok_profile_url: e.target.value })
              }
              placeholder="https://tiktok.com/@miPerfil"
            />
          </div>

          <div className="rounded-md border p-3 bg-muted/30 space-y-2">
            <div className="text-sm">
              <span className="font-medium">Última sincronización: </span>
              {channels.last_synced_at
                ? new Date(channels.last_synced_at).toLocaleString("es-MX")
                : "nunca"}
            </div>
            {channels.last_sync_error && (
              <div className="text-xs text-destructive">
                Último error: {channels.last_sync_error}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              La sincronización automática corre 1 vez por semana. Usa este
              botón si acabas de subir un video y quieres verlo ahora.
            </p>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={syncNow}
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Actualizar videos ahora
            </Button>
          </div>
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <div>
              <CardTitle>Preguntas posibles (PDF)</CardTitle>
              <CardDescription>
                Sube un PDF para primera vez y otro para renovación. Después de
                un pago aprobado, el sistema entrega automáticamente el archivo
                que corresponde según la respuesta de renovación en el DS-160.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          {RESOURCE_SLUGS.map((slug) => {
            const res = resources.find((r) => r.slug === slug);
            const isRenewal = slug === "preguntas-posibles-renovacion";
            return (
              <ResourceCard
                key={slug}
                label={isRenewal ? "Renovación" : "Primera vez"}
                hint={
                  isRenewal
                    ? "Se entrega cuando el solicitante indica que es renovación."
                    : "Se entrega cuando el solicitante indica que es su primera visa."
                }
                resource={res ?? null}
                onUpload={(file) => res && handleUpload(res, file)}
                onView={() => res && downloadResource(res)}
                onRemove={() => res && removeResource(res)}
              />
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Guardar contacto y redes
        </Button>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <Label className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </Label>
      <Input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={250}
      />
    </div>
  );
}
