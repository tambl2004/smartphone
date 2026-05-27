export type ListQuery = {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filter?: Record<string, string>;
};

export const parsePositiveInt = (value: unknown, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
};

export const parseListQuery = (query: Record<string, unknown>): ListQuery => {
  const { page, limit, search, sortBy, sortOrder, ...rest } = query;
  const filter: Record<string, string> = {};

  for (const [key, value] of Object.entries(rest)) {
    if (typeof value === 'string' && value.length > 0) {
      filter[key] = value;
    }
  }

  return {
    page: parsePositiveInt(page, 1),
    limit: parsePositiveInt(limit, 10),
    search: typeof search === 'string' && search.length > 0 ? search : undefined,
    sortBy: typeof sortBy === 'string' && sortBy.length > 0 ? sortBy : undefined,
    sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : 'desc',
    filter,
  };
};
