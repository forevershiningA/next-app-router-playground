const fs = require('fs');
const filepath = 'app/designs/[productType]/[category]/[slug]/DesignPageClient.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// The structure is:
// <div justify-between>
//   <div flex-1>
//     <h2>title</h2>
//     <p>subtitle</p>
//     <div> specs with Use Template button inside </div>
//   </div>
// </div>

// We want:
// <div justify-between>
//   <div flex-1>
//     <h2>title</h2>
//     <p>subtitle</p>
//     <div> specs WITHOUT Use Template </div>
//   </div>
//   <div> Use Template button </div>
// </div>

// Step 1: Extract the Use Template link (it's inline in the specs section)
const useTemplateMatch = content.match(/<a\s+href={[^}]+}\s+className="inline-flex[^"]*bg-slate-900[^"]*"[^>]*>\s*<svg[^>]*>[\s\S]*?<\/svg>\s*Use Template\s*<\/a>/);

if (!useTemplateMatch) {
  console.log('Could not find Use Template button');
  process.exit(1);
}

const useTemplateButton = useTemplateMatch[0];
console.log('Found Use Template button');

// Step 2: Remove it from the specs section (it's in the gap-3 div)
// Find the wrapping div with gap-3
const removePattern = /<div className="flex items-center gap-3">\s*<a\s+href={[^}]+}\s+className="inline-flex[^"]*bg-slate-900[^"]*"[^>]*>\s*<svg[^>]*>[\s\S]*?<\/svg>\s*Use Template\s*<\/a>\s*<\/div>/;
content = content.replace(removePattern, '');
console.log('Removed Use Template from specs section');

// Step 3: Find where to insert it (after the closing </div> of flex-1, before the closing </div> of justify-between)
// Find the pattern: </p>\n spaces </div> spaces <div space-y-3
// This </div> closes the flex-1
const insertPattern = /(              <\/p>\n\n)(              {\/\* Design Specifications)/;

const newRightSection = `            </div>
            <div>
              ${useTemplateButton}
            </div>
`;

content = content.replace(insertPattern, `$1            </div>\n${newRightSection}\n            <div className="flex-1">\n$2`);

fs.writeFileSync(filepath, content, 'utf8');
console.log('Successfully moved Use Template button to right side of header!');
