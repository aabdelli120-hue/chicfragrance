"use client";

import { AnimatedNumber } from "@/components/animated-number";
import { formatInt } from "@/lib/format";
import type { DashboardMetrics } from "@/lib/metrics";

type Node = {
  id: string;
  label: string;
  value: number;
  x: number;
  y: number;
  fill: string;
  ring: string;
};

export function OrderFlow({ metrics }: { metrics: DashboardMetrics }) {
  const nodes: Node[] = [
    { id: "orders", label: "Commandes", value: metrics.orderCount, x: 88, y: 62, fill: "#134e3a", ring: "#c9a227" },
    { id: "ship", label: "En livraison", value: metrics.inDeliveryCount, x: 320, y: 62, fill: "#c9a227", ring: "#f4e7b5" },
    { id: "done", label: "Livrées", value: metrics.deliveredCount, x: 552, y: 62, fill: "#1b6e4e", ring: "#9fe0bf" },
    { id: "return", label: "Retours", value: metrics.returnCount, x: 204, y: 198, fill: "#b42318", ring: "#f4c7c3" },
    { id: "unreach", label: "Injoignables", value: metrics.unreachableCount, x: 320, y: 198, fill: "#c2783a", ring: "#f3d2b3" },
    { id: "later", label: "Reportées", value: metrics.reporterCount, x: 436, y: 198, fill: "#6b7c93", ring: "#d5dde6" },
  ];

  return (
    <article className="card overflow-hidden p-5 lg:p-6">
      <h2 className="font-serif text-xl">Flux des commandes</h2>
      <p className="mt-1 text-xs text-chic-muted">
        Lecture visuelle des statuts réels Google Sheets, sans statuts inventés.
      </p>

      <div className="mt-5 lg:hidden">
        <MobileFlow metrics={metrics} />
      </div>

      <svg viewBox="0 0 640 260" className="mt-2 hidden h-[240px] w-full lg:block">
        <path
          d="M128 62 C 190 62, 250 62, 280 62"
          fill="none"
          stroke="#c9a227"
          strokeWidth="1.4"
          pathLength="1"
          className="flow-line"
        />
        <path
          d="M360 62 C 430 62, 490 62, 512 62"
          fill="none"
          stroke="#1b6e4e"
          strokeWidth="1.4"
          pathLength="1"
          className="flow-line"
          style={{ animationDelay: "120ms" }}
        />
        <path
          d="M320 102 C 320 140, 220 150, 204 166"
          fill="none"
          stroke="#d7b56a"
          strokeWidth="1.1"
          pathLength="1"
          className="flow-line"
          style={{ animationDelay: "180ms" }}
        />
        <path
          d="M320 102 C 320 145, 320 155, 320 166"
          fill="none"
          stroke="#d7b56a"
          strokeWidth="1.1"
          pathLength="1"
          className="flow-line"
          style={{ animationDelay: "220ms" }}
        />
        <path
          d="M320 102 C 320 140, 420 150, 436 166"
          fill="none"
          stroke="#d7b56a"
          strokeWidth="1.1"
          pathLength="1"
          className="flow-line"
          style={{ animationDelay: "260ms" }}
        />

        {nodes.map((node) => (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            <circle r="34" fill="white" stroke={node.ring} strokeWidth="6" />
            <circle r="26" fill={node.fill} />
            <text
              y="5"
              textAnchor="middle"
              fill="white"
              fontSize="15"
              fontFamily="Georgia, serif"
            >
              {node.value}
            </text>
            <text
              y="56"
              textAnchor="middle"
              fill="#5d7269"
              fontSize="11"
              letterSpacing="0.08em"
            >
              {node.label.toUpperCase()}
            </text>
          </g>
        ))}
      </svg>
    </article>
  );
}

function MobileFlow({ metrics }: { metrics: DashboardMetrics }) {
  const main = [
    { label: "Commandes", value: metrics.orderCount, color: "bg-chic-forest" },
    { label: "En livraison", value: metrics.inDeliveryCount, color: "bg-chic-gold" },
    { label: "Livrées", value: metrics.deliveredCount, color: "bg-chic-emerald" },
  ];
  const secondary = [
    { label: "Retours", value: metrics.returnCount, color: "bg-[#b42318]" },
    { label: "Injoignables", value: metrics.unreachableCount, color: "bg-[#c2783a]" },
    { label: "Reportées", value: metrics.reporterCount, color: "bg-[#6b7c93]" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        {main.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-semibold text-white ${item.color}`}
            >
              <AnimatedNumber value={item.value} format={formatInt} />
            </div>
            <p className="mt-2 text-center text-[10px] uppercase tracking-wide text-chic-muted">
              {item.label}
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {secondary.map((item) => (
          <div key={item.label} className="rounded-2xl bg-chic-cream/80 px-2 py-3 text-center">
            <p className="font-serif text-xl">{item.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-chic-muted">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
