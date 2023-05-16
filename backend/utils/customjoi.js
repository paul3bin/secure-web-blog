const Joi = require("joi");
const sanitizeHtml = require("sanitize-html");

module.exports = Joi.extend((joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "Bad Request",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
}));
