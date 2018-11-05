const Parser = require("./lib/Parser");
const fs = require("fs");
const path = require("path");

fs.readFile(path.join(__dirname, "files/testFile.js"), "utf8", (err, data) => {
  const parser = new Parser(data);
  var ast = parser.parse();
  fs.writeFile(
    path.join(__dirname, "result/ast.json"),
    JSON.stringify(ast, null, 4),
    err => {
      if (err) console.error(err);
    }
  );
});
