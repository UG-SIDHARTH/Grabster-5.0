const ultraigdl = require('ultra-igdl').default;

async function test() {
  const url = 'https://www.instagram.com/reel/C3Cea1dIe_L/';
  console.log(`Testing ultra-igdl with URL: ${url}`);
  try {
    const extractor = new ultraigdl();
    const result = await extractor.download(url);
    console.log('Success! Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('ultra-igdl execution failed:', err);
  }
}

test();
