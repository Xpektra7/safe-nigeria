import * as React from "react";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { type FloodIncident, type TrendPoint } from "./flood-data";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export default function App() {
  const [history, setHistory] = React.useState<FloodIncident[]>([]);
  const [trendData, setTrendData] = React.useState<TrendPoint[]>([]);

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadHistory() {
      try {
        const response = await fetch(`${API_BASE}/history`, {
          signal: controller.signal,
        });

        if (!response.ok) return;

        const data = (await response.json()) as FloodIncident[];
        setHistory(data);
        setTrendData(
          data.map((row) => ({
            time: new Date(row.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            waterLevelCm: row.waterLevelCm,
            rainfallMm: row.rainfallMm,
            prob1h: row.prob1h * 100,
            prob3h: row.prob3h * 100,
            prob6h: row.prob6h * 100,
          })),
        );
      } catch {
        // Keep the dashboard empty if the backend is unavailable.
      }
    }

    void loadHistory();

    return () => controller.abort();
  }, []);

  const latestIncident = history[history.length - 1];

  return (
    <section className="bg-background text-foreground">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 0)",
            "--header-height": "calc(var(--spacing) * 0)",
          } as React.CSSProperties
        }
        className=""
      >
        {/*<AppSidebar variant="floating" className="hidden!" />*/}
        <SidebarInset className="">
          {/*<SiteHeader />*/}
          <div className="flex flex-1 flex-col ">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                {latestIncident ? (
                  <SectionCards
                    alertLevel={latestIncident.alertLevel}
                    station={latestIncident.station}
                    waterLevelCm={latestIncident.waterLevelCm}
                    rainfallMm={latestIncident.rainfallMm}
                    prob3h={latestIncident.prob3h}
                    statusLabel="Live"
                  />
                ) : null}
                <div className="px-4 lg:px-6">
                  <ChartAreaInteractive data={trendData} />
                </div>
                <DataTable data={history} />
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </section>
  );
}
