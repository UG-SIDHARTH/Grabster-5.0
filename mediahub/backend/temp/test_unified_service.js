const service = require('../services/ytDlpService');

async function run() {
  const ytUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const igUrl = 'https://www.instagram.com/reel/C3Cea1dIe_L/';
  
  console.log('--- TESTING YOUTUBE METADATA ---');
  try {
    const meta = await service.fetchMetadata(ytUrl);
    console.log('YouTube Metadata:', JSON.stringify(meta, null, 2));
  } catch (e) {
    console.error('YouTube Metadata error:', e.message);
  }
  
  console.log('--- TESTING INSTAGRAM METADATA ---');
  try {
    const meta = await service.fetchMetadata(igUrl);
    console.log('Instagram Metadata:', JSON.stringify(meta, null, 2));
  } catch (e) {
    console.error('Instagram Metadata error:', e.message);
  }
  
  console.log('--- TESTING COBALT DOWNLOAD FALLBACK ---');
  try {
    const result = await service.downloadMedia(ytUrl, 'mp4-720', 'test-uuid-1234');
    console.log('YouTube Download Result:', JSON.stringify(result, null, 2));
  } catch (e) {
    console.error('YouTube Download error:', e.message);
  }
}

run();
