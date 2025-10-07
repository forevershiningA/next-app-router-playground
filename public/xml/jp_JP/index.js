const dir = './';
const fs = require('fs');
let output = '';

fs.readdir(dir, (err, files) => {
  files.forEach((file) => {
    output += file + ',';
  });
  console.log(output);

  var fs = require('fs');
  fs.writeFile('files.txt', output, function (err) {
    if (err) {
      return console.log(err);
    }

    console.log('The file was saved!');
  });
});
