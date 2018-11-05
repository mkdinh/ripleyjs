const Validator = require("./Validator");
const Reader = require("./Reader");

class TokenStream {
  constructor(input) {
    this.current = null;
    this.input = input;
    this.read = new Reader(this.input);
    this.croak = input.croak.bind(input);
  }

  // Main Methods
  //--------------------------------------------------------
  peek(num = 0) {
    return this.current || (this.current = this.read.next(num));
  }

  next() {
    const tok = this.current;
    this.current = null;
    return tok || this.readNext();
  }

  eof() {
    return this.peek() === null;
  }

  readNext(num = 0) {
    return this.read.next(num);
  }

  readWhile(predicate) {
    return this.read.while(predicate);
  }
}

module.exports = TokenStream;
