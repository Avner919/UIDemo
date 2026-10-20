# City Clock

Open `index.html` in a browser to choose a city and see its local time.

## End-to-end test

Requires Node.js and Google Chrome. From this directory, run:

```sh
npm ci
npm run test:e2e
```

The single Playwright test opens the standalone page in headless Chrome,
checks all five cities, advances the clock through midnight, and checks
for browser errors. Screenshots and traces are saved in `test-results/`
when the test fails.
