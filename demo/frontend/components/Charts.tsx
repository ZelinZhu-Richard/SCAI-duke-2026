"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { GroupResult } from "@/lib/types";

/* Tonal brown palette for chart bars */
const ACCENT_COLORS: Record<string, string> = {
  US: "#5c4033",
  Indian: "#7d3f33",
  African: "#8f7234",
  England: "#5d6b4c",
  Australian: "#6b4c36",
};

function getColor(accent: string) {
  return ACCENT_COLORS[accent] ?? "#8b6f56";
}

interface Props {
  data: GroupResult[];
}

export default function Charts({ data }: Props) {
  const cerData = data.map((g) => ({
    accent: g.accent,
    CER: Math.round(g.cerMean * 1000) / 10,
  }));

  const misrouteData = data.map((g) => ({
    accent: g.accent,
    Misrouting: Math.round(g.misroutingRate * 1000) / 10,
  }));

  const tooltipStyle = {
    borderRadius: "0px",
    border: "1px solid #c9bba8",
    backgroundColor: "#fdfcfa",
    fontSize: "12px",
    fontFamily: "'Times New Roman', Georgia, serif",
    color: "#3a2519",
    padding: "8px 14px",
    fontWeight: "600" as const,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-camel mb-5">
          Character Error Rate by Group (%)
        </p>
        <div className="bg-cream border-t-2 border-edge p-5">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={cerData} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece5da" vertical={false} />
              <XAxis
                dataKey="accent"
                tick={{ fontSize: 11, fill: "#8b6f56", fontFamily: "'Times New Roman'", fontWeight: 600 }}
                stroke="#ddd2c3"
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#c4b49e", fontFamily: "'Times New Roman'" }}
                stroke="transparent"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(200,187,168,0.12)" }} />
              <Bar dataKey="CER" radius={[1, 1, 0, 0]}>
                {cerData.map((entry) => (
                  <Cell key={entry.accent} fill={getColor(entry.accent)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-camel mb-5">
          Misrouting Rate by Group (%)
        </p>
        <div className="bg-cream border-t-2 border-edge p-5">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={misrouteData} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ece5da" vertical={false} />
              <XAxis
                dataKey="accent"
                tick={{ fontSize: 11, fill: "#8b6f56", fontFamily: "'Times New Roman'", fontWeight: 600 }}
                stroke="#ddd2c3"
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#c4b49e", fontFamily: "'Times New Roman'" }}
                stroke="transparent"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(200,187,168,0.12)" }} />
              <Bar dataKey="Misrouting" radius={[1, 1, 0, 0]}>
                {misrouteData.map((entry) => (
                  <Cell key={entry.accent} fill={getColor(entry.accent)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
