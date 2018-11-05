const InputStream = require("../../lib/InputStream");

class InputFactory {
  static generateInputStream(input) {
    if (input === null || input === undefined) {
      input = `
        var foo = "Hello there!";

        var bar = 'General Kenobi!'

        var myObj = {
            someKey: 'someValue'
        }

        (function IIFE_One() {})();
        (function IIFE_Two() {}());

        var selfInvokeFunction = (function() {
            var my = {};
            my.method = function() {}
        });

        cbpBody_onBeginCallback = function(arg1, arg2) {};

        function cbpBody_OnEndCallback(arg1, arg2, arg3) {}
    `;
    }
    return new InputStream(input);
  }
}

module.exports = InputFactory;
