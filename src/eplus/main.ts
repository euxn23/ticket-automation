import puppeteer from 'puppeteer';
import dayjs from 'dayjs';
import path from 'path';
import { promisify } from 'util';

const sleep = promisify(setTimeout);

const eplusUrl = 'https://eplus.jp/sf/detail/3222720001';

async function waitUntilJustNoon() {
  await sleep(100);
  if (!(dayjs().hour() === 12)) {
    await waitUntilJustNoon();
  }
}

async function main() {
  const { EPLUS_EMAIL, EPLUS_PASSWORD } = process.env;

  if (!EPLUS_EMAIL || !EPLUS_PASSWORD) {
    throw new Error('param not set');
  }

  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: 1080, height: 1920 });
    await page.goto(eplusUrl);
    await page.click('.block-ticket__footer > button');
    await sleep(500);
    await page.click('.login-bt > a');
    await page.waitForNavigation();
    await sleep(500);
    await page.type('input[name=loginId]', EPLUS_EMAIL);
    await sleep(500);
    await page.type('input[name=loginPassword]', EPLUS_PASSWORD);
    await sleep(500);
    await page.click('#idPwLogin');

    await page.select('select[name=uji.model.583413.combo]', '001/2');

    // ここまでは開始前でもいける

    await waitUntilJustNoon();

    await page.click('.enter-bt > a');

    await page.evaluate(
      s => (document.querySelector(s).checked = true),
      'accept-con > input'
    );
    await page.evaluate(
      s => (document.querySelector(s).checked = true),
      '.iselect-area > .con > input'
    );

    await page.click('.enter-bt > span > a');

    await page.waitForNavigation();

    await page.click('.enter-bt > a');

    await browser.close();
  } catch (e) {
    await page.screenshot({
      path: path.resolve(process.cwd(), 'screenshot', 'eplus.png')
    });
    throw e;
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
