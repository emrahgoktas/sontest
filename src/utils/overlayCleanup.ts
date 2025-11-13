export function forceClearOverlays() {
  try {
    // 1️⃣ Sabit ve siyah/yarı saydam arka planlı overlay’leri temizle
    document.querySelectorAll('div').forEach((el) => {
      const s = getComputedStyle(el);
      const bg = (s.backgroundColor || '').replace(/\s+/g, '');
      const isOverlayLike =
        s.position === 'fixed' &&
        /(rgba?\(0,0,0)/i.test(bg) && // ✅ regex ile güvenli kontrol
        parseFloat(s.zIndex || '0') >= 1000;

      if (isOverlayLike) {
        console.log('%c🧹 Removing overlay:', 'color:orange', el);
        el.remove();
      }
    });

    // 2️⃣ Bilinen overlay türlerini de kaldır
    const knownOverlays = [
      '.overlay',
      '.modal-backdrop',
      '.pdf-overlay',
      '#overlay-root',
      '[data-overlay]',
      '[role="dialog"]'
    ];

    knownOverlays.forEach((sel) => {
      document.querySelectorAll(sel).forEach((n) => {
        console.log('%c🧹 Removing known overlay:', 'color:lime', sel, n);
        n.remove();
      });
    });

    // 3️⃣ Body stillerini sıfırla
    const body = document.body;
    body.style.overflow = 'auto';
    body.style.pointerEvents = 'auto';
    body.style.position = 'static';
  } catch (err) {
    console.warn('forceClearOverlays failed', err);
  }
}
