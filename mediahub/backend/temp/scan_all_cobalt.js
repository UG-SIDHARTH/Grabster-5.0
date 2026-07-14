const testUrl = 'https://www.instagram.com/reel/C3Cea1dIe_L/';

const instances = [
  'https://cobalt.squair.xyz',
  'https://qwkuns.me',
  'https://cobalt.eversiege.network',
  'https://cobalt.kittycat.boo',
  'https://cobalt.liubquanti.click',
  'https://cobalt.xenon.zone',
  'https://cobalt.cjs.nz'
];

async function findBackendUrl(rootUrl) {
  try {
    const res = await fetch(rootUrl);
    if (!res.ok) return null;
    const html = await res.text();
    const regex = /\/_app\/immutable\/[a-zA-Z0-9\/\.\_-]+\.js/g;
    const matches = html.match(regex) || [];
    
    for (const match of matches) {
      const jsUrl = `${rootUrl}${match}`;
      const jsRes = await fetch(jsUrl);
      if (!jsRes.ok) continue;
      const jsCode = await jsRes.text();
      
      const urlRegex = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}(?::[0-9]+)?/g;
      const urls = jsCode.match(urlRegex) || [];
      for (const u of urls) {
        if (u.includes('api') && !u.includes('api.cobalt.tools') && !u.includes('google') && !u.includes('cloudflare')) {
          return u;
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }
  return null;
}

async function testApi(apiUrl) {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: testUrl
      })
    });
    
    if (response.status === 200) {
      const data = await response.json();
      if (data.status !== 'error') {
        return { success: true, data };
      }
      return { success: false, error: data.error };
    }
    return { success: false, status: response.status, body: await response.text() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function run() {
  console.log(`Starting scan of ${instances.length} Cobalt instances...`);
  for (const inst of instances) {
    console.log(`\nAnalyzing ${inst}...`);
    const backendUrl = await findBackendUrl(inst);
    if (!backendUrl) {
      console.log(`  -> Could not find backend API URL in frontend.`);
      continue;
    }
    console.log(`  -> Found backend API URL: ${backendUrl}`);
    console.log(`  -> Testing backend API...`);
    const result = await testApi(backendUrl);
    if (result.success) {
      console.log(`⭐⭐⭐ SUCCESS! Working public instance found: ${backendUrl}`);
      console.log(`Result data:`, JSON.stringify(result.data, null, 2));
      return;
    } else {
      console.log(`  -> Failed:`, result.error || `Status ${result.status} ${result.body}`);
    }
  }
  console.log('\nScan completed. No direct working public instances found.');
}

run();
