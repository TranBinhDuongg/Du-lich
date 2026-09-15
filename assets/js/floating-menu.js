(() => {
  const button = document.querySelector('.studio-header .menu-button');
  const header = document.querySelector('.studio-header');
  if (!button || !header) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let current = 0;
  let target = 0;
  let lastTime = 0;
  let floating = false;
  button.classList.add('menu-follows-scroll');

  function measure() {
    const restTop = header.offsetTop + (header.offsetHeight - button.offsetHeight) / 2;
    target = Math.max(-8, restTop - window.scrollY - 20);
    const next = window.scrollY > (floating ? 12 : 28);
    if (next !== floating) {
      floating = next;
      button.classList.toggle('is-floating', floating);
    }
  }

  function tick(time) {
    frame = 0;
    const elapsed = lastTime ? Math.min(time - lastTime, 50) : 16;
    lastTime = time;
    const blend = reducedMotion.matches ? 1 : 1 - Math.exp(-elapsed / 95);
    current += (target - current) * blend;
    if (Math.abs(target - current) < 0.05) current = target;
    button.style.setProperty('--menu-scroll-offset', current.toFixed(2) + 'px');
    if (current !== target) frame = requestAnimationFrame(tick);
    else lastTime = 0;
  }

  function schedule() {
    measure();
    if (!frame) frame = requestAnimationFrame(tick);
  }
  measure();
  current = target;
  button.style.setProperty('--menu-scroll-offset', current + 'px');
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  reducedMotion.addEventListener('change', schedule);
})();

