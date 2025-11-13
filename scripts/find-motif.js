const fs = require('fs');
const xml = fs.readFileSync('public/ml/headstonesdesigner/saved-designs/xml/1677858314338.xml', 'utf8');
const regex = /<item id="\d+">[\s\S]*?<type type="string">Motif<\/type>[\s\S]*?<\/item>/g;
const matches = xml.match(regex);
if (matches) {
  console.log('Found', matches.length, 'motifs');
  console.log(matches[0]);
}
