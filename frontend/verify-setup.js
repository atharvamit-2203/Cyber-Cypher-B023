const fs = require('fs');
const path = require('path');

const filesToCheck = [
    'app/page.tsx',
    'app/customer/page.tsx',
    'app/engineer/page.tsx',
    'app/components/ConfidenceMeter.tsx',
    'app/components/RiskBadge.tsx',
    'app/components/AgentStatusPill.tsx',
    'app/components/ReasoningCard.tsx',
    'app/lib/mock-data.ts'
];

console.log('Verifying file existence and content...');

let allPass = true;

filesToCheck.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
        // Basic content check
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.length > 0) {
            console.log(`   Content Verified (${content.length} bytes)`);
        } else {
            console.error(`❌ ${file} is empty`);
            allPass = false;
        }
    } else {
        console.error(`❌ ${file} MISSING`);
        allPass = false;
    }
});

if (allPass) {
    console.log('\nAll files verified successfully!');
} else {
    console.error('\nVerification failed!');
    process.exit(1);
}
