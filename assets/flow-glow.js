export function mount(host) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'flow-gl';
  const gl = canvas.getContext('webgl', {
    antialias: false, alpha: true, depth: false, stencil: false, powerPreference: 'low-power',
  });
  if (!gl) return null;

  const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

  const FRAG = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uT;uniform float uP;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.03;a*=.5;}return v;}',
    'vec3 spectrum(float t){',
    ' vec3 A=vec3(.588,.196,.353),C=vec3(.784,.278,.310),E=vec3(.878,.341,.290),S=vec3(.902,.392,.235);',
    ' t=clamp(t,0.,1.)*3.;',
    ' if(t<1.)return mix(A,C,t);',
    ' if(t<2.)return mix(C,E,t-1.);',
    ' return mix(E,S,t-2.);}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/uRes.xy;',
    ' float y=1.-uv.y;',
    ' float aspect=uRes.x/uRes.y;',
    ' float wander=(fbm(vec2(y*2.4,uT*.16))-.5)*.09;',
    ' float dx=(uv.x-.5-wander)*aspect;',
    ' float wisp=fbm(vec2(dx*3.2+uT*.12,y*3.4-uT*.34));',
    ' float flick=.62+.55*wisp;',
    ' float ph=.12+uP*.76;',
    ' float lit=smoothstep(ph+.11,ph-.30,y);',
    ' float beam=exp(-dx*dx*380.)*.5*lit*flick;',
    ' float aura=exp(-dx*dx*70.)*.16*lit*(.5+.7*wisp);',
    ' float hx=dx+(noise(vec2(uT*.5,3.7))-.5)*.05;',
    ' float hy=(y-ph)*(1.25+.2*sin(uT*.8));',
    ' float dh=length(vec2(hx,hy));',
    ' float pulse=.82+.18*sin(uT*1.7+wisp*4.);',
    ' float head=exp(-dh*dh*30.)*.95*pulse;',
    ' float edge=smoothstep(0.,.17,y)*smoothstep(1.,.83,y)',
    '   *smoothstep(0.,.09,uv.x)*smoothstep(1.,.91,uv.x);',
    ' float glow=(beam+aura+head)*edge;',
    ' vec3 col=spectrum(y)*glow;',
    ' float a=clamp(glow,0.,1.)*.85;',
    ' gl_FragColor=vec4(col,a);}',
  ].join('\n');

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  }
  const vs = compile(gl.VERTEX_SHADER, VERT), fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uT = gl.getUniformLocation(prog, 'uT');
  const uP = gl.getUniformLocation(prog, 'uP');

  let alive = true, visible = true;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const state = { progress: 0 };
  let pr = 0;

  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); alive = false; });

  function resize() {
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (w && h && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
    }
  }
  function draw(seconds) {
    resize();
    if (!canvas.width) return;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uT, seconds);
    gl.uniform1f(uP, pr);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  host.appendChild(canvas);
  draw(0);

  function tick(time) {
    if (!alive || !visible) return;
    pr += (state.progress - pr) * .07;
    draw(time);
  }

  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(host);
  }

  return { tick, state, stop() { alive = false; canvas.remove(); } };
}
