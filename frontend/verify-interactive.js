const fs = require('fs');
const path = require('path');

const newFilesToCheck = [
    'app/store/page.tsx',
    'app/components/Chatbot.tsx',
    'app/lib/simulation-store.ts'
];

console.log('Verifying interactive feature files...');

let allPass = true;

newFilesToCheck.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.length > 50) {
            console.log(`   Content Verified (${content.length} bytes)`);
        } else {
            console.error(`❌ ${file} looks suspiciously empty`);
            allPass = false;
        }
    } else {
        console.error(`❌ ${file} MISSING`);
        allPass = false;
    }
});

if (allPass) {
    console.log('\nInteractive features verified!');
} else {
    console.error('\nVerification failed!');
    process.exit(1);
}
