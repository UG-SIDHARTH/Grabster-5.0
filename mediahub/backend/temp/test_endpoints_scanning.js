async function scanEndpoints(baseUrl) {
  const paths = [
    'api',
    'api/',
    'api/json',
    'api/json/',
    'api/download',
    'api/media',
    'api/info',
    'info'
  ];
  
  console.log(`Scanning endpoints for: ${baseUrl}`);
  for (const path of paths) {
    const url = `${baseUrl}${path}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' })
      });
      console.log(`POST ${url} -> Status: ${response.status}`);
      if (response.status === 200 || response.status === 400 || response.status === 429) {
        const text = await response.text();
        console.log(`  -> Response: ${text.substring(0, 200)}`);
      }
    } catch (err) {
      console.log(`POST ${url} -> Error: ${err.message}`);
    }
  }
}

async function run() {
  await scanEndpoints('https://cobalt.meowing.de/');
  console.log('----------------------------------------------------');
  await scanEndpoints('https://cobalt.canine.tools/');
}

run();
