export const formatDate = (dateString: string, locale: string = 'en-US') => {
  const localeMap: { [key: string]: string } = {
    fr: 'fr-FR',
    es: 'es-ES',
    en: 'en-US'
  };

  const targetLocale = localeMap[locale] || 'en-US';

  return new Date(dateString).toLocaleDateString(targetLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatAmount = (amount: any, currency: string = '€') => {
  if (amount === null || amount === undefined) return `0.00 ${currency}`;
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(numAmount) ? `0.00 ${currency}` : `${numAmount.toFixed(2)} ${currency}`;
};

export const formatAmountWithoutCurrency = (amount: any) => {
  if (amount === null || amount === undefined) return '0.00';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
};

export const formatDateTime = (dateString: string, locale: string = 'en-US') => {
  const localeMap: { [key: string]: string } = {
    fr: 'fr-FR',
    es: 'es-ES',
    en: 'en-US'
  };

  const targetLocale = localeMap[locale] || 'en-US';

  return new Date(dateString).toLocaleString(targetLocale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 