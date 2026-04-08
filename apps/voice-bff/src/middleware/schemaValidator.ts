import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export function schemaValidatorMiddleware(schema: object) {
  // compile() se ejecuta UNA sola vez cuando se carga el módulo (cold start).
  // La función validadora queda en memoria y se reutiliza en todos los warm starts.
  // Si estuviera dentro del before(), se recompilaría en cada request — innecesario y costoso.
  const validate = ajv.compile(schema);

  return {
    before: async (request: { event: { body: unknown }; response?: unknown }) => {
      const valid = validate(request.event.body);

      if (!valid) {
        request.response = {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'Validation failed',
            details: validate.errors?.map(e => ({
              field: e.instancePath || e.schemaPath,
              message: e.message,
            })),
          }),
        };
      }
    },
  };
}
