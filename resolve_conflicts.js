const fs = require('fs');

function acceptHead(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let result = [];
    let i = 0;
    while (i < lines.length) {
        if (lines[i].startsWith('<<<<<<< HEAD')) {
            i++;
            while (i < lines.length && !lines[i].startsWith('=======')) {
                result.push(lines[i]);
                i++;
            }
            i++; // skip =======
            while (i < lines.length && !lines[i].startsWith('>>>>>>>')) {
                i++; // skip theirs
            }
            i++; // skip >>>>>>>
        } else {
            result.push(lines[i]);
            i++;
        }
    }
    fs.writeFileSync(filePath, result.join('\n'));
}

function acceptTheirs(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let result = [];
    let i = 0;
    while (i < lines.length) {
        if (lines[i].startsWith('<<<<<<< HEAD')) {
            i++;
            while (i < lines.length && !lines[i].startsWith('=======')) {
                i++; // skip HEAD
            }
            i++; // skip =======
            while (i < lines.length && !lines[i].startsWith('>>>>>>>')) {
                result.push(lines[i]);
                i++; // keep theirs
            }
            i++; // skip >>>>>>>
        } else {
            result.push(lines[i]);
            i++;
        }
    }
    fs.writeFileSync(filePath, result.join('\n'));
}

acceptHead('frontend/src/shared/components/layouts/AdvertiserLayout.tsx');
acceptTheirs('frontend/src/pages/dashboard/advertiser/AdvertiserDashboardPage.tsx');
acceptTheirs('frontend/src/pages/dashboard/business-owner/BusinessDashboardPage.tsx');

console.log('Conflicts resolved automatically.');
