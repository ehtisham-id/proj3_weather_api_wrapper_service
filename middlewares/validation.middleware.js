module.exports = function validate(schema) {
  return (req, res, next) => {
    const data = {
      ...req.body,
      ...req.query,
      ...req.params
    };

    const { error, value } = schema.validate(data, {
      abortEarly: false
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message
      }));
      return next;
    }

    req.validated = value;
    next;
  };
};
