class BaseToken {
  constructor(tokenType, filename, line, col) {
    this.tokenType = tokenType;
    this.filename = filename;
    this.line = line;
    this.col = col;
  }

  getType() {
    return this.tokenType.toUpperCase();
  }
}

exports.String = class STRING extends BaseToken {
  constructor(quoteType, predicate, filename, line, col) {
    super("String", filename, line, col);

    this.type = "str";
    this.value = predicate(quoteType);
    this.quoteType = quoteType;
  }
};

exports.Punctuation = class PUNCTUATION extends BaseToken {
  constructor(predicate, filename, line, col) {
    super("Punctutation", filename, line, col);

    this.type = "punc";
    this.value = predicate();
  }
};

exports.Keyword = class KEYWORD extends BaseToken {
  constructor(identifier, type, filename, line, col) {
    super("Keyword", filename, line, col);

    this.type = type;
    this.value = identifier;
  }
};

exports.Number = class NUMBER extends BaseToken {
  constructor(value, isFloat, isNegative, isExponential, filename, line, col) {
    super("Number", filename, line, col);

    this.type = "num";
    this.value = parseFloat(value);
    this.isFloat = isFloat;
    this.isNegative = isNegative;
    this.isExponential = isExponential;
  }
};

exports.Operator = class OPERATOR extends BaseToken {
  constructor(predicate, filename, line, col) {
    super("Operator", filename, line, col);

    this.type = "op";
    this.value = predicate();
  }
};

exports.Boolean = class BOOLEAN extends BaseToken {
  constructor(value, filename, line, col) {
    super("Bool", filename, line, col);

    this.type = "bool";
    this.value = value;
  }
};

exports.Program = class PROGRAM extends BaseToken {
  constructor(value, filename, line, col) {
    super("Prog", filename, line, col);

    this.type = "prog";
    this.value = value;
  }
};

exports.Call = class CALL extends BaseToken {
  constructor(body, exprParser, filename, line, col) {
    super("Call", filename, line, col);

    this.type = "call";
    this.body = body;
    this.args = this.delimited("(", ")", ",", exprParser);
  }
};

exports.Function = class FUNCTION extends BaseToken {
  constructor(name, variables, body, filename, line, col) {
    super("Function", filename, line, col);

    this.type = "func";
    this.name = name;
    this.vars = variables;
    this.body = body;
  }
};

exports.Loop = class LOOP extends BaseToken {
  constructor(type, name, cond, body, filename, line, col) {
    super("Loop", filename, line, col);

    this.type = type;
    this.name = name;
    this.cond = cond;
    this.body = body;
  }
};

exports.Conditional = class CONDITIONAL extends BaseToken {
  constructor(type, cond, then, filename, line, col) {
    super("Conditional", filename, line, col);

    this.type = type;
    this.cond = cond;
    this.then = then;
  }
};

exports.Binary = class BINARY extends BaseToken {
  constructor(type, op, left, right, filename, line, col) {
    super("Binary", filename, line, col);

    this.type = type;
    this.op = op;
    this.left = left;
    this.right = right;
  }
};

exports.PropertyAccessor = class ACCESSOR extends BaseToken {
  constructor(value, filename, line, col) {
    super("Accessor", filename, line, col);
    this.type = "accessor";
    this.value = value;
    this.notation = value === "." ? "dot" : "bracket";
  }
};
