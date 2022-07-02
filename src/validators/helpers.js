import { validationResult } from 'express-validator';

export function validateDate(date) {
  return isNaN(date) && !isNaN(Date.parse(date));
}

/**
 * Middleware used to stop routing and send out the listed errors
 * if there were any. If no errors have accumulated the request is routed onwards
 *
 * @param {Object} req request object
 * @param {Object} res response object
 * @param {Function} next next middleware
 * @returns The errors as a JSON response or the next middleware in the routing list
 */
export function validationCheck(req, res, next) {
  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const notFoundError = validation.errors.find(
      (error) => error.msg === 'not found'
    );
    const serverError = validation.errors.find(
      (error) => error.msg === 'server error'
    );
    const loginError = validation.errors.find(
      (error) => error.msg === 'username or password incorrect'
    );

    let status = 400;

    if (serverError) {
      status = 500;
    } else if (notFoundError) {
      status = 404;
    } else if (loginError) {
      status = 401;
    }

    const validationErrorsWithoutSkip = validation.errors.filter(
      (error) => error.msg !== 'skip'
    );

    return res.status(status).json({ errors: validationErrorsWithoutSkip });
  }

  return next();
}
