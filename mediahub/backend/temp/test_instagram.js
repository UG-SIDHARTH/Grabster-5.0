async function testAgent(ua) {
  const url = 'https://www.instagram.com/reel/C3Cea1dIe_L/'; // Example public instagram post/reel
  console.log(`Testing User-Agent: ${ua}`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': ua,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    console.log(`Response status: ${response.status}`);
    const html = await response.text();
    console.log(`HTML length: ${html.length}`);
    
    // Check for og:image and og:video
    const extractMeta = (html, property) => {
      const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
      const match = html.match(regex);
      if (match) return match[1];
      const regex2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i');
      const match2 = html.match(regex2);
      if (match2) return match2[1];
      return null;
    };
    
    console.log(`og:image: ${extractMeta(html, 'og:image')}`);
    console.log(`og:video: ${extractMeta(html, 'og:video')}`);
    console.log(`og:video:secure_url: ${extractMeta(html, 'og:video:secure_url')}`);
    console.log(`twitter:player:stream: ${extractMeta(html, 'twitter:player:stream')}`);
    
    if (html.includes('login')) {
      console.log('Detected redirect to login or login page content.');
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

async function run() {
  const agents = [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_aged_via_webcopy.html)',
    'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
  ];
  for (const agent of agents) {
    await testAgent(agent);
    console.log('-------------------------------------------');
  }
}

run();
