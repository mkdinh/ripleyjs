const InputStream = require("./InputStream");
const TokenStream = require("./TokenStream");
const Token = require("./Token");

class Parser {
  constructor(input = "") {
    this.currentNode = null;

    if (!input || typeof input === "string") {
      this.input = new TokenStream(new InputStream(input));
    } else {
      this.input = input;
    }

    this.croak = this.input.croak;

    this.FALSE = new Token.Boolean(false);
    this.TRUE = new Token.Boolean(true);

    this.PRECEDENCE = {
      "=": 1,
      "+=": 1,
      "-=": 1,
      "*=": 1,
      "/=": 1,
      "||": 2,
      "&&": 3,
      "<": 7,
      ">": 7,
      "<=": 7,
      ">=": 7,
      "==": 7,
      "===": 7,
      "!=": 7,
      "~=": 7,
      ":": 8,
      "+": 10,
      "-": 10,
      "*": 20,
      "/": 20,
      "%": 20
    };
  }

  parse() {
    const ast = this.parseTopLevel();
    return ast;
  }

  // Parser
  //--------------------------------------------------------
  // these methods handle the main parsing logic
  // recursively building an abstract syntax tree

  // high level parsing logic
  // update context for other parsing method
  parseTopLevel() {
    const prog = [];
    while (!this.input.eof()) {
      const expr = this.parseExpression();
      this.currentNode = expr;
      if (expr) {
        prog.push(expr);
      }
    }
    return new Token.Program(prog);
  }

  // parse body of a function
  parseExpression() {
    return this.maybeCall(() => {
      return this.maybeBinary(this.parseAtom(), 0);
    });
  }

  // low-level parsing logic
  // responsible for tokenizing different types
  parseAtom() {
    return this.maybeCall(() => {
      if (this.isPunc("(")) {
        this.input.next();
        const expr = this.parseExpression.apply(this);
        this.skipPunc(")");
        return expr;
      }

      if (this.isPunc(";")) return this.skipPunc(";");
      if (this.isPunc("{")) return this.parseProg();
      if (this.isKw("for")) return this.parseFor();
      if (this.isKw("if")) return this.parseIf();
      if (this.isKw("return")) return this.skipKw("return");
      if (this.isKw("typeof")) return this.parseTypeOf("");
      if (this.isKw("true") || this.isKw("false")) return this.parseBool();
      if (this.isPropertyAccessor(".")) return this.parsePropertyAccessor();

      if (this.isKw("function")) {
        this.input.next();
        return this.parseFunc();
      }

      // get the token for the current character
      const tok = this.input.next();

      if (tok.type === 'var') {
        return this.maybePropertyAccessor(tok);
      }

      if (["str", "num"].includes(tok.type)) {
        return tok;
      } else {
        this.unexpected(tok);
      }
    });
  }

  // parsing method invocation into a token
  parseCall(func) {
    const expr = new Token(func, this.parseExpression.bind(this));
  }

  parseProg() {
    // returns array of tokenized expression
    // between the curly braces
    // punctutation is optional
    const prog = this.delimited(
      "{",
      "}",
      "\n",
      this.parseExpression.bind(this)
    );

    if (prog.length === 0) {
      return this.FALSE;
    }

    if (prog.length === 1) {
      return prog[0];
    }

    return new Token.Program(prog.filter(x => x));
  }

  parseFunc() {
    return new Token.Function(
      this.input.peek().type === "var" ? this.input.next() : null,
      this.delimited("(", ")", ",", this.parseVarName.bind(this)),
      this.parseExpression()
    );
  }

  delimited(start, stop, seperator, parser) {
    // hold arguments in array
    // also use to parse expression in prog
    const args = [];
    let first = true;
    // skip start of arguments string
    // assumed to usually be "("
    start && this.skipPunc(start);
    // read rest of string until hit stop indicator
    while (!this.input.eof()) {
      if (this.isKw("else")) {
        return args;
      }
      // if (this.input.isWhiteSpace()) continue;
      // if hit stop indicator, exit out of loop
      if (this.isPunc(stop)) break;
      // assumed that there is no seperator for first argument
      // otherwise required that should be a seperator between each argument
      if (first) first = false;
      else if (seperator && this.isPunc(seperator)) this.skipPunc(seperator);
      // the last punctutation is optional
      if (this.isPunc(stop) || this.isKw(stop) || this.input.peek() === stop)
        break;

      args.push(parser());
    }
    // skip over stop character
    if (this.isPunc(stop)) this.skipPunc(stop);
    else if (this.isKw(stop)) this.skipKw(stop);
    return args;
  }

  parseWhile() {
    // skip keyword
    this.skipKw("while");
    // grab the loop condition
    const cond = this.parseExpression();
    // grab the body of the loop
    const body = this.parseProg();

    return new Token.Loop("while", cond, body);
  }

  parseFor() {
    // skip keyword
    this.skipKw("for");
    // grab the loop condition
    const cond = this.parseExpression();
    // grab the body of the loop
    const body = this.parseProg();

    return new Token.Loop("for", cond, body);
  }

  parseIf() {
    // skip keyword
    this.skipKw("if");
    // grab the loop condition
    const cond = this.parseExpression();
    // grab the body of the loop
    const then = this.parseProg();

    const tok = new Token.Conditional("if", cond, then);

    // check if there is an else
    if (this.isKw("else")) {
      this.input.next();
      tok.else = this.parseExpression();
    }

    return tok;
  }

  // expect arguments of function to be of type variable
  parseVarName() {
    const token = this.input.next();

    if (token.type !== "var") {
      this.input.croak("Expect variable name");
    }

    return token.value;
  }

  parseBool() {
    const token = this.input.next();
    // parse into a boolean token
    return new Token.Boolean(token.value === "true");
  }

  parseTypeOf() {
    const token = this.input.next();
    return new Token.Function(
      null,
      this.delimited("(", ")", "", this.parseVarName.bind(this)),
      null
    );
  }

  parseBinaryType(type) {
    switch (type) {
      case "=":
        return "assign";
      default:
        return "binary";
    }
  }

  // Maybes
  //--------------------------------------------------------
  // handling conditional checking of input stream

  maybeCall(expr) {
    expr = expr();
    return this.isPunc("(") ? this.parseCall(expr) : expr;
  }

  maybePropertyAccessor(tok) {
    const peek = this.input.peek();

    if (peek.type === "accessor") {
      this.input.next();
      tok.type = 'accessor';
      tok.tokenType = 'Accessor'
      tok.child = this.input.next();

      return this.maybePropertyAccessor(tok)
    }
    
    return tok;
  }

  maybeBinary(left, curPrec) {
    let right, type;
    // check if a operator and
    // use to compose binary expression
    // 1 + 2 * 3 => 1 + (2 * 3)
    const tok = this.isOp();
    if (tok) {
      // find the operator precedent order of the next value
      // and compare with the current precedent value
      const nextPrec = this.PRECEDENCE[tok.value];
      if (nextPrec > curPrec) {
        this.input.next();

        right = this.maybeBinary(this.parseAtom(), nextPrec);
        type = this.parseBinaryType(tok.value);
        // determine if it is a binary or assignment value
        const binary = {
          type: type,
          op: tok.value,
          left: left,
          right: right
        };

        return this.maybeBinary(binary, curPrec);
      }
    }
    return left;
  }

  // Validators
  //--------------------------------------------------------
  // these methods return a token if the character matches a specific type
  // and check if the value matches the argument passes in
  // input.peek either return a valid token or null

  isPunc(ch) {
    const tok = this.input.peek();
    return tok && tok.type === "punc" && (!ch || tok.value === ch) && tok;
  }

  isKw(kw) {
    const tok = this.input.peek();
    return tok && tok.type === "kw" && (!kw || tok.value === kw) && tok;
  }

  isOp(op) {
    const tok = this.input.peek();
    return tok && tok.type === "op" && (!op || tok.value == op) && tok;
  }

  isPropertyAccessor(accessor) {
    const tok = this.input.peek();
    return tok && tok.type === "accessor" && (!accessor || tok.value == accessor) && tok;
  }

  // Skippers
  //--------------------------------------------------------
  // these methods does not generate tokens
  // expect argument to passed in the valid type
  skipPunc(ch) {
    if (this.isPunc(ch)) this.input.next();
    else this.input.croak(`Expecting punctuation: '${ch}'`);
  }

  skipKw(kw) {
    if (this.isKw(kw)) this.input.next();
    else this.input.croak(`Expecting keyword: '${kw}'`);
  }

  skipOp(op) {
    if (this.isOp(op)) this.input.next();
    else this.input.croak(`Expecting operator: '${op}'`);
  }

  // Helpers
  //--------------------------------------------------------
  unexpected(tok) {
    delete tok.filename;
    this.input.croak(
      `Unexpected token: ${JSON.stringify(tok || this.input.peek(), null, 2)}`
    );
  }
}

module.exports = Parser;
