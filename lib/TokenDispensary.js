const Token = require("./Token");

class TokenDispenary {
  constructor(input, filename) {
    this.input = input;
    this.filename = filename;
  }

  String(quoteType, predicate) {
    return new Token.String(
      quoteType,
      predicate,
      this.filename,
      this.input.line,
      this.input.col
    );
  }

  Punctuation(predicate) {
    return new Token.Punctuation(
      predicate,
      this.filename,
      this.input.line,
      this.input.col
    );
  }

  Keyword(identifier, type) {
    return new Token.Keyword(
      identifier,
      type,
      this.filename,
      this.input.line,
      this.input.col
    );
  }

  Number(value, isFloat, isNegative, isExponential) {
    return new Token.Number(
      value,
      isFloat,
      isNegative,
      isExponential,
      this.filename,
      this.input.line,
      this.input.col
    );
  }

  Operator(predicate) {
    return new Token.Operator(
      predicate,
      this.filename,
      this.input.line,
      this.input.col
    );
  }

  Boolean(value) {
    return new Token.Boolean(
      value,
      this.filename,
      this.input.line,
      this.input.col
    );
  }

  Program(value) {
    return new Token.Program(value, this.input.line, this.input.col);
  }

  Call(body, exprParser) {
    return new Token.Call(
      body,
      exprParser,
      this.filename,
      this.input.line,
      this.input.col
    );
  }

  Function(name, variables, body) {
    return new Token.Function(
      name,
      variables,
      body,
      this.filename,
      this.input.line,
      this.input.col
    );
  }

  Loop(type, name, cond, body) {
    return new Token.Loop(
      type,
      name,
      cond,
      body,
      this.filename,
      this.input.line,
      this.input.col
    );
  }

  Conditional(type, cond, then) {
    return new Token.Conditional(
      type,
      cond,
      then,
      this.filename,
      this.input.line,
      this.input.col
    );
  }

  Binary(type, op, left, right) {
    return new Token.Binary(
      type,
      op,
      left,
      right,
      this.filename,
      this.input.line,
      this.input.col
    );
  }

  PropertyAccessor(value) {
    return new Token.PropertyAccessor(
      value,
      this.filename,
      this.input.line,
      this.input.col
    );
  }
}

module.exports = TokenDispenary;
