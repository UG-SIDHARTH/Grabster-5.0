async function testInstance(baseUrl, url) {
  console.log(`Testing instance: ${baseUrl} with url: ${url}`);
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url
      })
    });
    
    console.log(`[${baseUrl}] Status: ${response.status}`);
    const text = await response.text();
    console.log(`[${baseUrl}] Raw response length: ${text.length}`);
    try {
      const data = JSON.parse(text);
      console.log(`[${baseUrl}] JSON parsed! Keys:`, Object.keys(data));
      if (data.status === 'error') {
        console.log(`[${baseUrl}] Error details:`, data.error);
      } else {
        console.log(`[${baseUrl}] Success response:`, JSON.stringify(data, null, 2));
        return true;
      }
    } catch (e) {
      console.log(`[${baseUrl}] Response is not JSON. Snippet:`, text.substring(0, 150));
    }
  } catch (err) {
    console.error(`[${baseUrl}] Failed to request:`, err.message);
  }
  return false;
}

async function run() {
  const testUrl = 'https://www.instagram.com/reel/C3Cea1dIe_L/';
  const candidates = [
    'https://api.cobalt.tools/',
    'https://cobalt.meowing.de/',
    'https://api.cobalt.meowing.de/',
    'https://cobalt.canine.tools/',
    'https://api.cobalt.canine.tools/',
    'https://cobalt.clxxped.lol/',
    'https://api.cobalt.clxxped.lol/'
  ];
  
  for (const c of candidates) {
    const ok = await testInstance(c, testUrl);
    console.log('===========================================');
    if (ok) {
      console.log(`FOUND WORKING COBALT INSTANCE: ${c}`);
    }
  }
}

run();
