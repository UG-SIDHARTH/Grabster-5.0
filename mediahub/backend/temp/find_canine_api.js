async function findApiUrl() {
  const root = 'https://cobalt.canine.tools';
  try {
    const res = await fetch(root);
    const html = await res.text();
    
    // Find all JS scripts
    const regex = /\/_app\/immutable\/[a-zA-Z0-9\/\.\_-]+\.js/g;
    const matches = html.match(regex) || [];
    console.log(`Found JS files:`, matches);
    
    for (const match of matches) {
      const jsUrl = `${root}${match}`;
      console.log(`Fetching: ${jsUrl}`);
      const jsRes = await fetch(jsUrl);
      const jsCode = await jsRes.text();
      
      // Search for URL patterns
      const urlRegex = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}(?::[0-9]+)?/g;
      const urls = jsCode.match(urlRegex) || [];
      const filtered = urls.filter(u => !u.includes('w3.org') && !u.includes('svelte.dev') && !u.includes('google') && !u.includes('cloudflare'));
      if (filtered.length > 0) {
        console.log(`Found URLs in ${match}:`, Array.from(new Set(filtered)));
      }
    }
  } catch (err) {
    console.error('Error scanning:', err);
  }
}

findApiUrl();
