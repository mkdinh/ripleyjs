const Validator = require("./Validator");
const TokenDispensary = require("./TokenDispensary");

class Reader {
  constructor(input, filename) {
    this.input = input;
    this.validate = new Validator();
    this.tokenDispensary = new TokenDispensary(input, filename);
  }

  next(num) {
    // skip over the whitespace characters
    this.while(this.validate.isWhiteSpace.bind(this.validate));
    // if it a //, skip over the comment
    // and return the recursive funcition (start from the top again)
    // assume that it is a single line comment
    if (this.input.eof()) return null;

    const ch = this.input.peek(num);
    if (ch === "/") {
      if (this.input.peek("/")) {
        this.comment();
        return this.next(num);
      }
    }
    // check if section is the main dispatcher for TokenStream
    // check the initial condition of each lettter and determine
    // if it have the possiblity of a specific token type

    // if it is a quote character read as a literal streing
    if (this.validate.isQuote(ch)) {
      return this.string();
    }
    if (this.validate.isDigit(ch)) {
      return this.number();
    }
    // if a letter, read as a keyword or identifier
    else if (this.validate.isId(ch)) {
      // if a identifer or keyword
      return this.identifier();
    } else if (this.validate.isOp(ch)) {
      return this.operator();
    }
    // if a punctutation character
    else if (this.validate.isPunctuation(ch)) {
      return this.punctuation();
    }
    // handle object accessor
    else if (this.validate.isPropertyAccessor(ch)) {
      return this.propertyAccessor();
    }
    // default will always to throw an error
    // to make sure that all character are accounted for
    else {
      return this.input.croak(`Cannot handle character: "${ch}"`);
    }
  }

  while(predicate) {
    let str = "";

    while (!this.input.eof() && predicate(this.input.peek(), str)) {
      str += this.input.next();
    }

    return str;
  }

  string() {
    // can be either ' or "
    const quoteType = this.input.peek();
    return this.tokenDispensary.String(quoteType, this.escaped.bind(this));
  }

  comment() {
    this.while(ch => {
      return ch != "\n";
    });

    this.input.next();
  }

  operator() {
    const _this = this;
    var predicate = () => {
      return this.while((ch, str) => {
        if (str === "=" && this.input.peek() !== "=") {
          return false;
        }
        return _this.validate.isOp(ch);
      });
    };

    return this.tokenDispensary.Operator(predicate.bind(this));
  }

  identifier() {
    var id = this.while(this.validate.isId.bind(this.validate));
    return this.tokenDispensary.Keyword(
      id,
      this.validate.isKeyword(id) ? "kw" : "var"
    );
  }

  punctuation() {
    return this.tokenDispensary.Punctuation(this.input.next.bind(this.input));
  }

  number() {
    let isFloat = false;
    let isNegative = false;
    let isExponential = false;
    let startNum = false;

    let number = this.while(ch => {
      // test for scientific notation
      if (startNum && /e|E/.test(ch)) {
        if (!isExponential) {
          isExponential = true;
          return true;
        } else {
          return false;
        }
      }

      // if number start with a dash, assume it is a negative number
      if (ch === this.validate.sign.negative) {
        // if already set as negative, skip
        if (isNegative) return false;
        isNegative = true;
        return true;
      }

      if (ch === this.validate.sign.decimal) {
        // if already set as float, skip
        if (isFloat) return false;
        isFloat = true;
        return true;
      }
      startNum = true;
      // continue to read ch is no longer a number
      return this.validate.isDigit(ch);
    });
    return this.tokenDispensary.Number(
      number,
      isFloat,
      isNegative,
      isExponential
    );
  }

  escaped(end) {
    // set initial state
    let escaped = false;
    var str = "";
    this.input.next();
    // go pass start character ' or "
    // keep reading and pushing character until hit 'end' variable
    // if hit a \ character, expect the next character to be an escaped character
    while (!this.input.eof()) {
      const ch = this.input.next();

      if (escaped) {
        str += ch;
        escaped = false;
      } else if (ch === "\\") {
        // read escaped character as is
        return (escaped = true);
      } else if (ch === end) {
        break;
      } else {
        str += ch;
      }
    }

    return str;
  }

  propertyAccessor() {
    var str = "";
    var accessorType = this.input.next();
    // skip '.'
    while (!this.validate.isWhiteSpace.bind(this.validate)) {
      const ch = this.input.next();
      str += ch;
    }
    
    return this.tokenDispensary.PropertyAccessor(accessorType);
  }
}

module.exports = Reader;
