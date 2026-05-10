"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { type TrendPoint } from "@/src/flood-data";

const chartConfig = {
  waterLevelCm: { label: "Water Level", color: "var(--chart-1)" },
  rainfallMm: { label: "Rainfall", color: "var(--chart-2)" },
  prob3h: { label: "3h Risk", color: "var(--chart-3)" },
} satisfies ChartConfig;

type ChartAreaInteractiveProps = {
  data: TrendPoint[];
};

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState<"90d" | "30d" | "7d">("90d");
  const handleTimeRangeChange = React.useCallback((value: string) => {
    if (value === "90d" || value === "30d" || value === "7d") {
      setTimeRange(value);
    }
  }, []);

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  const filteredData = React.useMemo(() => {
    if (timeRange === "7d") return data.slice(-7);
    if (timeRange === "30d") return data.slice(-12);
    return data;
  }, [data, timeRange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flood Trend Window</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Water level, rainfall, and 3h risk across recent readings
          </span>
          <span className="@[540px]/card:hidden">Flood trend window</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            value={timeRange}
            onValueChange={handleTimeRangeChange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! md:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillWater" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-waterLevelCm)"
                  stopOpacity={0.45}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-waterLevelCm)"
                  stopOpacity={0.05}
                />
              </linearGradient>
              <linearGradient id="fillRain" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-rainfallMm)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-rainfallMm)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="waterLevelCm"
              type="natural"
              fill="url(#fillWater)"
              stroke="var(--chart-1)"
            />
            <Area
              dataKey="rainfallMm"
              type="natural"
              fill="url(#fillRain)"
              stroke="var(--chart-2)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
