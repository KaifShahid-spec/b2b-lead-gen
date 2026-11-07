"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardTrendPoint } from "@/lib/dashboard/queries";

export function LeadChart({ data }: { data: DashboardTrendPoint[] }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";
  const tooltipStyle = isDark
    ? { borderRadius: 12, borderColor: "#334155", background: "#020617", color: "#e2e8f0" }
    : { borderRadius: 12, borderColor: "#e2e8f0", background: "#ffffff", color: "#0f172a" };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Lead activity</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="leadFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isDark ? "#38bdf8" : "#0f172a"} stopOpacity={0.24} />
                <stop offset="95%" stopColor={isDark ? "#38bdf8" : "#0f172a"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} stroke={axisColor} />
            <YAxis tickLine={false} axisLine={false} stroke={axisColor} allowDecimals={false} />
            <Tooltip
              contentStyle={tooltipStyle}
            />
            <Area type="monotone" dataKey="leads" stroke={isDark ? "#38bdf8" : "#0f172a"} fill="url(#leadFill)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
