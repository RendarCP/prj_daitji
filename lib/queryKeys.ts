export const queryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => ['dashboard', 'stats'] as const,
  },
  items: {
    all: ['items'] as const,
    list: (
      params: {
        location_id?: string | null
        filter?: string
      } = {}
    ) => ['items', params] as const,
    recent: () => ['items', 'recent'] as const,
    expiring: () => ['items', 'expiring'] as const,
    detail: (id: string | null) => ['item', 'detail', id] as const,
  },
  locations: {
    all: ['locations'] as const,
    list: (
      params: {
        tree?: boolean
        parent_id?: string | null
      } = {}
    ) => ['locations', params] as const,
    summary: () => ['locations', 'summary'] as const,
    path: (locationId: string | null) => ['location-path', locationId] as const,
  },
}
