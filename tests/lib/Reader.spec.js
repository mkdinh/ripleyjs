const Reader = require("../../lib/Reader");
const Token = require("../../lib/Token");
const TokenDispensary = require("../../lib/TokenDispensary");
const InputFactory = require("../factories/InputFactory");

describe("Reader", () => {
  let read;
  let input;
  beforeEach(() => {
    read = new Reader();
    read.tokenDispensary = new TokenDispensary(
      InputFactory.generateInputStream("")
    );
  });

  describe("Read a string", () => {
    it("returns a String token", () => {
      input = "'Hello There'";
      read.input = InputFactory.generateInputStream(input);
      const token = read.string();
      expect(token).toBeInstanceOf(Token.String);
    });

    it("returns a String token", () => {
      input = '"Hello There"';
      read.input = InputFactory.generateInputStream(input);
      const token = read.string();
      expect(token).toBeInstanceOf(Token.String);
    });
  });

  describe("Read an identifier", () => {
    it("returns token with type 'kw'", () => {
      input = "var";
      read.input = InputFactory.generateInputStream(input);
      const token = read.identifier();
      expect(token).toBeInstanceOf(Token.Keyword);
      expect(token.type).toEqual("kw");
      expect(token.value).toEqual(input);
    });

    it("returns token with type 'var'", () => {
      input = "foo";
      read.input = InputFactory.generateInputStream(input);
      const token = read.identifier();
      expect(token).toBeInstanceOf(Token.Keyword);
      expect(token.type).toEqual("var");
      expect(token.value).toEqual(input);
    });
  });

  describe("Read operator", () => {
    it("returns an Operator token", () => {
      input = "+";
      read.input = InputFactory.generateInputStream(input);
      const token = read.operator();
      expect(token).toBeInstanceOf(Token.Operator);
      expect(token.type).toEqual("op");
      expect(token.value).toEqual(input);
    });
  });

  describe("Read a number", () => {
    it("set isExponential to be true if an exponent", () => {
      input = "2E8";
      read.input = InputFactory.generateInputStream(input);
      const token = read.number();
      expect(token.isExponential).toBeTruthy();
      expect(token.value).toEqual(parseFloat(input));
    });

    it("set isFloat to be true if a floating number", () => {
      input = "2.50";
      read.input = InputFactory.generateInputStream(input);
      const token = read.number();
      expect(token.isFloat).toBeTruthy();
      expect(token.value).toEqual(parseFloat(input));
    });

    it("set isNegative to be true if a negative number", () => {
      input = "-2";
      read.input = InputFactory.generateInputStream(input);
      const token = read.number();
      expect(token.isNegative).toBeTruthy();
      expect(token.value).toEqual(parseFloat(input));
    });
  });

  describe("Read a punctutation", () => {
    it("returns a Punctuation token", () => {
      input = ";";
      read.input = InputFactory.generateInputStream(input);
      const token = read.punctuation();
      expect(token).toBeInstanceOf(Token.Punctuation);
    });
  });

  describe("Read escaped", () => {
    it("reads a escaped character", () => {
      const input = "'Hello There\"'";
      read.input = InputFactory.generateInputStream(input);
      const str = read.escaped("'");
      expect(str).toEqual(input.replace(/\'/g, ""));
    });
  });

  describe("Read while", () => {
    it("reads until the predicate is false", () => {
      input = "abcdefg";
      read.input = InputFactory.generateInputStream(input);
      const str = read.while(ch => {
        return ch !== "f";
      });
      expect(str).toEqual("abcde");
    });
  });

  describe("Read Next", () => {
    it("returns null if at the end of line", () => {
      input = "";
      read.input = InputFactory.generateInputStream(input);
      const str = read.next();
      expect(str).toEqual(null);
    });

    it("skip comments", () => {
      input = "// hello there this is a comment";
      read.input = InputFactory.generateInputStream(input);
      const str = read.next();
      expect(str).toEqual(null);
    });

    it("returns a correct token", () => {
      var scenarios = [
        {
          input: "'hello there'",
          tokenType: Token.String,
          value: "hello there"
        },
        {
          input: "var",
          tokenType: Token.Keyword,
          value: "var"
        },
        {
          input: "function",
          tokenType: Token.Keyword,
          value: "function"
        },
        {
          input: "(",
          tokenType: Token.Punctuation,
          value: "("
        },
        {
          input: ";",
          tokenType: Token.Punctuation,
          value: ";"
        }
      ];

      scenarios.forEach(x => {
        read.input = InputFactory.generateInputStream(x.input);
        const token = read.next();
        expect(token).toBeInstanceOf(x.tokenType);
        expect(token.value).toEqual(x.value);
      });
    });
  });
});
