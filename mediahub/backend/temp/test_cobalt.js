async function testCobalt(url) {
  console.log(`Testing Cobalt API for URL: ${url}`);
  try {
    const response = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        filenameStyle: 'basic'
      })
    });
    
    console.log(`Response status: ${response.status}`);
    const data = await response.json();
    console.log('Response JSON:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error making Cobalt API request:', err);
  }
}

async function run() {
  // Test with a public Instagram URL or Youtube URL
  await testCobalt('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
}

run();
