import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const TARGET_URL = 'https://www.facebook.com/';
const SCREENSHOT_DIR = path.resolve('docs/design-references/facebook-com/root');
const RESEARCH_DIR = path.resolve('docs/research/facebook-com/root');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
fs.mkdirSync(RESEARCH_DIR, { recursive: true });

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Desktop Screenshot
  console.log('Navigating at 1440x900...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'desktop.png'), fullPage: true });

  // Tablet Screenshot
  console.log('Navigating at 768x1024...');
  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 2 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'tablet.png'), fullPage: true });

  // Mobile Screenshot
  console.log('Navigating at 390x844...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile.png'), fullPage: true });

  // Reset to Desktop for DOM/CSS extraction
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });

  console.log('Extracting CSS design tokens and DOM tree...');
  const extraction = await page.evaluate(() => {
    const props = [
      'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
      'textTransform','textDecoration','backgroundColor','background',
      'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
      'margin','marginTop','marginRight','marginBottom','marginLeft',
      'width','height','maxWidth','minWidth','maxHeight','minHeight',
      'display','flexDirection','justifyContent','alignItems','gap',
      'gridTemplateColumns','gridTemplateRows',
      'borderRadius','border','borderTop','borderBottom','borderLeft','borderRight',
      'boxShadow','overflow','opacity','transform','transition','cursor',
      'textAlign','verticalAlign','boxSizing'
    ];

    function extractElement(el) {
      if (!el || el.nodeType !== 1) return null;
      const cs = window.getComputedStyle(el);
      const styles = {};
      props.forEach(p => {
        const v = cs[p];
        if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') {
          styles[p] = v;
        }
      });

      const children = Array.from(el.children).map(extractElement).filter(Boolean);

      let text = null;
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
        text = el.childNodes[0].nodeValue.trim();
      }

      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        className: el.className?.toString() || null,
        attributes: {
          type: el.getAttribute('type'),
          name: el.getAttribute('name'),
          placeholder: el.getAttribute('placeholder'),
          href: el.getAttribute('href'),
          src: el.getAttribute('src'),
          alt: el.getAttribute('alt'),
          ariaLabel: el.getAttribute('aria-label')
        },
        text: text,
        styles: styles,
        children: children.length > 0 ? children : undefined
      };
    }

    // Asset Discovery
    const images = Array.from(document.querySelectorAll('img')).map(img => ({
      src: img.src || img.currentSrc,
      alt: img.alt,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      className: img.className
    }));

    const svgs = Array.from(document.querySelectorAll('svg')).map(svg => ({
      outerHTML: svg.outerHTML,
      className: svg.className?.baseVal || svg.className
    }));

    const inputs = Array.from(document.querySelectorAll('input, button, a')).map(el => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type'),
      name: el.getAttribute('name'),
      placeholder: el.getAttribute('placeholder'),
      value: el.getAttribute('value') || el.textContent.trim(),
      href: el.getAttribute('href'),
      ariaLabel: el.getAttribute('aria-label'),
      id: el.id,
      className: el.className?.toString(),
      computedStyles: {
        fontSize: getComputedStyle(el).fontSize,
        fontWeight: getComputedStyle(el).fontWeight,
        color: getComputedStyle(el).color,
        backgroundColor: getComputedStyle(el).backgroundColor,
        borderRadius: getComputedStyle(el).borderRadius,
        padding: getComputedStyle(el).padding,
        height: getComputedStyle(el).height,
        width: getComputedStyle(el).width,
        border: getComputedStyle(el).border,
        boxShadow: getComputedStyle(el).boxShadow
      }
    }));

    const fonts = Array.from(new Set(Array.from(document.querySelectorAll('*')).slice(0, 300).map(el => getComputedStyle(el).fontFamily)));
    const bodyBg = getComputedStyle(document.body).backgroundColor;

    return {
      title: document.title,
      bodyBg,
      fonts,
      images,
      svgs,
      inputs,
      domTree: extractElement(document.querySelector('#content') || document.querySelector('.content') || document.body)
    };
  });

  fs.writeFileSync(path.join(RESEARCH_DIR, 'raw_extraction.json'), JSON.stringify(extraction, null, 2), 'utf8');
  console.log('Extraction complete! Saved to docs/research/facebook-com/root/raw_extraction.json');

  await browser.close();
}

run().catch(err => {
  console.error('Error during inspection:', err);
  process.exit(1);
});
