import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const ASSET_DIR = path.resolve('public/sites/facebook-com/root');
fs.mkdirSync(path.join(ASSET_DIR, 'images'), { recursive: true });

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve(dest));
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

async function main() {
  const assetsToDownload = [
    {
      url: 'https://static.xx.fbcdn.net/rsrc.php/y1/r/ay1hV6OlegS.ico',
      filename: 'favicon.ico'
    },
    {
      url: 'https://static.xx.fbcdn.net/rsrc.php/y8/r/dF5S-vM48FY.svg',
      filename: 'images/facebook-logo.svg'
    }
  ];

  for (const item of assetsToDownload) {
    const targetPath = path.join(ASSET_DIR, item.filename);
    try {
      console.log(`Downloading ${item.url} -> ${item.filename}...`);
      await downloadFile(item.url, targetPath);
      console.log(`✓ Downloaded ${item.filename}`);
    } catch (err) {
      console.error(`Error downloading ${item.url}:`, err.message);
    }
  }
}

main();
