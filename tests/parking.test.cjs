// 자동 테스트: 실제 크롬 브라우저로 parking/index.html을 열어 기능을 하나씩 확인합니다.
// 실행: npm install && npm test
const { chromium, devices } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const APP_DIR = path.join(__dirname, '..', 'parking');
const PAGE_URL = pathToFileURL(path.join(APP_DIR, 'index.html')).href;
const PHOTO_PREFIX = 'parking-photo-v1:';

const results = [];
const pageErrors = [];

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, ok: true });
    console.log('  ✓ ' + name);
  } catch (err) {
    results.push({ name, ok: false });
    console.log('  ✗ ' + name);
    console.log('    ' + String(err && err.stack || err).split('\n').join('\n    '));
  }
}

// Each call gets its own browser profile folder, like a separate phone.
function newProfileDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'chungnyeong-parking-'));
}

async function openBrowser(profileDir, options = {}, { url = PAGE_URL, beforeGoto } = {}) {
  const context = await chromium.launchPersistentContext(profileDir, {
    timezoneId: 'Asia/Seoul',
    locale: 'ko-KR',
    ...options,
  });
  // Fonts come from the internet; the tests should not depend on it.
  await context.route(/^https?:\/\/fonts\./, (route) => route.abort());
  const page = context.pages()[0] || await context.newPage();
  page.on('pageerror', (err) => pageErrors.push(err.message));
  if (beforeGoto) await beforeGoto(context, page);
  await page.goto(url);
  return { context, page };
}

const nowSpot = (page) => page.locator('#now-spot').textContent();
const nowWhere = (page) => page.locator('#now-where').textContent();
const recSpots = (page) => page.locator('#days .rec .rec-spot').evaluateAll((els) => els.map((el) => el.firstChild.textContent));

async function park(page, place, spot) {
  await page.click(`label[for="place-${place}"]`);
  if (place === 'outside') await page.fill('#outside-name', spot);
  else await page.locator(`#spots-${place} .opt`, { hasText: spot }).click();
  await page.click('.btn-save');
}

// A big, detailed JPEG like a phone camera makes (made in the browser so no image files are needed).
async function cameraPhoto(page, width = 4000, height = 3000) {
  const b64 = await page.evaluate(([w, h]) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    const img = g.createImageData(w, h);
    let seed = 7;
    for (let i = 0; i < img.data.length; i += 4) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      img.data[i] = seed & 255;
      img.data[i + 1] = (seed >> 8) & 255;
      img.data[i + 2] = (seed >> 16) & 255;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL('image/jpeg', 0.92).split(',')[1];
  }, [width, height]);
  return { name: 'IMG_0001.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(b64, 'base64') };
}

async function storedPhotoIds(page) {
  return page.evaluate((prefix) => Object.keys(localStorage)
    .filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length)).sort(), PHOTO_PREFIX);
}

function serveApp() {
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/parking\//, '');
    if (rel === '' || rel.endsWith('/')) rel += 'index.html';
    const file = path.join(APP_DIR, rel);
    if (!file.startsWith(APP_DIR) || !fs.existsSync(file)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

(async () => {
  console.log('주차 위치 — 자동 테스트\n');

  await test('처음 열면 안내가 보이고, 집 선택지(지하주차장 1곳 + 야외주차장 9곳)가 나온다', async () => {
    const { context, page } = await openBrowser(newProfileDir());
    assert.ok(await page.locator('#now-empty').isVisible());
    assert.ok(await page.locator('#now').isHidden());
    assert.ok(await page.locator('#history-empty').isVisible());
    assert.ok(await page.locator('#storage-warning').isHidden());
    assert.equal(await page.locator('#spots-home .opt-wide').textContent(), '지하주차장');
    const outdoor = await page.locator('#spots-home .opts .opt-label').allTextContents();
    assert.deepEqual(outdoor, ['101동 앞', '102동 앞', '103동 앞', '104동 앞', '105동 앞', '106동 앞', '107동 앞', '정문 쪽', '관리사무소 앞']);
    assert.ok(await page.locator('#spots-office').isHidden());
    await context.close();
  });

  await test('집 지하주차장을 저장하면 맨 위에 크게 보인다', async () => {
    const { context, page } = await openBrowser(newProfileDir());
    await park(page, 'home', '지하주차장');
    assert.ok(await page.locator('#now').isVisible());
    assert.equal(await nowSpot(page), '지하주차장');
    assert.equal(await nowWhere(page), '집');
    assert.equal(await page.locator('#now').getAttribute('data-place'), 'home');
    assert.match(await page.locator('#now-time').textContent(), /^오늘 오[전후] \d{1,2}:\d{2} 저장$/);
    assert.equal(await page.locator('#now-ago').textContent(), '방금 전');
    assert.ok(await page.locator('#toast').isVisible());
    assert.equal(await page.locator('#spots-home input:checked').count(), 0, '저장 후 선택이 비워져야 함');
    await context.close();
  });

  await test('야외주차장·사무실 층·외부를 차례로 저장하면 가장 최근 것이 지금 위치가 된다', async () => {
    const { context, page } = await openBrowser(newProfileDir());
    await park(page, 'home', '105동 앞');
    assert.equal(await nowSpot(page), '105동 앞');
    assert.equal(await nowWhere(page), '집 · 야외주차장');

    await page.click('label[for="place-office"]');
    assert.deepEqual(await page.locator('#spots-office .opt-label').allTextContents(), ['B1', 'B2', 'B3', 'B4']);
    await park(page, 'office', 'B3');
    assert.equal(await nowSpot(page), '지하 3층');
    assert.equal(await nowWhere(page), '사무실');
    assert.equal(await page.locator('#now').getAttribute('data-place'), 'office');

    await park(page, 'outside', '  세종시청   지하 2층 ');
    assert.equal(await nowSpot(page), '세종시청 지하 2층', '앞뒤·중복 공백이 정리되어야 함');
    assert.equal(await nowWhere(page), '외부');

    assert.deepEqual(await recSpots(page), ['세종시청 지하 2층', '지하 3층', '105동 앞']);
    assert.equal(await page.locator('#days .rec-now').count(), 1);
    assert.equal(await page.locator('#days .rec').first().locator('.rec-now').textContent(), '지금');
    assert.equal(await page.locator('#days .day-title').allTextContents().then((t) => t.join()), '오늘');
    assert.equal(await page.locator('#history-count').textContent(), '총 3건');
    await context.close();
  });

  await test('고르지 않거나 외부 장소 이름이 비어 있으면 저장되지 않고 안내 문구가 나온다', async () => {
    const { context, page } = await openBrowser(newProfileDir());
    await page.click('.btn-save');
    assert.equal(await page.locator('#form-msg').textContent(), '주차한 곳을 하나 골라 주세요.');
    assert.ok(await page.locator('#now').isHidden());
    await page.locator('#spots-home .opt', { hasText: '101동 앞' }).click();
    assert.ok(await page.locator('#form-msg').isHidden(), '고르면 안내 문구가 사라져야 함');

    await page.click('label[for="place-outside"]');
    await page.fill('#outside-name', '   ');
    await page.click('.btn-save');
    assert.equal(await page.locator('#form-msg').textContent(), '주차한 곳의 이름을 적어 주세요.');
    assert.equal(await page.getAttribute('#outside-name', 'aria-invalid'), 'true');
    assert.equal(await page.locator('#days .rec').count(), 0);
    await context.close();
  });

  await test('외부에서 최근에 주차한 곳을 버튼으로 다시 고를 수 있다', async () => {
    const { context, page } = await openBrowser(newProfileDir());
    assert.ok(await page.locator('#recent').isHidden());
    await park(page, 'outside', '홈플러스 세종점 옥상');
    await park(page, 'office', 'B1');
    await park(page, 'outside', '대전지방법원 세종지원');
    await page.click('label[for="place-outside"]');
    assert.deepEqual(await page.locator('#recent-chips .chip').allTextContents(), ['대전지방법원 세종지원', '홈플러스 세종점 옥상']);
    await page.locator('#recent-chips .chip', { hasText: '홈플러스' }).click();
    assert.equal(await page.inputValue('#outside-name'), '홈플러스 세종점 옥상');
    await page.press('#outside-name', 'Enter');
    assert.equal(await nowSpot(page), '홈플러스 세종점 옥상');
    await context.close();
  });

  await test('사진은 크기를 줄여 저장되고, 브라우저를 껐다 켜도 기록과 사진이 남아 있다', async () => {
    const dir = newProfileDir();
    let { context, page } = await openBrowser(dir);
    const photo = await cameraPhoto(page);
    await page.locator('#spots-home .opt', { hasText: '지하주차장' }).click();
    await page.setInputFiles('#photo-camera', photo);
    await page.locator('#photo-preview').waitFor();
    await page.click('.btn-save');
    assert.ok(await page.locator('#now-photo').isVisible());
    assert.ok(await page.locator('#photo-preview').isHidden(), '저장 후 미리보기는 비워져야 함');
    await context.close(); // 브라우저 종료

    ({ context, page } = await openBrowser(dir)); // 같은 프로필로 다시 실행
    assert.equal(await nowSpot(page), '지하주차장');
    assert.ok(await page.locator('#now-photo').isVisible());
    const size = await page.$eval('#now-photo-img', (img) => ({ w: img.naturalWidth, h: img.naturalHeight, len: img.src.length }));
    assert.equal(Math.max(size.w, size.h), 1280, '긴 변이 1280px로 줄어야 함');
    assert.equal(size.w / size.h, 4 / 3, '가로세로 비율 유지');
    assert.ok(size.len < photo.buffer.length / 2, `원본(${photo.buffer.length}바이트)보다 충분히 작아야 함: ${size.len}`);
    assert.match(await page.$eval('#now-photo-img', (img) => img.src.slice(0, 23)), /^data:image\/jpeg;base64,/);

    await page.click('#now-photo');
    assert.ok(await page.locator('#viewer').isVisible(), '사진을 누르면 크게 보여야 함');
    await page.click('#viewer');
    assert.ok(await page.locator('#viewer').isHidden());
    await context.close();
  });

  await test('사진은 오늘 것과 지금 위치 것만 남고, 지난 사진은 지워져도 체크 기록은 남는다', async () => {
    const at = (s) => new Date(s + '+09:00').getTime();
    const seed = async (records, photoIds) => {
      const dir = newProfileDir();
      const { context, page } = await openBrowser(dir, {}, {
        beforeGoto: (ctx, p) => p.clock.setFixedTime(new Date('2026-10-22T12:00:00+09:00')),
      });
      await page.evaluate(([recs, ids, prefix]) => {
        localStorage.setItem('parking-records-v1', JSON.stringify(recs));
        for (const id of ids) localStorage.setItem(prefix + id, 'data:image/jpeg;base64,/9j/');
      }, [records, photoIds, PHOTO_PREFIX]);
      await page.reload();
      return { context, page };
    };

    // 지금 위치(오늘 11:50, 사진 없음) / 오늘 아침(사진) / 어제(사진) / 그제(사진)
    let { context, page } = await seed([
      { id: 'e', place: 'office', zone: '', spot: '지하 2층', at: at('2026-10-22T11:50:00'), photo: false },
      { id: 'd', place: 'home', zone: '지하주차장', spot: '', at: at('2026-10-22T08:00:00'), photo: true },
      { id: 'b', place: 'outside', zone: '', spot: '세종시청', at: at('2026-10-21T19:00:00'), photo: true },
      { id: 'a', place: 'home', zone: '야외주차장', spot: '103동 앞', at: at('2026-10-20T09:00:00'), photo: true },
    ], ['d', 'b', 'a']);
    assert.deepEqual(await storedPhotoIds(page), ['d']);
    assert.deepEqual(await recSpots(page), ['지하 2층', '지하주차장', '세종시청', '103동 앞'], '체크 기록은 모두 남아야 함');
    assert.deepEqual(await page.locator('#days .day-title').allTextContents(), ['오늘', '어제', '10월 20일 (화)']);
    assert.equal(await page.locator('#days .rec-photo').count(), 1);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('parking-records-v1')));
    assert.deepEqual(saved.map((r) => r.photo), [false, true, false, false]);
    await context.close();

    // 사흘 전에 세워 두고 아직 그대로라면, 그 사진은 지우지 않는다.
    ({ context, page } = await seed([
      { id: 'c', place: 'home', zone: '야외주차장', spot: '정문 쪽', at: at('2026-10-19T21:00:00'), photo: true },
    ], ['c']));
    assert.deepEqual(await storedPhotoIds(page), ['c']);
    assert.ok(await page.locator('#now-photo').isVisible());
    assert.equal(await page.locator('#now-ago').textContent(), '2일 전');
    await context.close();
  });

  await test('사진 저장 공간이 모자라면 기록만 저장하고 그렇다고 알려 준다', async () => {
    const { context, page } = await openBrowser(newProfileDir(), {}, {
      beforeGoto: (ctx) => ctx.addInitScript(() => {
        const setItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
          if (String(key).startsWith('parking-photo')) throw new DOMException('full', 'QuotaExceededError');
          return setItem.call(this, key, value);
        };
      }),
    });
    await page.locator('#spots-home .opt', { hasText: '107동 앞' }).click();
    await page.setInputFiles('#photo-album', await cameraPhoto(page, 800, 600));
    await page.locator('#photo-preview').waitFor();
    await page.click('.btn-save');
    assert.equal(await nowSpot(page), '107동 앞');
    assert.ok(await page.locator('#now-photo').isHidden());
    assert.match(await page.locator('#toast-text').textContent(), /사진은 저장 공간이 부족해/);
    assert.ok(await page.locator('#storage-warning').isHidden(), '기록 자체는 저장되므로 경고는 없어야 함');
    await context.close();
  });

  await test('사진이 아닌 파일을 고르면 안내가 나오고, 기록은 그대로 저장할 수 있다', async () => {
    const { context, page } = await openBrowser(newProfileDir());
    await page.setInputFiles('#photo-album', { name: 'memo.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('not a picture') });
    await page.locator('#photo-msg').waitFor();
    assert.ok(await page.locator('#photo-preview').isHidden());
    await park(page, 'home', '101동 앞');
    assert.equal(await nowSpot(page), '101동 앞');
    assert.ok(await page.locator('#now-photo').isHidden());
    await context.close();
  });

  await test('기록을 지우면 바로 전 기록이 지금 위치가 되고, 되돌리기로 사진까지 돌아온다', async () => {
    const dir = newProfileDir();
    let { context, page } = await openBrowser(dir);
    await park(page, 'home', '102동 앞');
    await page.click('label[for="place-office"]');
    await page.locator('#spots-office .opt', { hasText: 'B2' }).click();
    await page.setInputFiles('#photo-camera', await cameraPhoto(page, 900, 1200));
    await page.locator('#photo-preview').waitFor();
    await page.click('.btn-save');
    assert.equal(await nowSpot(page), '지하 2층');

    await page.locator('#days .rec').first().locator('.rec-del').click();
    assert.equal(await nowSpot(page), '102동 앞');
    assert.deepEqual(await storedPhotoIds(page), []);
    assert.equal(await page.locator('#toast-text').textContent(), '기록을 삭제했어요.');
    await page.click('#undo');
    assert.equal(await nowSpot(page), '지하 2층');
    assert.ok(await page.locator('#now-photo').isVisible());
    assert.equal((await storedPhotoIds(page)).length, 1);
    await context.close();

    ({ context, page } = await openBrowser(dir));
    assert.deepEqual(await recSpots(page), ['지하 2층', '102동 앞']);
    await context.close();
  });

  await test('저장 직후 되돌리기를 누르면 방금 저장한 기록이 취소된다', async () => {
    const { context, page } = await openBrowser(newProfileDir());
    await park(page, 'home', '104동 앞');
    await park(page, 'home', '106동 앞');
    await page.click('#undo');
    assert.equal(await nowSpot(page), '104동 앞');
    assert.deepEqual(await recSpots(page), ['104동 앞']);
    assert.ok(await page.locator('#toast').isHidden());
    await context.close();
  });

  await test('기록이 20건을 넘으면 ‘이전 기록 더 보기’로 나머지를 본다', async () => {
    const { context, page } = await openBrowser(newProfileDir());
    await page.evaluate(() => {
      const start = Date.now() - 25 * 3600e3;
      const recs = Array.from({ length: 25 }, (_, i) => ({ id: 'r' + i, place: 'office', zone: '', spot: '지하 ' + (i % 4 + 1) + '층', at: start + i * 3600e3, photo: false }));
      localStorage.setItem('parking-records-v1', JSON.stringify(recs));
    });
    await page.reload();
    assert.equal(await page.locator('#days .rec').count(), 20);
    assert.equal(await page.locator('#history-count').textContent(), '총 25건');
    await page.click('#more');
    assert.equal(await page.locator('#days .rec').count(), 25);
    assert.ok(await page.locator('#more').isHidden());
    await context.close();
  });

  await test('장소 이름에 HTML 코드가 있어도 실행되지 않고 글자 그대로 보인다', async () => {
    const { context, page } = await openBrowser(newProfileDir());
    const nasty = '<img src=x onerror="window.__hacked=1">';
    await park(page, 'outside', nasty);
    assert.equal(await nowSpot(page), nasty);
    assert.equal(await recSpots(page).then((s) => s[0]), nasty);
    assert.equal(await page.evaluate(() => window.__hacked), undefined);
    await context.close();
  });

  await test('저장이 막힌 브라우저에서도 화면은 동작하고 안내 문구가 나온다', async () => {
    const { context, page } = await openBrowser(newProfileDir(), {}, {
      beforeGoto: (ctx) => ctx.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', {
          get() { throw new DOMException('blocked', 'SecurityError'); },
        });
      }),
    });
    assert.ok(await page.locator('#storage-warning').isVisible());
    await page.locator('#spots-home .opt', { hasText: '정문 쪽' }).click();
    await page.setInputFiles('#photo-camera', await cameraPhoto(page, 800, 600));
    await page.locator('#photo-preview').waitFor();
    await page.click('.btn-save');
    assert.equal(await nowSpot(page), '정문 쪽');
    assert.ok(await page.locator('#now-photo').isVisible());
    await context.close();
  });

  await test('인터넷이 끊겨도(지하주차장 등) 한 번 열었던 앱은 다시 열린다', async () => {
    const server = await serveApp();
    const url = `http://127.0.0.1:${server.address().port}/parking/`;
    try {
      const dir = newProfileDir();
      let { context, page } = await openBrowser(dir, {}, { url });
      await page.evaluate(() => navigator.serviceWorker.ready);
      await page.reload(); // now served through the service worker
      await park(page, 'home', '103동 앞');
      await context.setOffline(true);
      await page.reload();
      assert.equal(await nowSpot(page), '103동 앞');
      await park(page, 'office', 'B4');
      assert.equal(await nowSpot(page), '지하 4층');
      await context.close();
    } finally {
      server.close();
    }
  });

  for (const [label, viewport] of [['아이폰 13 (390px)', devices['iPhone 13'].viewport], ['작은 휴대폰 (320px)', { width: 320, height: 640 }]]) {
    await test(`스마트폰 화면 ${label}에서 가로로 넘치지 않고 버튼이 누르기 충분히 크다`, async () => {
      const { context, page } = await openBrowser(newProfileDir(), {
        viewport,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: devices['iPhone 13'].userAgent,
      });
      await page.locator('label[for="place-outside"]').tap();
      await page.fill('#outside-name', '띄어쓰기없이아주길게적은주차장이름'.repeat(3));
      await page.locator('.btn-save').tap();
      await page.locator('label[for="place-home"]').tap();
      await page.locator('#spots-home .opt', { hasText: '관리사무소 앞' }).tap();
      assert.ok(await page.locator('#spots-home .opt', { hasText: '관리사무소 앞' }).locator('input').isChecked(), '손가락 탭으로 선택');
      await page.locator('.btn-save').tap();
      await page.locator('label[for="place-office"]').tap();
      await page.locator('#spots-office .opt', { hasText: 'B1' }).tap();
      await page.locator('.btn-save').tap();

      const widths = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      assert.ok(widths.scroll <= widths.client, `가로 넘침: ${widths.scroll} > ${widths.client}`);
      for (const sel of ['.place-tab', '#spots-office .opt', '.btn-photo', '.btn-text', '.btn-save', '#days .rec-del']) {
        const box = await page.locator(sel).first().boundingBox();
        assert.ok(box.height >= 44 && box.width >= 44, `${sel} 크기가 작음: ${box.width}x${box.height}`);
        assert.ok(box.x + box.width <= widths.client, `${sel}이(가) 화면 밖으로 나감`);
      }
      await page.locator('label[for="place-outside"]').tap();
      const fontSize = await page.$eval('#outside-name', (el) => parseFloat(getComputedStyle(el).fontSize));
      assert.ok(fontSize >= 16, '아이폰에서 입력 시 화면이 확대되지 않으려면 16px 이상이어야 함');

      await page.reload(); // 앱을 새로 연 상태
      const spotSize = await page.$eval('#now-spot', (el) => parseFloat(getComputedStyle(el).fontSize));
      assert.equal(await nowSpot(page), '지하 1층');
      assert.ok(spotSize >= 44, `지금 위치 글자가 한눈에 보일 만큼 커야 함: ${spotSize}px`);
      const nowBox = await page.locator('#now').boundingBox();
      assert.ok(nowBox.y + nowBox.height <= viewport.height, '앱을 열면 지금 위치가 스크롤 없이 첫 화면에 다 보여야 함');
      await context.close();
    });
  }

  await test('페이지에서 스크립트 오류가 발생하지 않는다', async () => {
    assert.deepEqual(pageErrors, []);
  });

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}개 통과, ${failed}개 실패`);
  process.exit(failed ? 1 : 0);
})();
