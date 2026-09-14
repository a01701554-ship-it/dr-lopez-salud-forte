const fs = require('fs');

let dbContent = fs.readFileSync('lib/academy/db.ts', 'utf-8');

// Find the block
const startIndex = dbContent.indexOf('export const INITIAL_COURSES: Course[] = [');
const endClassIndex = dbContent.indexOf('export class AcademyDatabase');
let endIndex = dbContent.lastIndexOf('];', endClassIndex) + 2;

const arrayContent = dbContent.substring(startIndex, endIndex);

fs.writeFileSync('original_initial_courses.ts', arrayContent);
console.log("Saved original to original_initial_courses.ts");
