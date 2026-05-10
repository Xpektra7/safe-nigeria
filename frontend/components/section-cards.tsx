import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, ChartHistogramIcon, ChartUpIcon, Database01Icon } from "@hugeicons/core-free-icons";

type AlertLevel = "GREEN" | "YELLOW" | "RED";

type SectionCardsProps = {
  alertLevel: AlertLevel;
  station: string;
  waterLevelCm: number;
  rainfallMm: number;
  prob3h: number;
  statusLabel: string;
};

const statusTone: Record<AlertLevel, "outline" | "warning" | "destructive"> = {
  GREEN: "outline",
  YELLOW: "warning",
  RED: "destructive",
};

export function SectionCards({
  alertLevel,
  station,
  waterLevelCm,
  rainfallMm,
  prob3h,
  statusLabel,
}: SectionCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Alert Level</CardDescription>
          <CardTitle
            className={`text-3xl font-semibold tabular-nums ${
              alertLevel === "RED"
                ? "text-destructive"
                : alertLevel === "YELLOW"
                  ? "text-warning"
                  : "text-[color:var(--chart-1)]"
            }`}
          >
            {alertLevel}
          </CardTitle>
          <CardAction>
            <Badge variant={statusTone[alertLevel]}>{statusLabel}</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div
            className={`flex gap-2 font-medium ${
              alertLevel === "RED"
                ? "text-destructive"
                : alertLevel === "YELLOW"
                  ? "text-warning"
                  : "text-[color:var(--chart-1)]"
            }`}
          >
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />
            {alertLevel === "RED"
              ? "Flood alert active"
              : alertLevel === "YELLOW"
                ? "Watch conditions"
                : "Normal conditions"}
          </div>
          <div className="text-muted-foreground">{station} monitoring point</div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Water Level</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">{waterLevelCm} cm</CardTitle>
          <CardAction>
            <Badge variant="outline">Threshold 400 cm</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div
            className={`flex gap-2 font-medium ${
              waterLevelCm >= 400
                ? "text-destructive"
                : "text-[color:var(--chart-1)]"
            }`}
          >
            <HugeiconsIcon icon={Database01Icon} strokeWidth={2} className="size-4" />
            {waterLevelCm >= 400 ? "Above flood line" : "Below flood line"}
          </div>
          <div className="text-muted-foreground">Current river gauge reading</div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Rainfall</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">{rainfallMm.toFixed(1)} mm</CardTitle>
          <CardAction>
            <Badge variant="outline">Current burst</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div
            className={`flex gap-2 font-medium ${
              rainfallMm >= 40
                ? "text-warning"
                : "text-[color:var(--chart-2)]"
            }`}
          >
            <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} className="size-4" />
            {rainfallMm >= 40 ? "Heavy rainfall" : "Rainfall building"}
          </div>
          <div className="text-muted-foreground">Rainfall linked to rising flood pressure</div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>3h Risk</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">{Math.round(prob3h * 100)}%</CardTitle>
          <CardAction>
            <Badge variant="outline">Forecast</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div
            className={`flex gap-2 font-medium ${
              prob3h >= 0.7
                ? "text-destructive"
                : prob3h >= 0.4
                  ? "text-warning"
                  : "text-[color:var(--chart-2)]"
            }`}
          >
            <HugeiconsIcon icon={ChartHistogramIcon} strokeWidth={2} className="size-4" />
            {prob3h >= 0.7 ? "High risk" : prob3h >= 0.4 ? "Watch risk" : "Low risk"}
          </div>
          <div className="text-muted-foreground">3-hour flood probability from the model</div>
        </CardFooter>
      </Card>
    </div>
  );
}
