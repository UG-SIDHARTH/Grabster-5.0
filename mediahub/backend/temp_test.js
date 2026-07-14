const instagramDl = require('@sasmeee/igdl');

async function test() {
  const url = 'https://www.instagram.com/reel/C3Cea1dIe_L/';
  console.log(`Testing @sasmeee/igdl package with URL: ${url}`);
  try {
    const data = await instagramDl(url);
    console.log('Success! Result:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('igdl execution failed:', err);
  }
}

test();
