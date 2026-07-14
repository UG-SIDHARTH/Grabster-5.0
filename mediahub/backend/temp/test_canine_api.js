async function run() {
  const url = 'https://cobalt-backend.canine.tools/';
  const testUrl = 'https://www.instagram.com/reel/C3Cea1dIe_L/';
  console.log(`Testing cobalt-backend.canine.tools with url: ${testUrl}`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: testUrl
      })
    });
    
    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Raw response length: ${text.length}`);
    try {
      const data = JSON.parse(text);
      console.log(`JSON response:`, JSON.stringify(data, null, 2));
    } catch (e) {
      console.log(`Response is not JSON. Snippet:`, text.substring(0, 500));
    }
  } catch (err) {
    console.error(`Failed to request:`, err.message);
  }
}

run();
