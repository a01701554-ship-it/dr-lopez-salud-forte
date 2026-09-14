const fs = require('fs');

let content = fs.readFileSync('components/site/header.tsx', 'utf-8');

// Replace heights
content = content.replace(
  "h-[68px] sm:h-[72px] lg:h-[76px] xl:h-[80px]",
  "h-[60px] sm:h-[60px] lg:h-[64px] xl:h-[64px]"
);
content = content.replace(
  "h-[76px] sm:h-[82px] lg:h-[88px] xl:h-[92px]",
  "h-[64px] sm:h-[68px] lg:h-[72px] xl:h-[72px]"
);

// Replace logo size
content = content.replace(
  "w-[56px] h-[56px] sm:w-[64px] sm:h-[64px] lg:w-[72px] lg:h-[72px] xl:w-[76px] xl:h-[76px]",
  "w-[48px] h-[48px] sm:w-[52px] sm:h-[52px] lg:w-[56px] lg:h-[56px] xl:w-[60px] xl:h-[60px]"
);

// Replace icon size
content = content.replace(/size-5 sm:size-5.5/g, "size-4.5 sm:size-5");

fs.writeFileSync('components/site/header.tsx', content);
