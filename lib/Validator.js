class Validator {
  constructor() {
    this.validKeywords = [
      " var ",
      " function ",
      " if ",
      " for ",
      " while ",
      " then ",
      " else ",
      " true ",
      " false ",
      " return ",
      " break ",
      " typeof "
    ];
    this.validAlphabet = /[a-z]/i;
    this.validDigits = /-?[0-9]/;
    this.validOperators = "=+-*/%|&><!";
    this.validPunctuations = "{}[]();,";
    this.validWhiteSpaces = " \t\r\f\n";
    this.validQuotes = "\"'";
    this.validPropertyAccessor = ".";
    this.validIdStarter = /[A-Za-z_$]/;
    this.sign = {
      negative: "-",
      decimal: "."
    };
  }

  isKeyword(kw) {
    return this.validKeywords.indexOf(` ${kw} `) > -1;
  }

  isDigit(digit) {
    return this.validDigits.test(digit);
  }

  isOp(ch) {
    return this.validOperators.indexOf(ch) > -1;
  }

  isQuote(ch) {
    return this.validQuotes.indexOf(ch) > -1;
  }

  isId(ch) {
    return this.validIdStarter.test(ch);
  }

  isWhiteSpace(ch) {
    return this.validWhiteSpaces.indexOf(ch) > -1;
  }

  isPunctuation(ch) {
    return this.validPunctuations.indexOf(ch) > -1;
  }

  isPropertyAccessor(ch) {
    return this.validPropertyAccessor.indexOf(ch) > -1;
  }
}

module.exports = Validator;
