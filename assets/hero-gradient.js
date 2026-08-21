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
    'uniform vec2 uRes;uniform float uT;uniform float uP;uniform vec2 uM;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
    ' return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.02;a*=.5;}return v;}',
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
    ' float ar=uRes.x/uRes.y;',
    ' vec2 c=vec2(.5+(uM.x-.5)*.06,-.58+(uM.y-.5)*.04);',
    ' vec2 q=vec2((uv.x-c.x)*ar,uv.y-c.y);',
    ' float d=length(q);',
    ' float f=fbm(vec2(atan(q.y,q.x)*2.4+uT*.05,d*2.2-uT*.028));',
    ' float r=.92+f*.09;',
    ' float ring=exp(-pow((d-r)*7.0,2.));',
    ' float inner=smoothstep(r+.06,r-.62,d);',
    ' vec3 navy=vec3(.071,.145,.208);',
    ' vec3 deep=vec3(.05,.104,.157);',
    ' vec3 col=mix(navy,deep,smoothstep(.05,.95,uv.y));',
    ' float fade=1.-uP*.55;',
    ' vec3 warm=spectrum(clamp(uv.x*.8+f*.35,0.,1.));',
    ' col+=warm*ring*.85*fade;',
    ' col+=warm*inner*.16*fade;',
    ' col+=spectrum(.8)*exp(-pow((d-r)*2.2,2.))*.10*fade;',
    ' float vig=smoothstep(1.45,.4,distance(uv,vec2(.5,.42)));',
    ' col*=mix(.86,1.,vig);',
    ' col+=(hash(gl_FragCoord.xy+uT)-.5)*.014;',
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
  const uM = gl.getUniformLocation(prog, 'uM');

  let alive = true, visible = true, dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const state = { progress: 0, mx: .82, my: .86 };
  let cx = state.mx, cy = state.my;

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
    gl.uniform2f(uM, cx, cy);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  stage.appendChild(canvas);
  stage.classList.add('gl-on');
  draw(0);

  let slow = 0;
  function tick(time, delta) {
    if (!alive || !visible) return;
    if (delta > 34) { if (++slow > 90 && dpr > 1) { dpr = 1; slow = 0; } } else if (slow) slow--;
    cx += (state.mx - cx) * .05;
    cy += (state.my - cy) * .05;
    draw(time);
  }

  if (typeof IntersectionObserver === 'function') {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(stage);
  }
  window.addEventListener('resize', () => draw(performance.now() / 1000), { passive: true });

  return { tick, state, stop() { alive = false; canvas.remove(); stage.classList.remove('gl-on'); } };
}
