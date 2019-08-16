export function getFormattedColumnName(name: string) {
  return name
    .split(' ')
    .join('_')
    .toUpperCase();
}
