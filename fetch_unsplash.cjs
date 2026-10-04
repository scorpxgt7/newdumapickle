const https = require('https');
https.get('https://unsplash.com/s/photos/pickleball', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+/g;
    const matches = data.match(regex);
    if (matches) {
      console.log(Array.from(new Set(matches)).slice(0, 5));
    }
  });
});
