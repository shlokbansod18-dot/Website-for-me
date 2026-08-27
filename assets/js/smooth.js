/* ============================================================
   VELORA — smooth scroll
   A small inertial scroller. It drives the *real* scroll position
   (window.scrollTo) rather than transforming a wrapper, so
   position:sticky, anchors and accessibility all keep working.
   Auto-disables on touch devices and for reduced-motion users.
   ============================================================ */

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export class Smooth {
  constructor({ lerp = 0.085, multiplier = 1 } = {}) {
    this.lerp = lerp;
    this.multiplier = multiplier;
    this.target = window.scrollY;
    this.current = window.scrollY;
    this.max = 0;
    this.enabled = false;
    this.velocity = 0;
    this._subs = new Set();
    this._raf = this._raf.bind(this);
    this._onWheel = this._onWheel.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onScroll = this._onScroll.bind(this);
  }

  get shouldRun() {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return !coarse && !reduced;
  }

  start() {
    this._onResize();
    window.addEventListener('resize', this._onResize, { passive: true });
    window.addEventListener('scroll', this._onScroll, { passive: true });

    if (this.shouldRun) {
      this.enabled = true;
      document.documentElement.classList.add('has-smooth');
      window.addEventListener('wheel', this._onWheel, { passive: false });
    }
    requestAnimationFrame(this._raf);
    return this;
  }

  /** Subscribe to per-frame scroll updates: fn({ y, velocity, progress }) */
  onFrame(fn) { this._subs.add(fn); return () => this._subs.delete(fn); }

  scrollTo(y, { immediate = false } = {}) {
    this.target = clamp(y, 0, this.max);
    if (immediate || !this.enabled) {
      this.current = this.target;
      window.scrollTo(0, this.target);
    }
  }

  _onResize() {
    this.max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    this.target = clamp(this.target, 0, this.max);
  }

  _onScroll() {
    // Re-sync when scroll came from anywhere but our own rAF write
    // (scrollbar drag, keyboard, hash jump, browser restore).
    if (!this.enabled || Math.abs(window.scrollY - this.current) > 2) {
      this.current = this.target = window.scrollY;
    }
  }

  _onWheel(e) {
    if (e.ctrlKey) return;                       // pinch-zoom
    if (e.target.closest?.('[data-native-scroll]')) return;
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 22 : e.deltaMode === 2 ? window.innerHeight : 1;
    this.target = clamp(this.target + e.deltaY * unit * this.multiplier, 0, this.max);
  }

  _raf() {
    if (this.enabled) {
      const prev = this.current;
      this.current += (this.target - this.current) * this.lerp;
      if (Math.abs(this.target - this.current) < 0.08) this.current = this.target;
      this.velocity = this.current - prev;
      if (Math.round(this.current) !== Math.round(prev)) {
        window.scrollTo(0, this.current);
      }
    } else {
      this.velocity = window.scrollY - this.current;
      this.current = window.scrollY;
    }

    const payload = {
      y: this.current,
      velocity: this.velocity,
      progress: this.max ? this.current / this.max : 0
    };
    this._subs.forEach((fn) => fn(payload));
    requestAnimationFrame(this._raf);
  }
}
