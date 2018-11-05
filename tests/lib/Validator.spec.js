const Validator = require("../../lib/Validator");

describe("Validator", () => {
  let validator;
  beforeEach(() => {
    validator = new Validator();
  });

  describe("IsKeyword", () => {
    it("should returns true for a valid keyword", () => {
      expect(validator.isKeyword("var")).toBeTruthy();
    });

    it("should returns false for an invalid keyword", () => {
      expect(validator.isKeyword("foo")).toBeFalsy();
    });
  });

  describe("IsDigit", () => {
    it("should returns true for a valid digit", () => {
      expect(validator.isDigit("1")).toBeTruthy();
    });

    it("should returns false for an invalid digit", () => {
      expect(validator.isDigit("foo")).toBeFalsy();
    });
  });

  describe("IsOp", () => {
    it("should returns true for a valid operator", () => {
      expect(validator.isOp("=")).toBeTruthy();
    });

    it("should returns false for an invalid operator", () => {
      expect(validator.isOp("foo")).toBeFalsy();
    });
  });

  describe("IsQuote", () => {
    it("should returns true for a valid quote character", () => {
      expect(validator.isQuote("'")).toBeTruthy();
      expect(validator.isQuote('"')).toBeTruthy();
    });

    it("should returns false for an invalid quote character", () => {
      expect(validator.isQuote("f")).toBeFalsy();
    });
  });

  describe("IsId", () => {
    it("should returns true for a valid identifier character", () => {
      expect(validator.isId("var")).toBeTruthy();
      expect(validator.isId("function")).toBeTruthy();
      expect(validator.isId("foo")).toBeTruthy();
    });

    it("should returns false for an invalid whitespace character", () => {
      expect(validator.isId("124")).toBeFalsy();
    });
  });

  describe("IsWhiteSpace", () => {
    it("should returns true for a valid whitespace character", () => {
      expect(validator.isWhiteSpace("\n")).toBeTruthy();
      expect(validator.isWhiteSpace("\t")).toBeTruthy();
    });

    it("should returns false for an invalid whitespace character", () => {
      expect(validator.isWhiteSpace("a")).toBeFalsy();
    });
  });
});
