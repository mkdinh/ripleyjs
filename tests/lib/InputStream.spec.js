const InputStream = require("../../lib/InputStream");
const InputFactory = require("../factories/inputFactory");

fdescribe("InputStream", () => {
  let inputStream;
  let input;
  beforeEach(() => {
    inputStream = InputFactory.generateInputStream();
  });

  describe("Next", () => {});

  describe("Peek", () => {
    it("should returns the next character without changing current position", () => {
      var pos = inputStream.pos;
      var ch = inputStream.peek();
      expect(ch).toEqual(inputStream.input[pos]);
      expect(inputStream.pos).toEqual(pos);
    });

    it("should returns correct character if passed in a value from current position", () => {
      var pos = inputStream.pos;
      var num = 5;
      var expectedCh = inputStream.input[pos + num];
      var ch = inputStream.peek(num);
      expect(ch).toEqual(expectedCh);
      expect(inputStream.pos).toEqual(pos);
    });
  });

  describe("OEF", () => {
    it("should returns true if peek return an empty string", () => {
      inputStream.input = "";
      expect(inputStream.eof()).toBeTruthy();
    });

    it("should returns false if not an oef", () => {
      expect(inputStream.eof()).toBeFalsy();
    });
  });

  describe("Croak", () => {
    it("shoulds throw error with correct line number", () => {
      inputStream.line = 10;
      inputStream.col = 20;

      var message = "An error has occured";
      var regExp = new RegExp(
        `\\s*${message}\\s+${inputStream.line}:${inputStream.col}`,
        "gi"
      );
      expect(inputStream.croak.bind(inputStream, message)).toThrowError(regExp);
    });
  });
});
