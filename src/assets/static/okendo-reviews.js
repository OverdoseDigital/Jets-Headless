/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
window.okeReviewsWidgetOnInit = function (e) {
  typeof okeWidgetControlInit == 'function' && okeWidgetControlInit(),
    (window.refreshOkendo = function () {
      e.initCoreWidgets();
    }),
    setupAggregate();
  const t = document.querySelector('.js-okeReviews-reviews-main');
  if (t) {
    const i = function (r) {
      for (const o of r) o.addedNodes.forEach((c) => setupIndividualReviews(c));
    };
    new MutationObserver(i).observe(t, {
      childList: !0,
    }),
      document.querySelectorAll('.okeReviews-reviews-review').forEach((r) => setupIndividualReviews(r));
  }
};

function setupAggregate() {
  const e = document.querySelector('.okeReviews-reviews-controls-sort'),
    t = document.querySelector('.js-okeReviews-writeReview');
  e && t && e.insertAdjacentElement('afterend', t);
}

function setupIndividualReviews(e) {
  formatDateForElement();
  const t = e.querySelector('.okeReviews-review-reviewer-profile-details'),
    i = e.querySelector('.okeReviews-review-date');
  t && i && t.insertAdjacentElement('beforeend', i);
  const n = e.querySelector('.okeReviews-review-main-heading'),
    s = e.querySelector('.js-okeReviews-reviewMeta');
  n && s && n.insertAdjacentElement('afterend', s);
  const r = e.querySelector('.okeReviews-review-arguments'),
    o = e.querySelector('.okeReviews-review-reviewer-attributes'),
    c = e.querySelector('.okeReviews-review-side-inner');
  r && o ? r.insertAdjacentElement('afterbegin', o) : c && o && c.insertAdjacentElement('beforeend', o);
}
const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function formatDateForElement() {
  const e = document.querySelectorAll('[data-oke-reviews-date]');
  for (const i of e) {
    const n = i.getAttribute('data-oke-reviews-date'),
      s = new Date(n);
    var t = `${dateFormat.format(s)}`.split('/');
    i.innerText = t[1] + ' / ' + t[0] + ' / ' + t[2];
  }
}
