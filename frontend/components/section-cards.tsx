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

const statusTone: Record<AlertLevel, "secondary" | "destructive"> = {
  GREEN: "secondary",
  YELLOW: "secondary",
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
          <CardTitle className="text-3xl font-semibold tabular-nums">{alertLevel}</CardTitle>
          <CardAction>
            <Badge variant={statusTone[alertLevel]}>
              {statusLabel}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 font-medium text-foreground">
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />
            {station}
          </div>
          <div className="text-muted-foreground">Latest monitored station</div>
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
          <div className="flex gap-2 font-medium text-foreground">
            <HugeiconsIcon icon={Database01Icon} strokeWidth={2} className="size-4" />
            {waterLevelCm >= 400 ? "Above flood line" : "Below flood line"}
          </div>
          <div className="text-muted-foreground">Current gauge reading</div>
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
          <div className="flex gap-2 font-medium text-foreground">
            <HugeiconsIcon icon={ChartUpIcon} strokeWidth={2} className="size-4" />
            Intensifying rainfall
          </div>
          <div className="text-muted-foreground">Associated with rising alert pressure</div>
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
          <div className="flex gap-2 font-medium text-foreground">
            <HugeiconsIcon icon={ChartHistogramIcon} strokeWidth={2} className="size-4" />
            Short-term warning horizon
          </div>
          <div className="text-muted-foreground">Probability from the backend model</div>
        </CardFooter>
      </Card>
    </div>
  );
}
