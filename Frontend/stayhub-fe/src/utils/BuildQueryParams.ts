/**
 * Converts a flat object into URLSearchParams, 
 * handling arrays for repeated keys and removing empty/null values.
 */
export default function buildQueryParams<T extends Record<string, any>>(params: T): URLSearchParams {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    // 1. Skip null or undefined
    if (value === null || value === undefined) return;

    // 2. Handle Arrays (e.g., roles: ['ADMIN', 'MANAGER'])
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined && item !== "") {
          searchParams.append(key, String(item));
        }
      });
    } 
    // 3. Handle Empty Strings
    else if (value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams;
}