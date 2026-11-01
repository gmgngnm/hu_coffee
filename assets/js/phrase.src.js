import { loadDefaultJapaneseParser } from 'budoux'  // npm i budoux@0.9.3;
const parser = loadDefaultJapaneseParser();
// ホームの挨拶は HTML 側で文節ごとに区切ってあるので対象外
const SEL = [
  '.page-title', '.lead', '.sec-lead', '.sec-head h2',
  '.prose p', '.prose li', '.prose h2', '.prose h3', '.prose td', '.post__title',
  '.entry__title', '.entry__excerpt',
  '.product__name', '.product__desc', '.bean__comment', '.bean__notes',
  '.note-box h2', '.note-box p', '.timeline span', '.datasheet dd',
  '.form__notice', '.field > span', '.check span', '.ig-feed__cap',
  '.site-foot__sub', '.site-foot__copy', '.todo-note',
  '.event__title', '.event__note',
].join(',');
const run = () => document.querySelectorAll(SEL).forEach((el) => {
  if (el.dataset.phrased) return;
  el.dataset.phrased = '1';
  parser.applyToElement(el);
});
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
