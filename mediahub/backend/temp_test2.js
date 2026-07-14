const { instagramGetUrl } = require('instagram-url-direct');

async function test() {
  const url = 'https://www.instagram.com/reel/C3Cea1dIe_L/';
  console.log(`Testing instagram-url-direct with URL: ${url}`);
  try {
    const data = await instagramGetUrl(url);
    console.log('Success! Result:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('instagram-url-direct execution failed:', err);
  }
}

test();
