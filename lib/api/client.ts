"use client";

import type { ApiResponse } from "@/lib/types";

type QueryPrimitive = string | number | boolean | null | undefined;
type QueryValue = QueryPrimitive | QueryPrimitive[];

export type ApiQueryParams = Record<string, QueryValue>;

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  params?: ApiQueryParams;
  body?: BodyInit | null;
}

export function buildSearchParams(params: ApiQueryParams = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== undefined && entry !== null && entry !== "") {
          searchParams.append(key, String(entry));
        }
      });
      return;
    }

    searchParams.append(key, String(value));
  });

  return searchParams;
}

function buildApiUrl(path: string, params?: ApiQueryParams) {
  const searchParams = buildSearchParams(params);
  const query = searchParams.toString();

  return query ? `${path}?${query}` : path;
}

async function parseApiResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  const result = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !result?.success) {
    throw new Error(result?.error?.message ?? fallbackMessage);
  }

  return result.data as T;
}

export async function apiRequest<T>(
  path: string,
  { params, ...init }: ApiRequestOptions = {},
  fallbackMessage = "요청을 처리하지 못했습니다",
) {
  const response = await fetch(buildApiUrl(path, params), init);
  return parseApiResponse<T>(response, fallbackMessage);
}

export function apiGet<T>(
  path: string,
  params?: ApiQueryParams,
  fallbackMessage?: string,
) {
  return apiRequest<T>(
    path,
    {
      method: "GET",
      params,
    },
    fallbackMessage,
  );
}

export function apiDelete<T>(path: string, fallbackMessage?: string) {
  return apiRequest<T>(
    path,
    {
      method: "DELETE",
    },
    fallbackMessage,
  );
}
