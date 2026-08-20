import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const ABC = [0x96325A, 0xB23E55, 0xC8474F, 0xDC5050, 0xE0574A, 0xE35E43, 0xE6643C];
const N = 9000;
const ROWS = 13;

const VERT = `
attribute vec3 p0; attribute vec3 p1; attribute vec3 p2;
attribute vec3 c0; attribute vec3 c1; attribute vec3 c2;
attribute float seed; attribute float pSize;
uniform float uP; uniform float uT; uniform float uScale;
varying vec3 vC; varying float vA;
void main() {
  float t1 = smoothstep(0.0, 1.0, uP);
  float t2 = smoothstep(1.0, 2.0, uP);
  float w0 = 1.0 - t1;
  float w1 = t1 * (1.0 - t2);
  float w2 = t2;
  vec3 p = mix(mix(p0, p1, t1), p2, t2);
  vC = mix(mix(c0, c1, t1), c2, t2);
  p.y += w0 * sin(uT * (2.6 + fract(seed * 13.7) * 4.0) + seed * 43.0) * (0.05 + 0.34 * fract(seed * 7.3));
  p.x += w1 * sin(uT * 0.7 + seed * 21.0) * 0.05;
  p.y += w1 * sin(uT * 0.4 + seed * 31.0) * 0.09;
  p.x += w2 * sin(uT * 0.5 + seed * 57.0) * 0.006;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = pSize * uScale * (1.0 + 0.35 * w0) * (0.024 / -mv.z);
  vA = 0.5 + 0.5 * fract(seed * 5.1);
  gl_Position = projectionMatrix * mv;
}`;

const FRAG = `
precision mediump float;
varying vec3 vC; varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.12, d) * vA;
  if (a < 0.012) discard;
  gl_FragColor = vec4(vC * a * 1.5, a);
}`;

function buildGeometry() {
  const g = new THREE.BufferGeometry();
  const p0 = new Float32Array(N * 3), p1 = new Float32Array(N * 3), p2 = new Float32Array(N * 3);
  const c0 = new Float32Array(N * 3), c1 = new Float32Array(N * 3), c2 = new Float32Array(N * 3);
  const seed = new Float32Array(N), pSize = new Float32Array(N);

  const warm = new THREE.Color(0xD2464C), pale = new THREE.Color(0xE8DCD2);
  const ink = new THREE.Color(0x9FB3C8);
  const abc = ABC.map((h) => new THREE.Color(h));
  const tmp = new THREE.Color();

  const env = (x) => 0.16 +
    0.92 * Math.abs(Math.sin(x * 0.72 + 1.3) + 0.55 * Math.sin(x * 1.9 + 0.4) + 0.3 * Math.sin(x * 3.7)) / 1.85;

  const rowLen = [], rowY = [];
  let y = 0;
  for (let r = 0; r < ROWS; r++) {
    rowY.push(y);
    y -= 0.34 + ((r === 3 || r === 7 || r === 10) ? 0.2 : 0);
    const t = Math.sin(r * 12.9898) * 43758.5453;
    rowLen.push(r === ROWS - 1 ? 0.38 : 0.6 + 0.4 * (t - Math.floor(t)));
  }
  const midY = (rowY[0] + rowY[ROWS - 1]) / 2;

  for (let i = 0; i < N; i++) {
    const j = i * 3;
    const rA = Math.random(), rB = Math.random(), rC = Math.random();

    const wx = (rA - 0.5) * 8.6;
    const e = env(wx);
    p0[j] = wx;
    p0[j + 1] = (rB * 2 - 1) * e * 0.92;
    p0[j + 2] = (rC - 0.5) * 0.8;
    tmp.lerpColors(warm, pale, rC * 0.85);
    c0[j] = tmp.r; c0[j + 1] = tmp.g; c0[j + 2] = tmp.b;

    const L = i % 7;
    const scatter = Math.random() < 0.85 ? 1 : 3.4;
    p1[j] = (L - 3) * 1.06 + (rA - 0.5) * 0.22 * scatter;
    p1[j + 1] = (rB * 2 - 1) * 1.9;
    p1[j + 2] = (rC - 0.5) * 0.5;
    tmp.copy(abc[L]).lerp(pale, rC * 0.3);
    c1[j] = tmp.r; c1[j + 1] = tmp.g; c1[j + 2] = tmp.b;

    const r = i % ROWS;
    const frac = rA;
    p2[j] = -2.7 + frac * 5.4 * rowLen[r];
    p2[j + 1] = rowY[r] - midY + (rB - 0.5) * 0.07;
    p2[j + 2] = (rC - 0.5) * 0.06;
    if (frac < 0.055) tmp.copy(abc[r % 7]);
    else tmp.copy(ink).multiplyScalar(0.78 + rC * 0.35);
    c2[j] = tmp.r; c2[j + 1] = tmp.g; c2[j + 2] = tmp.b;

    seed[i] = Math.random();
    pSize[i] = 0.55 + Math.random();
  }

  g.setAttribute('position', new THREE.BufferAttribute(p0, 3));
  g.setAttribute('p0', new THREE.BufferAttribute(p0, 3));
  g.setAttribute('p1', new THREE.BufferAttribute(p1, 3));
  g.setAttribute('p2', new THREE.BufferAttribute(p2, 3));
  g.setAttribute('c0', new THREE.BufferAttribute(c0, 3));
  g.setAttribute('c1', new THREE.BufferAttribute(c1, 3));
  g.setAttribute('c2', new THREE.BufferAttribute(c2, 3));
  g.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  g.setAttribute('pSize', new THREE.BufferAttribute(pSize, 1));
  return g;
}

export function mount(stage) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: 'low-power' });
  } catch (e) { return null; }

  const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = 'ia-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  stage.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
  camera.position.z = 7.6;

  const material = new THREE.ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms: { uP: { value: 0 }, uT: { value: 0 }, uScale: { value: 1 } },
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(buildGeometry(), material);
  points.frustumCulled = false;
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  const state = { progress: 0, mx: 0.5, my: 0.5 };
  let ry = 0, rx = 0;

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    material.uniforms.uScale.value = renderer.domElement.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  }
  resize();
  window.addEventListener('resize', resize);

  function tick(time) {
    material.uniforms.uT.value = time;
    material.uniforms.uP.value = state.progress;
    camera.position.z = 7.6 - state.progress * 0.55;
    ry += ((state.mx - 0.5) * 0.22 - ry) * 0.05;
    rx += ((state.my - 0.5) * -0.14 - rx) * 0.05;
    group.rotation.y = ry;
    group.rotation.x = rx;
    renderer.render(scene, camera);
  }

  return { state, tick, resize, canvas: renderer.domElement };
}
