const priceFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
});

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'medium',
});

export const formatPrice = (price: number): string => {
  return priceFormatter.format(price);
};

export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return dateFormatter.format(date);
};
