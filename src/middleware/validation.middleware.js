
import logger from "#src/utils/logger.js";


/**
 * Middleware to validate request body against a Zod schema
 */
export const validate = () => {
  return (req, res, next) => {
    logger.info("Validating")
    
    try {

      next();
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message,
      });
    }
  };
};

