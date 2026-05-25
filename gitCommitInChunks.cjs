const { execSync } = require('child_process');
const fs = require('fs');

const userName = "Dan";
const userEmail = "birhanudaniel724@gamil.com";

try {
  // 1. Configure local git author
  console.log(`Configuring local Git name to "${userName}" and email to "${userEmail}"...`);
  execSync(`git config --local user.name "${userName}"`, { stdio: 'inherit' });
  execSync(`git config --local user.email "${userEmail}"`, { stdio: 'inherit' });

  // 2. Get list of modified and untracked files
  const statusOutput = execSync('git status --porcelain', { encoding: 'utf8' });
  const lines = statusOutput.split('\n');
  const files = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    // Status is in first 2 columns, filename is everything after
    const filename = line.substring(3).trim();
    // Exclude scratch scripts if we don't want to commit them, but let's commit them if they are in the status
    // Actually, we can commit them or keep them, but let's include them.
    files.push(filename);
  }

  if (files.length === 0) {
    console.log("No files to commit.");
    process.exit(0);
  }

  console.log(`Found ${files.length} changed file(s).`);

  // 3. Chunk files by 50
  const chunkSize = 50;
  for (let i = 0; i < files.length; i += chunkSize) {
    const chunk = files.slice(i, i + chunkSize);
    console.log(`\nAdding chunk ${Math.floor(i / chunkSize) + 1} (${chunk.length} files)...`);
    
    // Add files in chunk
    // We quote each file to handle spaces in paths
    const filesString = chunk.map(f => `"${f}"`).join(' ');
    execSync(`git add ${filesString}`, { stdio: 'inherit' });

    // Commit chunk
    const commitMsg = `Theme and Layout updates - Batch ${Math.floor(i / chunkSize) + 1}`;
    console.log(`Committing chunk...`);
    execSync(`git commit -m "${commitMsg}"`, { stdio: 'inherit' });
  }

  // 4. Push to remote
  console.log("\nPushing changes to remote repository...");
  execSync('git push', { stdio: 'inherit' });
  console.log("Successfully committed and pushed all changes in chunks!");

} catch (err) {
  console.error("An error occurred during git operations:", err.message);
  process.exit(1);
}
