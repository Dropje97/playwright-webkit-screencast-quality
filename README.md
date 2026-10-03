# WebKit screencast ignores the requested JPEG quality

Minimal reproduction: on Linux, Playwright's WebKit encodes screencast frames
(also used for video recording) at JPEG quality 90 whatever quality is
requested, while Chromium follows the requested quality.

```sh
npm install
npx playwright install chromium webkit
node repro.mjs
```

The script requests qualities 10, 50 and 100 through
`page.screencast.start({ quality, onFrame })` and prints the largest JPEG
quantisation value of the first frame; quality 100 should give 1.

Output with Playwright 1.63.0:

```
chromium 153.0.8010.12: quality 10 -> max quantisation 255, quality 50 -> max quantisation 121, quality 100 -> max quantisation 1
webkit 26.6: quality 10 -> max quantisation 24, quality 50 -> max quantisation 24, quality 100 -> max quantisation 24
```
