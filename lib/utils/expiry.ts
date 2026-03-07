type ItemType = "FOOD" | "COSMETIC" | "MEDICINE" | "GENERAL";

function toIsoDate(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().split("T")[0];
}

function addMonthsToDate(dateIso: string, months: number): string | null {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const cloned = new Date(date);
  cloned.setUTCMonth(cloned.getUTCMonth() + months);
  return cloned.toISOString().split("T")[0];
}

export function computeItemExpiryDate(type: ItemType, metadata: unknown): string | null {
  const data = (metadata ?? {}) as Record<string, unknown>;

  if (type === "FOOD" || type === "MEDICINE") {
    return toIsoDate(data.expiry_date);
  }

  if (type === "COSMETIC") {
    const openedDate = toIsoDate(data.opened_date);
    if (!openedDate) {
      return null;
    }

    const rawPao = data.pao;
    const pao = typeof rawPao === "number" && Number.isFinite(rawPao) ? rawPao : 12;
    return addMonthsToDate(openedDate, Math.max(0, Math.floor(pao)));
  }

  return null;
}

export function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) {
    return null;
  }

  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const target = new Date(expiryDate);
  if (Number.isNaN(target.getTime())) {
    return null;
  }

  const targetUtc = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate(),
  );

  return Math.floor((targetUtc - todayUtc) / (1000 * 60 * 60 * 24));
}
