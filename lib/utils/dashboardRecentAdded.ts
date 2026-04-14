import type { DashboardRecentAddedPoint } from "@/lib/types";

const DEFAULT_BUCKET_COUNT = 8;

interface RecentItemLike {
  created_at: string | null;
}

interface MonthWeekBucket {
  year: number;
  month: number;
  week_of_month: number;
}

function getWeeksInMonth(year: number, month: number) {
  return Math.ceil(new Date(year, month, 0).getDate() / 7);
}

function getBucketStartDate(bucket: MonthWeekBucket) {
  return new Date(
    bucket.year,
    bucket.month - 1,
    (bucket.week_of_month - 1) * 7 + 1,
    0,
    0,
    0,
    0,
  );
}

function formatBucketLabel(bucket: MonthWeekBucket) {
  return `${bucket.month}월 ${bucket.week_of_month}주차`;
}

function getMonthWeekBucket(date: Date): MonthWeekBucket {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    week_of_month: Math.floor((date.getDate() - 1) / 7) + 1,
  };
}

function getBucketKey(bucket: MonthWeekBucket) {
  return `${bucket.year}-${String(bucket.month).padStart(2, "0")}-${bucket.week_of_month}`;
}

function getPreviousBucket(bucket: MonthWeekBucket): MonthWeekBucket {
  if (bucket.week_of_month > 1) {
    return {
      ...bucket,
      week_of_month: bucket.week_of_month - 1,
    };
  }

  const previousMonthDate = new Date(bucket.year, bucket.month - 2, 1);
  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = previousMonthDate.getMonth() + 1;

  return {
    year: previousYear,
    month: previousMonth,
    week_of_month: getWeeksInMonth(previousYear, previousMonth),
  };
}

export function getRecentAddedWindowStart(now: Date = new Date(), bucketCount = DEFAULT_BUCKET_COUNT) {
  let bucket = getMonthWeekBucket(now);

  for (let index = 1; index < bucketCount; index += 1) {
    bucket = getPreviousBucket(bucket);
  }

  return getBucketStartDate(bucket);
}

export function buildRecentAddedByMonthWeek(
  recentItems: RecentItemLike[],
  now: Date = new Date(),
  bucketCount = DEFAULT_BUCKET_COUNT,
): DashboardRecentAddedPoint[] {
  const buckets: MonthWeekBucket[] = [];
  let currentBucket = getMonthWeekBucket(now);

  for (let index = 0; index < bucketCount; index += 1) {
    buckets.unshift(currentBucket);
    currentBucket = getPreviousBucket(currentBucket);
  }

  const bucketMap = new Map<string, DashboardRecentAddedPoint>(
    buckets.map((bucket) => {
      const key = getBucketKey(bucket);

      return [
        key,
        {
          ...bucket,
          label: formatBucketLabel(bucket),
          count: 0,
        },
      ];
    }),
  );

  for (const item of recentItems) {
    if (!item.created_at) {
      continue;
    }

    const createdAt = new Date(item.created_at);
    if (Number.isNaN(createdAt.getTime())) {
      continue;
    }

    const bucket = getMonthWeekBucket(createdAt);
    const key = getBucketKey(bucket);
    const existing = bucketMap.get(key);

    if (existing) {
      existing.count += 1;
    }
  }

  return Array.from(bucketMap.values());
}
