/* ============================================================
   VELORA — WebGL scenes (three.js, vendored locally)

   1. createSilk()  — the hero object: a shader-displaced cloth
                      sheet with sheen + fresnel iridescence.
   2. createOrb()   — the materials section: a noise-morphed
                      sphere lit like molten fabric.

   Both scenes: capped DPR, paused when off-screen, cleaned up
   on destroy, and skipped entirely without WebGL or with
   prefers-reduced-motion (a CSS gradient shows instead).
   ============================================================ */

import * as THREE from '../vendor/three.module.min.js';

/* ---------- shared GLSL ---------- */
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 mod289(vec4 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
vec4 permute(vec4 x){ return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float fbm(vec3 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * snoise(p); p *= 2.03; a *= 0.5; }
  return v;
}`;

/* ---------- small renderer harness ---------- */
export function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

function harness(canvas, { alpha = true, dprCap = 1.75 } = {}) {
  const renderer = new THREE.WebGLRenderer({
    canvas, alpha, antialias: true, powerPreference: 'high-performance'
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

  const resize = () => {
    const r = canvas.parentElement.getBoundingClientRect();
    const w = Math.max(1, r.width), h = Math.max(1, r.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    return { w, h };
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);

  let visible = true;
  const io = new IntersectionObserver(
    ([e]) => { visible = e.isIntersecting; },
    { rootMargin: '120px' }
  );
  io.observe(canvas.parentElement);

  return {
    renderer, scene, camera, resize,
    get visible() { return visible; },
    dispose() { ro.disconnect(); io.disconnect(); renderer.dispose(); }
  };
}

const rgb = (hex) => new THREE.Color(hex);

/* ============================================================
   1. SILK — the hero object
   ============================================================ */
export function createSilk(canvas, opts = {}) {
  const {
    colorA = '#E1542B',   // ember — crests
    colorB = '#231A15',   // deep shadow in the folds
    colorC = '#F3EFE8',   // bone — sheen / rim
    colorD = '#7C5A47'    // clay — mid tones
  } = opts;

  const h = harness(canvas);
  const { renderer, scene, camera } = h;

  camera.position.set(0, 0.35, 7.4);
  camera.lookAt(0, -0.30, 0);

  const geometry = new THREE.PlaneGeometry(13, 8.5, 280, 190);

  const uniforms = {
    uTime:     { value: 0 },
    uAmp:      { value: 0.66 },
    uMouse:    { value: new THREE.Vector2(0, 0) },
    uScroll:   { value: 0 },
    uColorA:   { value: rgb(colorA) },
    uColorB:   { value: rgb(colorB) },
    uColorC:   { value: rgb(colorC) },
    uColorD:   { value: rgb(colorD) },
    uOpacity:  { value: 1 }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      uniform float uTime, uAmp, uScroll;
      uniform vec2 uMouse;
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vElev;
      varying vec2 vUv;
      ${NOISE}

      // Height field for the cloth. Sampled 3x so we can rebuild
      // an accurate normal from finite differences.
      float cloth(vec2 p, float t){
        // Anisotropic swell: high frequency across x, almost none across y.
        // That asymmetry is what turns lumpy terrain into long hanging folds.
        float swell = fbm(vec3(p.x * 0.34, p.y * 0.09, t * 0.14)) * 1.0;

        // Ridged creases. 1-abs(sin) gives a crease rather than a wave, and
        // the near-vertical phase keeps the folds running with the drape.
        float f1 = 1.0 - abs(sin(p.x * 1.02 + swell * 2.4 + p.y * 0.15 + t * 0.26));
        float f2 = 1.0 - abs(sin(p.x * 0.57 + swell * 3.0 - p.y * 0.09 - t * 0.19));
        float folds = f1 * 0.72 + f2 * 0.42;

        // fine weave, also stretched along the fold direction
        float weave = fbm(vec3(p.x * 1.85, p.y * 0.45, t * 0.30)) * 0.075;

        // soft elliptical falloff so the sheet floats free of the frame
        float falloff = smoothstep(7.6, 1.4, length(p * vec2(0.52, 0.94)));

        // pointer pushes a bulge through the fabric
        float d = length(p - uMouse * vec2(4.0, 2.4));
        float touch = exp(-d * d * 0.22) * 0.7;

        return (swell * 0.85 + folds + weave + touch) * uAmp * falloff;
      }

      void main(){
        vUv = uv;
        vec2 p = position.xy;
        float t = uTime;
        float e = 0.06;

        float hC = cloth(p, t);
        float hX = cloth(p + vec2(e, 0.0), t);
        float hY = cloth(p + vec2(0.0, e), t);

        vec3 tanX = normalize(vec3(e, 0.0, hX - hC));
        vec3 tanY = normalize(vec3(0.0, e, hY - hC));
        // normalMatrix takes the object-space normal into view space, which
        // is the space vView lives in — mixing the two makes the lighting
        // rotate with the mesh instead of staying put.
        vNormal = normalize(normalMatrix * normalize(cross(tanX, tanY)));
        vElev = hC;

        vec3 pos = vec3(p, hC);
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        vView = -normalize(mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform vec3 uColorA, uColorB, uColorC, uColorD;
      uniform float uTime, uOpacity;
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vElev;
      varying vec2 vUv;

      void main(){
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vView);
        vec3 L = normalize(vec3(-0.45, 0.75, 0.62));

        float lambert = max(dot(N, L), 0.0);
        float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.2);

        // anisotropic-ish sheen: satin catches light along the folds
        vec3 H = normalize(L + V);
        float sheen = pow(max(dot(N, H), 0.0), 34.0);

        // height ramp: shadowed troughs -> clay -> ember crests
        // troughs sit in deep shadow, crests catch the ember —
        // a wide dynamic range is what gives the folds their depth
        // Restraint: the body of the cloth stays near-black clay and the
        // ember is reserved for the top of the elevation range, so the
        // object reads as lit fabric rather than a field of colour.
        float ramp = smoothstep(-0.15, 1.05, vElev);
        vec3 col = mix(uColorB * 0.46, uColorD * 1.05, smoothstep(0.0, 0.72, ramp));
        col = mix(col, uColorA, smoothstep(0.76, 1.0, ramp) * 0.62);

        col *= 0.42 + lambert * 0.88;
        col = mix(col, uColorC, fres * 0.24);
        // satin catches the light along the crease, not across the whole crest
        col += uColorA * sheen * 0.95;
        col += uColorC * pow(sheen, 2.2) * 0.55;

        // radial vignette so the sheet dissolves into the page
        float vign = smoothstep(1.02, 0.34, length(vUv - 0.5) * 1.50);

        // dither to kill banding on the big soft gradients
        float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        col += (grain - 0.5) * 0.018;

        gl_FragColor = vec4(col, vign * uOpacity);
      }`
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.set(-1.06, 0.0, -0.12);
  mesh.position.set(1.15, -1.05, 0);
  scene.add(mesh);

  /* pointer + scroll response */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  let scrollT = 0, scrollC = 0;
  const clock = new THREE.Clock();
  let raf = null;

  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!h.visible) return;

    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;

    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;
    uniforms.uMouse.value.set(pointer.x, pointer.y);

    scrollC += (scrollT - scrollC) * 0.06;
    uniforms.uScroll.value = scrollC;

    // the sheet tilts toward the pointer and settles back on scroll
    mesh.rotation.x = -1.06 + pointer.y * 0.10 + scrollC * 0.38;
    mesh.rotation.z = -0.12 + pointer.x * 0.07;
    mesh.position.y = -1.05 - scrollC * 1.1;
    camera.position.x = pointer.x * 0.2;
    camera.position.y = 0.15 + pointer.y * 0.12;
    camera.lookAt(0, -0.1, 0);

    renderer.render(scene, camera);
  };
  frame();

  return {
    setScroll(v) { scrollT = v; },
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      geometry.dispose(); material.dispose(); h.dispose();
    }
  };
}

/* ============================================================
   2. ORB — the materials section
   ============================================================ */
export function createOrb(canvas, opts = {}) {
  const {
    colorA = '#E1542B',
    colorB = '#140E0A',
    colorC = '#F3EFE8',
    colorD = '#7C5A47'
  } = opts;

  const h = harness(canvas);
  const { renderer, scene, camera } = h;
  camera.position.set(0, 0, 3.75);

  const geometry = new THREE.IcosahedronGeometry(1, 72);
  const uniforms = {
    uTime:   { value: 0 },
    uAmp:    { value: 0.26 },
    uHover:  { value: 0 },
    uColorA: { value: rgb(colorA) },
    uColorB: { value: rgb(colorB) },
    uColorC: { value: rgb(colorC) },
    uColorD: { value: rgb(colorD) }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    vertexShader: /* glsl */ `
      uniform float uTime, uAmp, uHover;
      varying vec3 vNormal, vView;
      varying float vElev;
      ${NOISE}

      float shape(vec3 p, float t){
        // Three clean octaves. The fbm loop's high harmonics were pitting
        // the surface into something closer to coral than cloth.
        float a = snoise(p * 0.72 + vec3(0.0, 0.0, t * 0.20)) * 0.66;
        float b = snoise(p * 1.30 + vec3(t * 0.26)) * 0.27;
        float c = snoise(p * 2.30 + vec3(0.0, t * 0.30, 0.0)) * 0.085;
        return (a + b + c) * (uAmp + uHover * 0.05);
      }

      void main(){
        float t = uTime;
        float e = 0.045;
        vec3 n = normalize(position);
        float d = shape(n, t);

        // Tangent basis that never degenerates: pick the reference axis the
        // normal is least aligned with, otherwise the poles tear.
        vec3 ref = abs(n.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
        vec3 tA = normalize(cross(n, ref));
        vec3 tB = normalize(cross(n, tA));

        vec3 nA = normalize(n + tA * e);
        vec3 nB = normalize(n + tB * e);

        vec3 pC = n  * (1.0 + d);
        vec3 pA = nA * (1.0 + shape(nA, t));
        vec3 pB = nB * (1.0 + shape(nB, t));

        vec3 objNormal = normalize(cross(pB - pC, pA - pC));
        if (dot(objNormal, n) < 0.0) objNormal = -objNormal;   // keep it outward

        vNormal = normalize(normalMatrix * objNormal);
        vElev = d;

        vec4 mv = modelViewMatrix * vec4(pC, 1.0);
        vView = -normalize(mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      precision highp float;
      uniform vec3 uColorA, uColorB, uColorC, uColorD;
      varying vec3 vNormal, vView;
      varying float vElev;

      void main(){
        vec3 N = normalize(vNormal);
        vec3 V = normalize(vView);
        vec3 L = normalize(vec3(-0.6, 0.8, 0.75));

        vec3 L2 = normalize(vec3(0.55, -0.40, 0.35));   // cool fill from below
        float lambert = max(dot(N, L), 0.0);
        float fill = max(dot(N, L2), 0.0) * 0.30;
        float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.2);
        vec3 H = normalize(L + V);
        float spec = pow(max(dot(N, H), 0.0), 60.0);

        float ramp = smoothstep(-0.22, 0.26, vElev);
        vec3 col = mix(uColorB, uColorD * 0.92, ramp);
        col = mix(col, uColorA, smoothstep(0.40, 1.0, ramp) * 0.88);
        col *= 0.34 + lambert * 0.88 + fill;
        // warm rim rather than a chalky white one
        col = mix(col, uColorA, fres * 0.45);
        col += uColorC * spec * 0.26;

        float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
        col += (grain - 0.5) * 0.02;

        gl_FragColor = vec4(col, 1.0);
      }`
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => {
    const r = canvas.parentElement.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  let hoverT = 0;
  canvas.parentElement.addEventListener('pointerenter', () => { hoverT = 1; });
  canvas.parentElement.addEventListener('pointerleave', () => { hoverT = 0; });

  const clock = new THREE.Clock();
  let raf = null;
  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!h.visible) return;
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;
    uniforms.uHover.value += (hoverT - uniforms.uHover.value) * 0.06;

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    mesh.rotation.y = t * 0.16 + pointer.x * 0.4;
    mesh.rotation.x = pointer.y * 0.3;
    renderer.render(scene, camera);
  };
  frame();

  return {
    destroy() {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      geometry.dispose(); material.dispose(); h.dispose();
    }
  };
}
