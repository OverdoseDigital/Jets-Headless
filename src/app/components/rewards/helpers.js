const dateTimeFormatter = new Intl.DateTimeFormat(window.theme.locale.isoCode, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

// Needs design confirmation as to whether this needs to be differnet.
const dateTimeFormatterLong = new Intl.DateTimeFormat(window.theme.locale.isoCode, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const getLimitsFromYearlySpendMessage = (message = '') => message.split('-').map(substring => substring.replace(/\D/g,''))

export { dateTimeFormatter, dateTimeFormatterLong, getLimitsFromYearlySpendMessage }
