// eslint-disable-next-line import/no-extraneous-dependencies
const moment = require('moment');

module.exports = [
  {
    paymentCode: 'U2FsdGVkX180W7K5HQ',
    transactionID: 'U2FsdGVkX180W7K5HQ',
    expiredAt: moment().add(5, 'minutes').toDate(),
  },
];
