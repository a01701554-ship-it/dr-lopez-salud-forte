const fs = require('fs');
let text = fs.readFileSync('lib/academy/db.ts', 'utf-8');
const searchStr = 'export const INITIAL_COURSES: Course[] = [';
const start = text.indexOf(searchStr);
const endClass = text.indexOf('export class AcademyDatabase');
const end = text.lastIndexOf('];', endClass) + 2;

console.log(start, end, endClass);
fs.writeFileSync('original_courses_only.ts', text.substring(start, end));
