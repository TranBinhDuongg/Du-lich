const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const sources = require('../assets/data/destination-photo-sources.json');

async function main() {
  await fs.mkdir(path.join(root, 'assets/images/destinations'), { recursive: true });
  const entries = Object.entries(sources);
  let previous = {};
  try { previous = JSON.parse(await fs.readFile(path.join(root, 'assets/data/destination-images.json'), 'utf8')); } catch {}
  const results = {};
  const failures = [];
  let cursor = 0;
  await Promise.all(Array.from({length: 6}, async () => {
    while (cursor < entries.length) {
      const [id, photo] = entries[cursor++];
      const image = 'assets/images/destinations/' + id + '.webp';
      try {
        let metadata;
        if(previous[id]?.imageOriginalUrl === photo.url) {
          try { metadata = await sharp(path.join(root, image)).metadata(); } catch {}
        }
        if (!metadata) {
          const response = await fetch(photo.url, {
            signal: AbortSignal.timeout(25000),
            headers: {'User-Agent': 'Mozilla/5.0', Referer: new URL(photo.source).href},
          });
          if (!response.ok) throw new Error('HTTP ' + response.status);
          const buffer = Buffer.from(await response.arrayBuffer());
          metadata = await sharp(buffer).metadata();
          if (metadata.width < 300 || metadata.height < 180) throw new Error('Image too small');
          await sharp(buffer).rotate().resize({width: 1200, withoutEnlargement: true})
            .webp({quality: 85}).toFile(path.join(root, image));
        }
        results[id] = {
          image, imageAlt: photo.name + ' · ' + photo.region,
          imageAttribution: photo.name + ' · Nguồn: ' + photo.title,
          imageSource: photo.source, imageOriginalUrl: photo.url,
          ...(photo.license ? {imageLicense: photo.license} : {}),
        };
        console.log('OK ' + id);
      } catch (error) {
        failures.push({id, message: error.message});
        console.log('FAILED ' + id + ': ' + error.message);
      }
    }
  }));
  await fs.writeFile(path.join(root, 'assets/data/destination-images.json'), JSON.stringify(results, null, 2) + '\n');
  await fs.mkdir(path.join(root, 'artifacts'), {recursive: true});
  await fs.writeFile(path.join(root, 'artifacts/photo-import-failures.json'), JSON.stringify(failures, null, 2) + '\n');
  console.log(JSON.stringify({downloaded: Object.keys(results).length, failures}));
  if (failures.length) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
