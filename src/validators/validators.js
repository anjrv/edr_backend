import { param } from 'express-validator';

import { validateDate } from './helpers.js';

// Example dayId: 2022-07-01
export const dayIdValidator = param('dayId').custom(
  async (_id, { req = {} }) => {
    const { dayId } = req.params;

    if (dayId.length == 10 && validateDate(dayId)) return Promise.resolve();

    return Promise.reject(new Error('dayId must be in the format yyyy-MM-dd'));
  }
);

// Example sessionId: 2022-07-02T12:31:02.225Z_SP1A.210812.016_shop
export const sessionIdValidator = param('sessionId').custom(
  async (_id, { req = {} }) => {
    const { sessionId } = req.params;

    // Return early if length makes no sense
    if (sessionId.length < 24 || sessionId.length > 64)
      return Promise.reject(new Error('Invalid session id'));

    const fields = sessionId.split('_');

    if (fields.length == 3 && fields[0].length == 24) return Promise.resolve();

    return Promise.reject(new Error('Invalid session id'));
  }
);
