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

const chartPalettes = {
  GREEN: {
    water: "var(--chart-1)",
    rain: "var(--chart-4)",
  },
  YELLOW: {
    water: "var(--chart-2)",
    rain: "var(--chart-4)",
  },
  RED: {
    water: "var(--chart-3)",
    rain: "var(--chart-2)",
  },
} as const;

const chartConfig = {
  waterLevelCm: { label: "Water Level", color: "var(--chart-1)" },
  rainfallMm: { label: "Rainfall", color: "var(--chart-4)" },
  prob3h: { label: "3h Risk", color: "var(--destructive)" },
} satisfies ChartConfig;

type ChartAreaInteractiveProps = {
  data: TrendPoint[];
};

function getPalette(alertLevel: TrendPoint["alertLevel"]) {
  return chartPalettes[alertLevel] ?? chartPalettes.GREEN;
}

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

  const palette = getPalette(filteredData[filteredData.length - 1]?.alertLevel ?? "GREEN");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flood Trend Window</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Water level, rainfall, and 3h risk across recent date and time stamps
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
                  stopColor={palette.water}
                  stopOpacity={0.7}
                />
                <stop
                  offset="95%"
                  stopColor={palette.water}
                  stopOpacity={0.12}
                />
              </linearGradient>
              <linearGradient id="fillRain" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={palette.rain}
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor={palette.rain}
                  stopOpacity={0.1}
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
              stroke={palette.water}
              strokeWidth={2.5}
            />
            <Area
              dataKey="rainfallMm"
              type="natural"
              fill="url(#fillRain)"
              stroke={palette.rain}
              strokeWidth={2.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
