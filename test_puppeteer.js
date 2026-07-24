const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://localhost:8000/appointment.html');
  await page.select('#aptDepartment', 'Cardiology');
  const docHtml = await page.$eval('#aptDoctor', el => el.innerHTML);
  console.log('DOCTOR HTML:', docHtml);
  const allDocs = await page.evaluate(() => JSON.stringify(StorageManager.getDoctors()));
  console.log('ALL DOCS:', allDocs);
  await browser.close();
})();
