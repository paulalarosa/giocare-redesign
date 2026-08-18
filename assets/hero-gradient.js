export function mount(stage) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
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
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.02;a*=.5;}return v;}',
    // as sete paradas do protocolo ABCDEFS
    'vec3 spectrum(float t){',
    ' vec3 A=vec3(.588,.196,.353),B=vec3(.698,.243,.333),C=vec3(.784,.278,.310);',
    ' vec3 D=vec3(.863,.314,.314),E=vec3(.878,.341,.290),F=vec3(.890,.369,.263),S=vec3(.902,.392,.235);',
    ' t=clamp(t,0.,1.)*6.;',
    ' if(t<1.)return mix(A,B,t);',
    ' if(t<2.)return mix(B,C,t-1.);',
    ' if(t<3.)return mix(C,D,t-2.);',
    ' if(t<4.)return mix(D,E,t-3.);',
    ' if(t<5.)return mix(E,F,t-4.);',
    ' return mix(F,S,t-5.);}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/uRes.xy;',
    ' vec2 q=vec2(uv.x*(uRes.x/uRes.y),uv.y);',
    ' float t=uT*.018+uP*.35;',
    ' float f=fbm(q*1.5+vec2(t,t*.55));',
    ' f=fbm(q*1.8+vec2(f*1.15-t*.4,f*.75+t*.25));',
    ' vec3 navy=vec3(.071,.145,.208);',
    ' vec3 deep=vec3(.106,.192,.286);',
    ' vec3 col=mix(navy,deep,smoothstep(.22,.85,f));',
    ' float glow=smoothstep(.5,.97,f);',
    ' col=mix(col,spectrum(uv.x*.55+f*.6),glow*.5);',
    ' float corner=smoothstep(.15,1.15,distance(uv,vec2(.82,.86)));',
    ' col=mix(col+spectrum(.75)*.09,col,corner);',
    ' float vig=smoothstep(1.3,.25,distance(uv,vec2(.35,.5)));',
    ' col*=mix(.84,1.,vig);',
    ' col+=(hash(gl_FragCoord.xy+uT)-.5)*.015;',
    ' gl_FragColor=vec4(col,1.);}',
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

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'uRes');
  const uT = gl.getUniformLocation(prog, 'uT');
  const uP = gl.getUniformLocation(prog, 'uP');

  let alive = true, visible = true, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const state = { progress: 0 };

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
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uT, seconds);
    gl.uniform1f(uP, state.progress);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  stage.appendChild(canvas);
  stage.classList.add('gl-on');
  draw(0);

  let slow = 0;
  function tick(time, delta) {
    if (!alive || !visible) return;
    if (delta > 34) { if (++slow > 90 && dpr > 1) { dpr = 1; slow = 0; } } else if (slow) slow--;
    draw(time);
  }

  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(stage);
  }
  window.addEventListener('resize', () => draw(performance.now() / 1000), { passive: true });

  return { tick, state, stop() { alive = false; canvas.remove(); stage.classList.remove('gl-on'); } };
}
