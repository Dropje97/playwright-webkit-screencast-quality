// Prints the largest JPEG quantisation value of the first screencast frame
// for several requested qualities. Higher quality should give smaller values,
// and quality 100 should give 1.
import { chromium, webkit } from 'playwright';

function maxQuantisation(jpeg) {
  let max = 0;
  for (let offset = 2; offset + 4 <= jpeg.length && jpeg[offset] === 0xff;) {
    const marker = jpeg[offset + 1];
    const end = offset + 2 + jpeg.readUInt16BE(offset + 2);
    if (marker === 0xda) break;
    for (let table = offset + 4; marker === 0xdb && table < end;) {
      const wide = jpeg[table] >> 4;
      for (let i = 0; i < 64; i++)
        max = Math.max(max, wide ? jpeg.readUInt16BE(table + 1 + i * 2) : jpeg[table + 1 + i]);
      table += 1 + 64 * (wide ? 2 : 1);
    }
    offset = end;
  }
  return max;
}

for (const browserType of [chromium, webkit]) {
  const browser = await browserType.launch();
  const page = await browser.newPage();
  await page.setContent('<h1>Screencast quality</h1>');
  const results = [];
  for (const quality of [10, 50, 100]) {
    let frame;
    await page.screencast.start({ quality, onFrame: ({ data }) => { frame ??= data; } });
    for (let i = 0; !frame && i < 20; i++) {
      await page.evaluate(i => document.body.style.background = i % 2 ? '#fff' : '#fefefe', i);
      await page.waitForTimeout(100);
    }
    await page.screencast.stop();
    results.push(`quality ${quality} -> max quantisation ${maxQuantisation(frame)}`);
  }
  console.log(`${browserType.name()} ${browser.version()}: ${results.join(', ')}`);
  await browser.close();
}
