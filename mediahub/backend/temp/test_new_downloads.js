const fs = require('fs');
const path = require('path');

async function testDownload() {
  const cobaltUrl = 'https://cobaltapi.kittycat.boo/';
  const videoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  console.log(`Requesting Cobalt download for: ${videoUrl}`);
  
  try {
    const res = await fetch(cobaltUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: videoUrl,
        videoQuality: '720',
        filenameStyle: 'basic'
      })
    });
    
    const data = await res.json();
    console.log('Cobalt response:', JSON.stringify(data, null, 2));
    
    if (data.status === 'tunnel') {
      const downloadUrl = data.url;
      console.log(`Downloading file from tunnel: ${downloadUrl}`);
      const fileRes = await fetch(downloadUrl);
      if (!fileRes.ok) {
        throw new Error(`Failed to fetch media file: HTTP ${fileRes.status}`);
      }
      
      const buffer = Buffer.from(await fileRes.arrayBuffer());
      const testFilePath = path.join(__dirname, 'rickroll_test.mp4');
      fs.writeFileSync(testFilePath, buffer);
      
      const stats = fs.statSync(testFilePath);
      console.log(`Download completed successfully! File size: ${stats.size} bytes`);
      fs.unlinkSync(testFilePath); // Clean up test file
    } else {
      console.log('Failed: response status was not tunnel');
    }
  } catch (err) {
    console.error('Download failed:', err);
  }
}

testDownload();
