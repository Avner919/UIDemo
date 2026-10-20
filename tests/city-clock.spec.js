const { test, expect } = require('@playwright/test');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

test('selecting a city shows its local date and time and the clock keeps ticking', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  // A fixed UTC instant makes timezone and date-rollover checks independent of
  // the machine's timezone and the real time at which the test runs.
  await page.clock.install({ time: new Date('2026-10-20T22:59:58Z') });
  await page.clock.pauseAt(new Date('2026-10-20T22:59:59Z'));
  await page.goto(pathToFileURL(path.join(__dirname, '..', 'index.html')).href);

  const city = page.getByRole('combobox', { name: 'Choose a city' });
  const clock = page.getByLabel('Current local time');
  const date = page.locator('#date');
  await expect(page.getByRole('heading', { name: 'City Clock' })).toBeVisible();
  await expect(city).toHaveValue('Europe/London');
  await expect(city.getByRole('option')).toHaveText([
    'London', 'Paris', 'New York', 'Tokyo', 'Moscow',
  ]);

  const cities = [
    ['London', '23:59:59', 'Tuesday, 20 October 2026'],
    ['Paris', '00:59:59', 'Wednesday, 21 October 2026'],
    ['New York', '18:59:59', 'Tuesday, 20 October 2026'],
    ['Tokyo', '07:59:59', 'Wednesday, 21 October 2026'],
    ['Moscow', '01:59:59', 'Wednesday, 21 October 2026'],
  ];
  for (const [name, expectedTime, expectedDate] of cities) {
    await city.selectOption({ label: name });
    await expect(clock).toHaveText(expectedTime);
    await expect(date).toHaveText(expectedDate);
  }

  // Return to London to verify that the next timer tick crosses midnight.
  await city.selectOption({ label: 'London' });
  await page.clock.runFor(1000);
  await expect(clock).toHaveText('00:00:00');
  await expect(date).toHaveText('Wednesday, 21 October 2026');
  expect(errors).toEqual([]);
});
