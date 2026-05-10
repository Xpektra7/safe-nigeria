import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, ChartHistogramIcon, ChartUpIcon, Database01Icon } from "@hugeicons/core-free-icons";

type AlertLevel = "GREEN" | "YELLOW" | "RED";

const FLOOD_LINE_CM = 400;
const WATCH_LINE_CM = 370;
const HEAVY_RAIN_MM = 40;
const WATCH_RAIN_MM = 15;
const HIGH_RISK = 0.7;
const WATCH_RISK = 0.4;

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
  const waterTone =
    waterLevelCm >= FLOOD_LINE_CM
      ? "text-flood-danger"
      : waterLevelCm >= WATCH_LINE_CM
        ? "text-flood-watch"
        : "text-flood-safe";

  const rainfallTone =
    rainfallMm >= HEAVY_RAIN_MM
      ? "text-flood-danger"
      : rainfallMm >= WATCH_RAIN_MM
        ? "text-flood-watch"
        : "text-flood-safe";

  const riskTone =
    prob3h >= HIGH_RISK
      ? "text-flood-danger"
      : prob3h >= WATCH_RISK
        ? "text-flood-watch"
        : "text-flood-safe";

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 xl:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Alert Level</CardDescription>
          <CardTitle
            className={`text-3xl font-semibold tabular-nums ${
              alertLevel === "RED"
                ? "text-flood-danger"
                : alertLevel === "YELLOW"
                  ? "text-flood-watch"
                  : "text-flood-safe"
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
                ? "text-flood-danger"
                : alertLevel === "YELLOW"
                  ? "text-flood-watch"
                  : "text-flood-safe"
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
          <CardTitle className={`text-3xl font-semibold tabular-nums ${waterTone}`}>
            {waterLevelCm} cm
          </CardTitle>
          <CardAction>
            <Badge variant={waterLevelCm >= FLOOD_LINE_CM ? "destructive" : waterLevelCm >= WATCH_LINE_CM ? "warning" : "outline"}>
              {waterLevelCm >= FLOOD_LINE_CM ? "Above flood line" : waterLevelCm >= WATCH_LINE_CM ? "Close to flood line" : "Below flood line"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className={`flex gap-2 font-medium ${waterTone}`}>
            <HugeiconsIcon icon={Database01Icon} strokeWidth={2} className="size-4" />
            {waterLevelCm >= FLOOD_LINE_CM
              ? "Immediate flood concern"
              : waterLevelCm >= WATCH_LINE_CM
                ? "Watching the river rise"
                : "River level is manageable"}
          </div>
          <div className="text-muted-foreground">Current river gauge reading</div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Rainfall</CardDescription>
          <CardTitle className={`text-3xl font-semibold tabular-nums ${rainfallTone}`}>
            {rainfallMm.toFixed(1)} mm
          </CardTitle>
          <CardAction>
            <Badge variant={rainfallMm >= HEAVY_RAIN_MM ? "destructive" : rainfallMm >= WATCH_RAIN_MM ? "warning" : "outline"}>
              {rainfallMm >= HEAVY_RAIN_MM ? "Heavy rain" : rainfallMm >= WATCH_RAIN_MM ? "Building up" : "Light rain"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className={`flex gap-2 font-medium ${rainfallTone}`}>
            <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} className="size-4" />
            {rainfallMm >= HEAVY_RAIN_MM
              ? "Rainfall is intense"
              : rainfallMm >= WATCH_RAIN_MM
                ? "Rainfall is increasing"
                : "Rainfall is low"}
          </div>
          <div className="text-muted-foreground">Rainfall linked to rising flood pressure</div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>3h Risk</CardDescription>
          <CardTitle className={`text-3xl font-semibold tabular-nums ${riskTone}`}>
            {Math.round(prob3h * 100)}%
          </CardTitle>
          <CardAction>
            <Badge variant={prob3h >= HIGH_RISK ? "destructive" : prob3h >= WATCH_RISK ? "warning" : "outline"}>
              {prob3h >= HIGH_RISK ? "High risk" : prob3h >= WATCH_RISK ? "Watch closely" : "Low risk"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className={`flex gap-2 font-medium ${riskTone}`}>
            <HugeiconsIcon icon={ChartHistogramIcon} strokeWidth={2} className="size-4" />
            {prob3h >= HIGH_RISK
              ? "Flood risk is high"
              : prob3h >= WATCH_RISK
                ? "Flood risk is rising"
                : "Flood risk is low"}
          </div>
          <div className="text-muted-foreground">3-hour flood probability from the model</div>
        </CardFooter>
      </Card>
    </div>
  );
}
