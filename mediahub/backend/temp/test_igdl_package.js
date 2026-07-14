const { execSync } = require('child_process');

console.log('Installing @sasmeee/igdl...');
try {
  execSync('npm install @sasmeee/igdl', { stdio: 'inherit' });
  console.log('@sasmeee/igdl installed successfully!');
  
  const { igdl } = require('@sasmeee/igdl');
  
  async function test() {
    const url = 'https://www.instagram.com/reel/C3Cea1dIe_L/';
    console.log(`Testing igdl with URL: ${url}`);
    try {
      const data = await igdl(url);
      console.log('Success! Result:', JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('igdl execution failed:', err);
    }
  }
  
  test();
} catch (err) {
  console.error('Failed to install or test @sasmeee/igdl:', err);
}
