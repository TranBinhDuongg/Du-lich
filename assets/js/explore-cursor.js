(() => {
  const home = document.getElementById('home-experience');
  if (!home || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const cursor = document.createElement('div');
  cursor.className = 'explore-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  const ring = document.createElement('span');
  ring.className = 'explore-cursor-ring';
  const label = document.createElement('span');
  label.className = 'explore-cursor-label';
  label.textContent = 'GIỮ LẠI ĐỂ ĐI DU LỊCH';
  cursor.append(ring, label);
  document.body.append(cursor);
  let frame = 0, x = 0, y = 0;
  function hide() { cursor.classList.remove('visible', 'holding'); }
  document.addEventListener('pointermove', event => {
    const menu = document.getElementById('journey-menu');
    const allowed = event.pointerType === 'mouse' && home.contains(event.target) &&
      !event.target.closest('button, a, input, select, textarea, dialog') &&
      (!menu || menu.hidden) && !document.querySelector('dialog[open]');
    cursor.classList.toggle('visible', allowed);
    x = Math.min(event.clientX, innerWidth - 2);
    y = event.clientY;
    cursor.classList.toggle('label-left', x > innerWidth - 280);
    if (!frame) frame = requestAnimationFrame(() => {
      cursor.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
      frame = 0;
    });
  }, {passive: true});
  document.addEventListener('pointerdown', event => {
    if (event.button === 0 && cursor.classList.contains('visible')) cursor.classList.add('holding');
  }, {passive: true});
  document.addEventListener('pointerup', () => cursor.classList.remove('holding'), {passive: true});
  document.addEventListener('pointercancel', hide);
  document.documentElement.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  window.addEventListener('scroll', hide, {passive: true});
  document.addEventListener('visibilitychange', hide);
})();
