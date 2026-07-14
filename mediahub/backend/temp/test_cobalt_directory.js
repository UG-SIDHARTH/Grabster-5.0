async function run() {
  try {
    const res = await fetch('https://cobalt.directory/api/instances');
    console.log('Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Instances found:', Array.isArray(data) ? data.length : typeof data);
      if (Array.isArray(data)) {
        // print first 5 instances and their details
        console.log('First 5 instances:', JSON.stringify(data.slice(0, 5), null, 2));
      } else {
        console.log('Raw data structure:', JSON.stringify(data, null, 2));
      }
    } else {
      console.log('Failed response body:', await res.text());
    }
  } catch (err) {
    console.error('Error fetching instances:', err);
  }
}

run();
