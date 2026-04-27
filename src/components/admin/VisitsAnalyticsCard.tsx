import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { Loader2, MapPin, TrendingUp } from "lucide-react";

interface RegionCount {
  region: string;
  visits: number;
}

interface MonthlySeries {
  month: string;
  total: number;
}

const startOfCurrentMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
};

const monthLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", {
    month: "short",
    year: "2-digit",
  });

export default function VisitsAnalyticsCard() {
  const [topRegions, setTopRegions] = useState<RegionCount[]>([]);
  const [monthly, setMonthly] = useState<MonthlySeries[]>([]);
  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      // Top 5 estados (mes actual)
      const { data: monthData } = await supabase
        .from("page_visits")
        .select("region")
        .gte("visited_at", startOfCurrentMonth())
        .not("region", "is", null);

      const counts = new Map<string, number>();
      (monthData ?? []).forEach((r) => {
        const key = (r.region ?? "Desconocido").trim() || "Desconocido";
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });
      const sorted = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([region, visits]) => ({ region, visits }));

      setTopRegions(sorted);
      setTotalThisMonth(monthData?.length ?? 0);

      // Histórico mes a mes (últimos 6 meses)
      const sixAgo = new Date();
      sixAgo.setMonth(sixAgo.getMonth() - 5);
      sixAgo.setDate(1);
      sixAgo.setHours(0, 0, 0, 0);

      const { data: histData } = await supabase
        .from("page_visits")
        .select("visited_at")
        .gte("visited_at", sixAgo.toISOString());

      const buckets = new Map<string, number>();
      // pre-fill last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        buckets.set(key, 0);
      }
      (histData ?? []).forEach((r) => {
        const d = new Date(r.visited_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
      });

      setMonthly(
        Array.from(buckets.entries()).map(([k, total]) => ({
          month: monthLabel(`${k}-01T00:00:00`),
          total,
        })),
      );
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4 text-accent" />
            Top 5 estados que visitan (este mes)
          </CardTitle>
          <CardDescription>
            {totalThisMonth} visitas registradas en{" "}
            {new Date().toLocaleDateString("es-MX", {
              month: "long",
              year: "numeric",
            })}
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : topRegions.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-sm text-muted-foreground italic text-center px-4">
              Aún no hay datos de visitas este mes. Espera a que tu sitio reciba
              tráfico para ver la gráfica.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topRegions} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  className="text-xs"
                />
                <YAxis
                  type="category"
                  dataKey="region"
                  width={110}
                  className="text-xs"
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v} visitas`, ""]}
                />
                <Bar
                  dataKey="visits"
                  fill="hsl(var(--accent))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4 text-accent" />
            Histórico mes a mes
          </CardTitle>
          <CardDescription>
            Visitas totales en los últimos 6 meses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis allowDecimals={false} className="text-xs" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="total"
                  name="Visitas"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
