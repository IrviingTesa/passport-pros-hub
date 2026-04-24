import { useEffect, useState } from "react";
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
import { Loader2, Save, Youtube } from "lucide-react";

interface VideoChannelsRow {
  id: string;
  youtube_channel_id: string | null;
  youtube_channel_url: string | null;
  tiktok_profile_url: string | null;
}

export default function VideosAdmin() {
  const [row, setRow] = useState<VideoChannelsRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("video_channels")
      .select("id, youtube_channel_id, youtube_channel_url, tiktok_profile_url")
      .limit(1)
      .maybeSingle();
    if (error) toast.error(error.message);
    setRow(data as VideoChannelsRow | null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    const { error } = await supabase
      .from("video_channels")
      .update({
        youtube_channel_id: row.youtube_channel_id?.trim() || null,
        youtube_channel_url: row.youtube_channel_url?.trim() || null,
        tiktok_profile_url: row.tiktok_profile_url?.trim() || null,
      })
      .eq("id", row.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Configuración guardada. Los videos se actualizarán en la próxima recarga (caché 1h).");
  };

  if (loading || !row) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-primary">Videos</h1>
        <p className="text-muted-foreground mt-1">
          Configura el canal de YouTube y el perfil de TikTok.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Youtube className="w-6 h-6 text-destructive" />
            <div>
              <CardTitle>YouTube</CardTitle>
              <CardDescription>
                Los últimos 10 videos del canal se mostrarán automáticamente en
                la landing.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>ID del canal o handle</Label>
            <Input
              value={row.youtube_channel_id ?? ""}
              onChange={(e) =>
                setRow({ ...row, youtube_channel_id: e.target.value })
              }
              placeholder="UCxxxxxxxxxxxxxxxxxx  o  @miCanal"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Acepta el ID que empieza con "UC" o el handle (@usuario).
            </p>
          </div>
          <div>
            <Label>URL pública del canal (botón "Ver canal completo")</Label>
            <Input
              value={row.youtube_channel_url ?? ""}
              onChange={(e) =>
                setRow({ ...row, youtube_channel_url: e.target.value })
              }
              placeholder="https://www.youtube.com/@miCanal"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>TikTok</CardTitle>
          <CardDescription>
            URL del perfil que se usará en el ícono de TikTok del footer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label>URL del perfil de TikTok</Label>
          <Input
            value={row.tiktok_profile_url ?? ""}
            onChange={(e) =>
              setRow({ ...row, tiktok_profile_url: e.target.value })
            }
            placeholder="https://www.tiktok.com/@miPerfil"
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
