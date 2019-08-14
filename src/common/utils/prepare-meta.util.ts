export function prepareMeta(
  currentPage: number,
  limit: number,
  total_records: number,
) {
  const meta = {
    page: +currentPage,
    per_page: limit,
    total_pages: parseInt((total_records / limit + 1).toFixed()),
    total_records,
  };

  return meta;
}
