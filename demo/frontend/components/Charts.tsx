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

/* Tonal palette for chart bars */
const BAR_COLORS = [
  "#5c4033",
  "#7d3f33",
  "#8f7234",
  "#5d6b4c",
  "#6b4c36",
  "#8b6f56",
  "#4d3322",
  "#3a2519",
  "#a0522d",
  "#704030",
  "#926b4f",
  "#5a3e2b",
];

function getColor(i: number) {
  return BAR_COLORS[i % BAR_COLORS.length];
}

function shorten(s: string, max = 20) {
  return s.length > max ? s.slice(0, max - 1) + "\u2026" : s;
}

interface Props {
  data: GroupResult[];
}

export default function Charts({ data }: Props) {
  /* ---- Individual: one bar per accent+dataset row ---- */
  const individualWer = data.map((g) => ({
    label: shorten(`${g.accent} (${g.dataset})`, 34),
    WER: Math.round(g.avgWer * 1000) / 10,
  }));

  const individualIntent = data.map((g) => ({
    label: shorten(`${g.accent} (${g.dataset})`, 34),
    "Intent Error": Math.round(g.intentErrorRateSmoothed * 1000) / 10,
  }));

  /* ---- Average: one bar per unique accent ---- */
  const accentMap = new Map<
    string,
    { totalWer: number; totalErr: number; totalN: number; count: number }
  >();
  for (const g of data) {
    const prev = accentMap.get(g.accent) ?? { totalWer: 0, totalErr: 0, totalN: 0, count: 0 };
    accentMap.set(g.accent, {
      totalWer: prev.totalWer + g.avgWer * g.n,
      totalErr: prev.totalErr + g.intentErrorRateSmoothed * g.n,
      totalN: prev.totalN + g.n,
      count: prev.count + 1,
    });
  }

  const avgWer = Array.from(accentMap.entries()).map(([accent, v]) => ({
    label: shorten(accent),
    WER: v.totalN > 0 ? Math.round((v.totalWer / v.totalN) * 1000) / 10 : 0,
  }));

  const avgIntent = Array.from(accentMap.entries()).map(([accent, v]) => ({
    label: shorten(accent),
    "Intent Error": v.totalN > 0 ? Math.round((v.totalErr / v.totalN) * 1000) / 10 : 0,
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

  const chartHeight = 280;

  return (
    <div className="space-y-16">
      {/* ---- Average WER & Intent Error ---- */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-camel mb-6">
          Average Across Datasets
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-dune mb-4">
              Avg. Word Error Rate by Accent (%)
            </p>
            <div className="bg-cream border-t-2 border-edge p-5">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={avgWer} margin={{ top: 0, right: 0, bottom: 50, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ece5da" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#8b6f56", fontFamily: "'Times New Roman'", fontWeight: 600 }}
                    stroke="#ddd2c3"
                    tickLine={false}
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#c4b49e", fontFamily: "'Times New Roman'" }}
                    stroke="transparent"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(200,187,168,0.12)" }} />
                  <Bar dataKey="WER" radius={[1, 1, 0, 0]}>
                    {avgWer.map((_, i) => (
                      <Cell key={i} fill={getColor(i)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-dune mb-4">
              Avg. Intent Error Rate by Accent (%)
            </p>
            <div className="bg-cream border-t-2 border-edge p-5">
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart data={avgIntent} margin={{ top: 0, right: 0, bottom: 50, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ece5da" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#8b6f56", fontFamily: "'Times New Roman'", fontWeight: 600 }}
                    stroke="#ddd2c3"
                    tickLine={false}
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#c4b49e", fontFamily: "'Times New Roman'" }}
                    stroke="transparent"
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(200,187,168,0.12)" }} />
                  <Bar dataKey="Intent Error" radius={[1, 1, 0, 0]}>
                    {avgIntent.map((_, i) => (
                      <Cell key={i} fill={getColor(i)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Individual per dataset ---- */}
      <div>
        <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-camel mb-6">
          Individual Results Per Dataset
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-dune mb-4">
              Word Error Rate — Each Accent + Dataset (%)
            </p>
            <div className="bg-cream border-t-2 border-edge p-5">
              <ResponsiveContainer width="100%" height={Math.max(300, individualWer.length * 32)}>
                <BarChart data={individualWer} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ece5da" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#c4b49e", fontFamily: "'Times New Roman'" }}
                    stroke="transparent"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fontSize: 9, fill: "#8b6f56", fontFamily: "'Times New Roman'", fontWeight: 600 }}
                    stroke="transparent"
                    tickLine={false}
                    width={200}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(200,187,168,0.08)" }} />
                  <Bar dataKey="WER" radius={[0, 1, 1, 0]}>
                    {individualWer.map((_, i) => (
                      <Cell key={i} fill={getColor(i)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-dune mb-4">
              Intent Error Rate — Each Accent + Dataset (%)
            </p>
            <div className="bg-cream border-t-2 border-edge p-5">
              <ResponsiveContainer width="100%" height={Math.max(300, individualIntent.length * 32)}>
                <BarChart data={individualIntent} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ece5da" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#c4b49e", fontFamily: "'Times New Roman'" }}
                    stroke="transparent"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="label"
                    type="category"
                    tick={{ fontSize: 9, fill: "#8b6f56", fontFamily: "'Times New Roman'", fontWeight: 600 }}
                    stroke="transparent"
                    tickLine={false}
                    width={200}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(200,187,168,0.08)" }} />
                  <Bar dataKey="Intent Error" radius={[0, 1, 1, 0]}>
                    {individualIntent.map((_, i) => (
                      <Cell key={i} fill={getColor(i)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
