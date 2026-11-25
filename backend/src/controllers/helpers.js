export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function fail(statusCode, message) {
  throw new HttpError(statusCode, message);
}

export function has(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function bodyObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    fail(400, 'Corpo da requisição inválido.');
  }
  return body;
}

export function requiredText(value, field, maxLength = 255) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(400, `O campo ${field} é obrigatório.`);
  }
  const text = value.trim();
  if (text.length > maxLength) {
    fail(400, `O campo ${field} deve ter no máximo ${maxLength} caracteres.`);
  }
  return text;
}

export function optionalText(value, field, maxLength = 255) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return requiredText(value, field, maxLength);
}

export function validEmail(value, field, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) {
      fail(400, `O campo ${field} é obrigatório.`);
    }
    return null;
  }
  const text = String(value).trim();
  if (text.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    fail(400, `O campo ${field} deve conter um e-mail válido.`);
  }
  return text;
}

export function validId(value, field, { required = true } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) {
      fail(400, `O campo ${field} é obrigatório.`);
    }
    return null;
  }
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    fail(400, `O campo ${field} deve ser um número inteiro positivo.`);
  }
  return id;
}

export function validEnum(value, field, allowed, { defaultValue } = {}) {
  if (value === undefined || value === null || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    fail(400, `O campo ${field} é obrigatório.`);
  }
  const text = String(value).trim();
  if (!allowed.includes(text)) {
    fail(400, `O campo ${field} deve ser um de: ${allowed.join(', ')}.`);
  }
  return text;
}

export function withErrorHandling(handler) {
  return async (request, reply) => {
    try {
      return await handler(request, reply);
    } catch (error) {
      if (error instanceof HttpError) {
        return reply.code(error.statusCode).send({ error: error.message });
      }
      if (error?.code === 'ER_DUP_ENTRY') {
        return reply.code(409).send({ error: 'Registro duplicado. Verifique os dados informados.' });
      }
      if (error?.code === 'ER_NO_REFERENCED_ROW_2') {
        return reply.code(400).send({ error: 'Registro relacionado não encontrado.' });
      }
      if (error?.code === 'ER_ROW_IS_REFERENCED_2') {
        return reply.code(409).send({ error: 'Não é possível excluir este registro porque existem chamados vinculados.' });
      }
      throw error;
    }
  };
}
