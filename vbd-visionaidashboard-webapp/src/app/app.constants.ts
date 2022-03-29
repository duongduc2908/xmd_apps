/* eslint-disable */
export const CONST = Object.freeze({
  URL: {
    BASE: 'http://0.0.0.0:8000/api',
  },
  TIME_RANGE_MANUAL_ID: 999999999999,
  DATE_INPUT_FORMAT: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/],
  MAT_DATE_FORMATS: {
    parse: {
      dateInput: 'DD/MM/YYYY',
    },
    display: {
      dateInput: 'DD/MM/YYYY',
      monthYearLabel: 'MMM YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MMMM YYYY'
    },
  },
  DATE_FORMAT: 'DD/MM/YYYY'
});
