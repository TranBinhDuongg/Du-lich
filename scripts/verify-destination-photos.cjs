const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const E = require('../assets/js/planner-engine.js');
const photos = require('../assets/data/destination-images.json');
const root = path.resolve(__dirname, '..');
const fields = ['image', 'imageAlt', 'imageAttribution', 'imageSource', 'imageOriginalUrl', 'imageLicense'];
assert.equal(Object.keys(photos).length, 94);
assert.deepEqual(Object.values(E.destinations).filter(d => d.image.includes('placeholder')).map(d => d.name).sort(), ['Khu du lịch Hồng Hà', 'Suối Giác Mại']);
for (const [id, photo] of Object.entries(photos)) {
  assert.ok(fs.existsSync(path.join(root, photo.image)), id);
  assert.equal(E.destinations[id].image, photo.image);
  assert.ok(/^https:\/\//.test(photo.imageSource), id);
}
// Old snapshots keep their itinerary and pick up current photos without mutation.
for (const route of E.routes) {
  const plan = E.generate({destination: route.destinationIds[0], routeId: route.id, days: route.duration, people: 2, budget: 3000000, interests: ['Văn hóa']});
  for (const day of plan.days) for (const a of day.activities) for (const field of fields) delete a[field];
  const snapshot = JSON.stringify(plan);
  for (let i = 0; i < plan.days.length; i++) {
    E.scheduleDay(plan, i).forEach((a, j) => {
      const place = E.destinations[a.destinationId];
      if (place && !place.image.includes('placeholder')) assert.equal(a.image, place.image);
      if (!place) assert.equal(a.image, undefined);
      assert.equal(a.name, plan.days[i].activities[j].name);
      assert.equal(a.time, plan.days[i].activities[j].time);
    });
  }
  assert.equal(JSON.stringify(plan), snapshot);
}
console.log('PASS: 94 new photos, 2 explicitly unresolved places; old snapshots receive photos without changing saved content.');

if (process.argv.includes('--browser')) (async () => {
  const {chromium} = require('playwright');
  const browser = await chromium.launch({channel: 'msedge', headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    let days = 0, images = 0;
    for (const route of E.routes) {
      const url = pathToFileURL(path.join(root, 'plan.html')).href + '?route=' + route.id;
      await page.goto(url);
      for (let day = 1; day <= route.duration; day++) {
        await page.locator(`[data-day="${day}"]`).click();
        const result = await page.locator('#day-content').evaluate(async el => {
          const imgs = [...el.querySelectorAll('img')];
          return Promise.all(imgs.map(async img => {
            img.loading = 'eager';
            try { await img.decode(); } catch {}
            return {src: img.getAttribute('src'), loaded: img.naturalWidth > 0};
          }));
        });
        assert.ok(result.every(img => img.loaded), route.id + ': ' + JSON.stringify(result));
        const expected = E.uniquePhotoDay(route, day - 1).filter(a => a.image).length;
        assert.equal(result.length, expected, route.id + ' day ' + day);
        days++; images += result.length;
      }
    }
    assert.deepEqual(errors, []);
    await page.goto(pathToFileURL(path.join(root, 'plan.html')).href + '?route=an-giang-2n1d');
    await page.locator('#day-content img').first().scrollIntoViewIfNeeded();
    await page.screenshot({path: path.join(root, 'artifacts/destination-photos-desktop.png')});
    await page.setViewportSize({width: 390, height: 844});
    await page.locator('#day-content img').first().scrollIntoViewIfNeeded();
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile page must not overflow horizontally');
    await page.screenshot({path: path.join(root, 'artifacts/destination-photos-mobile.png')});
    console.log(`PASS: all ${days} days across 16 routes, ${images} activity photos decoded in the browser; no script errors.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
