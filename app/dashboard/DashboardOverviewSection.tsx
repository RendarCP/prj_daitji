"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Clock3,
  MapPin,
  Package,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardOverviewResponse } from "@/lib/types";
import { StatCardSkeleton } from "@/components/ui/Skeleton";

const TYPE_META = {
  FOOD: { label: "식품", color: "#4ade80" },
  COSMETIC: { label: "화장품", color: "#f472b6" },
  MEDICINE: { label: "의약품", color: "#38bdf8" },
  GENERAL: { label: "일반", color: "#fbbf24" },
} as const;

const EXPIRY_BUCKET_META = [
  { key: "expired", label: "만료됨", color: "#ef4444" },
  { key: "due_in_3_days", label: "3일 이내", color: "#fb923c" },
  { key: "due_in_7_days", label: "7일 이내", color: "#facc15" },
  { key: "safe", label: "안전", color: "#22c55e" },
] as const;

const LOCATION_COLORS = ["#38bdf8", "#4ade80", "#f59e0b", "#f472b6", "#a78bfa"];

function formatWeekLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function DashboardTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border bg-card px-3 py-2 shadow-soft">
      {label ? (
        <div className="mb-2 text-xs font-semibold text-muted-foreground">
          {label}
        </div>
      ) : null}
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div
            key={`${entry.name}-${index}`}
            className="flex items-center justify-between gap-4 text-sm"
          >
            <div className="flex items-center gap-2 text-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color || "#94a3b8" }}
              />
              <span>{entry.name}</span>
            </div>
            <span className="font-semibold text-foreground">
              {entry.value ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: number;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {title}
          </p>
          <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </div>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
            {hint}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-background p-2.5">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
      </div>
    </div>
  );
}

function ChartShell({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-border bg-card p-4 shadow-soft sm:p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground sm:text-lg">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          {summary}
        </p>
      </div>
      {children}
    </section>
  );
}

function MobileDistributionList({
  rows,
  total,
}: {
  rows: Array<{ label: string; count: number; color: string }>;
  total: number;
}) {
  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row) => {
        const percent = total > 0 ? Math.round((row.count / total) * 100) : 0;

        return (
          <div
            key={row.label}
            className="rounded-2xl border border-border bg-background px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: row.color }}
                />
                <span className="text-sm font-medium text-foreground">
                  {row.label}
                </span>
              </div>
              <div className="text-sm font-semibold text-foreground">
                {row.count}개
              </div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary/60">
              <div
                className="h-full rounded-full"
                style={{ width: `${percent}%`, backgroundColor: row.color }}
              />
            </div>
            <div className="mt-1.5 text-right text-xs text-muted-foreground">
              {percent}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MobileRankList({
  rows,
  valueLabel,
  accent = "item_count",
}: {
  rows: Array<{
    id: string;
    label: string;
    value: number;
    secondaryValue?: number;
  }>;
  valueLabel: string;
  accent?: "item_count" | "risk";
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  const barColor = accent === "risk" ? "#fb923c" : "#38bdf8";

  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row, index) => (
        <div
          key={row.id}
          className="rounded-2xl border border-border bg-background px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  #{index + 1}
                </span>
                <span className="truncate text-sm font-medium text-foreground">
                  {row.label}
                </span>
              </div>
              {typeof row.secondaryValue === "number" ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  만료 임박 {row.secondaryValue}개
                </div>
              ) : null}
            </div>
            <div className="shrink-0 text-sm font-semibold text-foreground">
              {row.value}
              {valueLabel}
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary/60">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max((row.value / max) * 100, 8)}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MobileStackedBar({
  rows,
}: {
  rows: Array<{ label: string; value: number; color: string }>;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className="md:hidden">
      <div className="flex h-3 overflow-hidden rounded-full bg-secondary/60">
        {rows.map((row) => {
          const width = total > 0 ? `${(row.value / total) * 100}%` : "25%";
          return (
            <div
              key={row.label}
              style={{ width, backgroundColor: row.color }}
            />
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-2xl border border-border bg-background px-4 py-3"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              {row.label}
            </div>
            <div className="mt-2 text-xl font-semibold text-foreground">
              {row.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileWeekBars({
  rows,
}: {
  rows: Array<{ label: string; count: number }>;
}) {
  const max = Math.max(...rows.map((row) => row.count), 1);

  return (
    <div className="md:hidden">
      <div className="flex items-end gap-2 overflow-x-auto pb-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex min-w-[34px] flex-col items-center gap-2"
          >
            <div className="text-[11px] font-medium text-foreground">
              {row.count}
            </div>
            <div className="flex h-28 w-7 items-end rounded-2xl bg-secondary/60 p-1">
              <div
                className="w-full rounded-xl bg-primary"
                style={{
                  height: `${Math.max((row.count / max) * 100, row.count > 0 ? 12 : 6)}%`,
                }}
              />
            </div>
            <div className="text-[11px] text-muted-foreground">{row.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardOverviewSection({
  stats,
}: {
  stats: DashboardOverviewResponse;
}) {
  const totalTypeCount = stats.by_type.reduce(
    (sum, item) => sum + item.count,
    0,
  );
  const typeChartData = stats.by_type.map((entry) => ({
    ...entry,
    label: TYPE_META[entry.type].label,
    color: TYPE_META[entry.type].color,
  }));
  const leadingType =
    [...stats.by_type].sort((a, b) => b.count - a.count)[0] ?? stats.by_type[0];
  const leadingTypeMeta = TYPE_META[leadingType?.type ?? "GENERAL"];
  const leadingTypeRatio =
    totalTypeCount > 0
      ? Math.round(((leadingType?.count ?? 0) / totalTypeCount) * 100)
      : 0;

  const locationChartData =
    stats.by_location.length > 0
      ? stats.by_location.map((location) => ({
          ...location,
          short_name:
            location.location_name.length > 7
              ? `${location.location_name.slice(0, 7)}…`
              : location.location_name,
        }))
      : [
          {
            location_id: "empty",
            location_name: "데이터 없음",
            short_name: "데이터 없음",
            item_count: 0,
            expiring_soon_count: 0,
            level: 0,
          },
        ];

  const expiryChartData = EXPIRY_BUCKET_META.map((bucket) => ({
    ...bucket,
    value: stats.expiry_buckets[bucket.key],
  }));
  const recentAddedData =
    stats.recent_added_by_week.length > 0
      ? stats.recent_added_by_week.map((entry) => ({
          ...entry,
          label: formatWeekLabel(entry.week_start),
        }))
      : [{ week_start: "", count: 0, label: "-" }];
  const eightWeekTotal = stats.recent_added_by_week.reduce(
    (sum, entry) => sum + entry.count,
    0,
  );

  const mobileLocationRows = locationChartData.map((location) => ({
    id: location.location_id,
    label: location.location_name,
    value: location.item_count,
    secondaryValue: location.expiring_soon_count,
  }));

  return (
    <section
      className="mb-8 animate-fade-in"
      style={{ animationDelay: "60ms" }}
    >
      <section className="rounded-[28px] border border-border bg-card p-4 shadow-soft sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              집 안 재고를 빠르게 확인
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              모바일에서는 한 번에 다 보이기보다, 바로 해석되는 숫자와 랭킹
              위주로 정리했습니다.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
          <MetricCard
            title="전체 물품"
            value={stats.total_items}
            hint="등록된 전체 개수"
            icon={Boxes}
          />
          <MetricCard
            title="활성 물품"
            value={stats.active_items}
            hint="현재 관리 중"
            icon={Package}
          />
          <MetricCard
            title="만료 임박"
            value={stats.expiring_soon}
            hint="7일 이내 확인 필요"
            icon={Clock3}
          />
          <MetricCard
            title="만료됨"
            value={stats.expired}
            hint="바로 정리 권장"
            icon={AlertTriangle}
          />
          <MetricCard
            title="위치 수"
            value={stats.locations_count}
            hint="보관 장소 개수"
            icon={MapPin}
          />
          <MetricCard
            title="재고 부족"
            value={stats.low_stock_count}
            hint="기준 이하 수량"
            icon={BarChart3}
          />
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <ChartShell
          title="물품 타입 분포"
          summary={`${leadingTypeMeta.label} 비중 ${leadingTypeRatio}%로 가장 큽니다.`}
        >
          <MobileDistributionList rows={typeChartData} total={totalTypeCount} />

          <div className="hidden gap-4 md:grid md:grid-cols-[1fr_220px] md:items-center">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeChartData}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={58}
                    outerRadius={84}
                    paddingAngle={4}
                    stroke="rgba(15, 23, 42, 0.18)"
                    strokeWidth={2}
                  >
                    {typeChartData.map((entry) => (
                      <Cell key={entry.type} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<DashboardTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {typeChartData.map((entry) => {
                const percent =
                  totalTypeCount > 0
                    ? Math.round((entry.count / totalTypeCount) * 100)
                    : 0;

                return (
                  <div
                    key={entry.type}
                    className="rounded-2xl border border-border bg-background px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {entry.label}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {percent}% 비중
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-foreground">
                        {entry.count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ChartShell>

        <ChartShell
          title="위치별 보관량"
          summary={
            stats.highlights.busiest_location
              ? `${stats.highlights.busiest_location.location_name}에 ${stats.highlights.busiest_location.item_count}개가 있습니다.`
              : "아직 집계할 물품이 없습니다."
          }
        >
          <MobileRankList rows={mobileLocationRows} valueLabel="개" />

          <div className="hidden md:block">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={locationChartData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="rgba(148, 163, 184, 0.12)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="short_name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <Tooltip
                    content={<DashboardTooltip />}
                    labelFormatter={(
                      _label,
                      payload: ReadonlyArray<{
                        payload?: { location_name?: string };
                      }>,
                    ) =>
                      payload[0]?.payload?.location_name
                        ? String(payload[0].payload.location_name)
                        : ""
                    }
                  />
                  <Bar
                    dataKey="item_count"
                    name="물품 수"
                    radius={[10, 10, 0, 0]}
                    fill="#38bdf8"
                  />
                  <Bar
                    dataKey="expiring_soon_count"
                    name="만료 임박"
                    radius={[10, 10, 0, 0]}
                    fill="#fb923c"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartShell>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <ChartShell
          title="만료 리스크 분포"
          summary={`${stats.expired + stats.expiring_soon}개가 우선 확인 대상입니다.`}
        >
          <MobileStackedBar rows={expiryChartData} />

          <div className="hidden space-y-4 md:block">
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={expiryChartData}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 8, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="rgba(148, 163, 184, 0.12)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#cbd5e1", fontSize: 12 }}
                    width={68}
                  />
                  <Tooltip content={<DashboardTooltip />} />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                    {expiryChartData.map((entry) => (
                      <Cell key={entry.key} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {expiryChartData.map((entry) => (
                <div
                  key={entry.key}
                  className="rounded-2xl border border-border bg-background px-4 py-3"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    {entry.label}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-foreground">
                    {entry.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartShell>

        <ChartShell
          title="최근 등록 추이"
          summary={`최근 8주 동안 ${eightWeekTotal}개가 새로 등록되었습니다.`}
        >
          <MobileWeekBars
            rows={recentAddedData.map((entry) => ({
              label: entry.label,
              count: entry.count,
            }))}
          />

          <div className="hidden md:block">
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={recentAddedData}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    stroke="rgba(148, 163, 184, 0.12)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <Tooltip
                    content={<DashboardTooltip />}
                    labelFormatter={(value) => `${value} 시작 주`}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartShell>
      </div>

      {/* <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-[24px] border border-border bg-card p-4 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            가장 물품이 많은 위치
          </div>
          <div className="mt-4 text-xl font-semibold text-foreground">
            {stats.highlights.busiest_location?.location_name ?? "아직 없음"}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {stats.highlights.busiest_location
              ? `${stats.highlights.busiest_location.item_count}개 보관 중`
              : "위치 집계 데이터가 쌓이면 여기에 표시됩니다."}
          </p>
        </div>

        <div className="rounded-[24px] border border-border bg-card p-4 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            만료 위험이 큰 위치
          </div>
          <div className="mt-4 text-xl font-semibold text-foreground">
            {stats.highlights.highest_risk_location?.location_name ?? "위험 낮음"}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {stats.highlights.highest_risk_location
              ? `${stats.highlights.highest_risk_location.expiring_soon_count}개가 7일 이내`
              : "현재는 급한 만료 위험 위치가 없습니다."}
          </p>
        </div>

        <div className="rounded-[24px] border border-border bg-card p-4 shadow-soft">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            재고 부족 품목 수
          </div>
          <div className="mt-4 text-xl font-semibold text-foreground">{stats.low_stock_count}개</div>
          <p className="mt-2 text-sm text-muted-foreground">
            기본 또는 개별 임계치 이하인 물품만 집계합니다.
          </p>
        </div>
      </div> */}
    </section>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <section className="mb-8">
      <div className="rounded-[28px] border border-border bg-card p-4 shadow-soft sm:p-5">
        <div className="h-3 w-32 animate-pulse rounded bg-secondary/30" />
        <div className="mt-3 h-8 w-56 animate-pulse rounded bg-secondary/30" />
        <div className="mt-3 h-4 w-full max-w-xl animate-pulse rounded bg-secondary/30" />
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[28px] border border-border bg-card p-5 shadow-soft"
          >
            <div className="h-6 w-32 animate-pulse rounded bg-secondary/30" />
            <div className="mt-2 h-4 w-48 animate-pulse rounded bg-secondary/30" />
            <div className="mt-6 h-[220px] animate-pulse rounded-3xl bg-secondary/20" />
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[24px] border border-border bg-card p-4 shadow-soft"
          >
            <div className="h-3 w-28 animate-pulse rounded bg-secondary/30" />
            <div className="mt-4 h-7 w-24 animate-pulse rounded bg-secondary/30" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-secondary/30" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function LocationStructureSection({
  stats,
}: {
  stats: DashboardOverviewResponse;
}) {
  const locationData = stats.by_location.map((location, index) => ({
    ...location,
    color: LOCATION_COLORS[index % LOCATION_COLORS.length],
  }));
  const totalItems = locationData.reduce((sum, location) => sum + location.item_count, 0);
  const busiestLocation = locationData[0];

  if (locationData.length === 0) {
    return (
      <section className="mb-6 rounded-[28px] border border-border bg-card p-4 shadow-soft sm:p-5">
        <h2 className="text-xl font-bold text-foreground">우리집 위치 구조</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          위치별 분포를 그리려면 먼저 위치와 물품을 등록해보세요.
        </p>
      </section>
    );
  }

  return (
    <section
      className="mb-6 animate-fade-in rounded-[28px] border border-border bg-card p-4 shadow-soft sm:p-5"
      style={{ animationDelay: "150ms" }}
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">우리집 위치 구조</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {busiestLocation
            ? `${busiestLocation.location_name} 비중이 가장 큽니다.`
            : "위치별 물품 분포를 보여줍니다."}
        </p>
      </div>

      <div className="rounded-[24px] border border-border bg-background px-3 pb-4 pt-5">
        <div className="relative h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={locationData}
                dataKey="item_count"
                nameKey="location_name"
                startAngle={180}
                endAngle={0}
                cx="50%"
                cy="100%"
                innerRadius={64}
                outerRadius={92}
                paddingAngle={3}
                stroke="rgba(15, 23, 42, 0.18)"
                strokeWidth={2}
              >
                {locationData.map((entry) => (
                  <Cell key={entry.location_id} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<DashboardTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              총 보관 수
            </div>
            <div className="mt-1 text-3xl font-semibold text-foreground">{totalItems}</div>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          {locationData.map((location) => {
            const percent = totalItems > 0 ? Math.round((location.item_count / totalItems) * 100) : 0;

            return (
              <div
                key={location.location_id}
                className="rounded-2xl border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: location.color }}
                      />
                      <span className="truncate text-sm font-medium text-foreground">
                        {location.location_name}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      만료 임박 {location.expiring_soon_count}개
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold text-foreground">
                      {location.item_count}개
                    </div>
                    <div className="text-xs text-muted-foreground">{percent}%</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
