export function formatPrice(price: number, currency: string = 'FCFA'): string {
  return `${price.toLocaleString('fr-FR')} ${currency}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
