import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({coerceTypes: true, allErrors: true});
addFormats(ajv);

export const ValidationErrorResponse = {
  description: "Bad request",
  content: {
    "application/json": {
      schema: {
        type: "array",
        items: {
          type: "object",
          required: [ "type", "path", "message" ],

          properties: {
            type: { type: "string", enum: [ "parameter", "body" ] },
            path: { type: "string", },
            message: { type: "string", },
          },
        }
      },
    },
  },
};

const getParameterValue = (ctx, paramSpec) => {
  switch (paramSpec.in) {
    case "query":
      return ctx.request.query[paramSpec.name];
    case "path":
      return ctx.request.params[paramSpec.name];
    case "header":
      return ctx.request.headers[paramSpec.name];
    case "cookie":
      return ctx.cookies.get(paramSpec.name);
  }
};

const validateParameter = (ctx, paramSpec) => {
  const paramValue = getParameterValue(ctx, paramSpec);

  if (paramSpec.required && !paramValue) {
    return [{
      type: "parameter",
      path: paramSpec.name,
      message: `is required`,
    }];
  }

  if (paramValue) {
    const validate = ajv.compile(paramSpec.schema);

    if (!validate(paramValue)) {
      return validate.errors.map((error) => ({
        type: "parameter",
        path: paramSpec.name,
        message: error.message,
        extraInfo: error.params,
      }));
    }
  }

  return [];
};

const validateBody = (request, bodySpec) => {
  if (!bodySpec) {
    return [];
  }

  const mediaTypeSpec = bodySpec.content[request.type];
  if (!mediaTypeSpec) {
    return [{
      type: "body",
      message: `Request content-type ${request.type} is not supported`,
    }];
  }

  if (bodySpec.required || !request.body) {
    return [{
      type: "body",
      message: "is required",
    }];
  }

  if (request.body) {
    const validate = ajv.compile(mediaTypeSpec.schema);

    if (!validate(request.body)) {

      return validate.errors.map((error) => ({
        type: "body",
        path: error.instancePath,
        message: error.message,
        extraInfo: error.params,
      }));
    }
  }

  return [];
};

export function requestValidationMiddleware(operationSpec) {
  return (ctx, next) => {
    const parametersSpec = operationSpec.parameters || [];
    const parametersErrors = parametersSpec.flatMap(
    (paramSpec) => validateParameter(ctx, paramSpec)
  );

    const bodySpec = operationSpec.requestBody;
    const bodyErrors = validateBody(ctx.request, bodySpec);

    const errors = [...parametersErrors, ...bodyErrors];

    if (errors.length > 0) {
      ctx.status = 422;
      ctx.body = errors;
      return;
    }

    return next();
  }
}
