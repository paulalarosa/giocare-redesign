const emCurso = !!(window.gioRec && window.gioRec.get());
document.body.dataset.consulta = emCurso ? 'viva' : 'vazia';
document.getElementById('semConsulta').hidden = emCurso;

const LIXO='<svg aria-hidden="true" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13"/><path d="M10 11v5M14 11v5"/></svg>';

const TIPOS_EXAME=[
  ['lab','Laboratório','B'],
  ['bio','Bioimpedância','C'],
  ['img','Imagem','B'],
  ['dexa','Densitometria (DEXA)','C'],
  ['outro','Outro','B'],
];

const tabs=[...document.querySelectorAll('.phase-tab')];
const FLOW={
  gravacao:{go:'Analisar anamnese →',next:'anamnese'},
  anamnese:{go:'Concluir anamnese e ir para a conduta →',next:'conduta'},
  conduta:{go:'Ir para o encerramento →',next:'encerramento'},
  encerramento:{go:'Encerrar consulta',next:null},
};
const abGo=document.getElementById('abGo');
let phase='gravacao';
function goPhase(name){
  phase=name;
  pintarGio();
  if(name==='conduta') setTimeout(dispararPreread,450);
  tabs.forEach(t=>t.setAttribute('aria-selected', String(t.dataset.phase===name)));
  document.querySelectorAll('.phase-panel').forEach(p=>p.classList.toggle('on', p.dataset.panel===name));
  abGo.textContent=FLOW[name].go;
  window.scrollTo({top:0,behavior:'smooth'});
}
tabs.forEach(t=>t.onclick=()=>goPhase(t.dataset.phase));
abGo.onclick=()=>{
  if(phase==='anamnese'){
    document.querySelectorAll('[data-panel="anamnese"] textarea').forEach(t=>t.readOnly=true);
  }
  const next=FLOW[phase].next;
  if(next) goPhase(next);
  else if(!validado){
    goPhase('anamnese');
    window.gioToast('A anamnese ainda é rascunho. Valide para encerrar.');
    setTimeout(()=>{
      validateBtn.scrollIntoView({block:'center',behavior:'smooth'});
      validateBtn.classList.remove('flash'); void validateBtn.offsetWidth; validateBtn.classList.add('flash');
    },260);
  }
  else {
    window.gioRec.stop();
    window.gioConsultas.marcar('Paulo R.','done');
    sessionStorage.setItem('gio.toast','Consulta de Paulo R. concluída. Três documentos emitidos e o prontuário assinado.');
    location.href='dashboard.html';
  }
};

const docModal=document.getElementById('docModal');
const DOCT={receita:'Documento I · Receita',exames:'Documento II · Pedido de exame',plano:'Documento III · Plano alimentar'};
document.querySelectorAll('[data-doc]').forEach((b)=>{
  b.onclick=()=>{
    document.querySelectorAll('[data-paper]').forEach((pp)=>{pp.hidden=pp.dataset.paper!==b.dataset.doc;});
    document.getElementById('docTitle').textContent=DOCT[b.dataset.doc];
    docModal.showModal();
  };
});
document.getElementById('docClose').onclick=()=>docModal.close();
document.getElementById('docBaixar').onclick=()=>{
  window.gioBaixar(document.getElementById('docTitle').textContent.split('·').pop().trim());
};
document.querySelectorAll('[data-baixar]').forEach((b)=>{ b.onclick=()=>window.gioBaixar(b.dataset.baixar); });
document.getElementById('editarPlano').onclick=()=>{
  const cx=document.querySelector('[data-panel="encerramento"] .abc-body > div');
  if(!cx) return;
  const ta=document.createElement('textarea');
  ta.className='editor-livre';
  ta.value=cx.innerText;
  cx.replaceWith(ta); ta.focus();
  window.gioToast('Edite o texto. Ele vai assim para o paciente.');
};
docModal.addEventListener('click',(e)=>{ if(e.target===docModal) docModal.close(); });

const abTm=document.getElementById('abTm');
const abSt=document.getElementById('abSt');
const actbar=document.getElementById('actbar');
const abPause=document.getElementById('abPause');
function paintBar(){
  const st=window.gioRec.get();
  if(!st){ actbar.hidden=true; return; }
  abTm.textContent=window.gioRec.elapsed();
  actbar.dataset.state=st.paused?'paused':'rec';
  abSt.textContent=st.paused?'Pausada':(st.modo==='video'?'Gravando · videochamada':'Gravando');
  abPause.querySelector('span').textContent=st.paused?'Retomar':'Pausar';
}
abPause.onclick=()=>{ window.gioRec.pause(); paintBar(); };
setInterval(paintBar,1000);
paintBar();

document.querySelectorAll('[data-food]').forEach((b)=>{
  b.onclick=()=>{
    document.querySelectorAll('[data-food]').forEach((o)=>o.setAttribute('aria-selected',String(o===b)));
    document.querySelectorAll('[data-food-panel]').forEach((p)=>{p.hidden=p.dataset.foodPanel!==b.dataset.food;});
  };
});

const FIXES={
  jantar:{
    user:'Monta o jantar do plano: proteína leve até uma hora depois do treino.',
    ai:'Adicionei Jantar às 21:30: omelete de 3 ovos com legumes e batata-doce 150 g. P 32 g · C 38 g · G 14 g · 410 kcal, pela referência da Nutrology Academy. Total do dia foi a 1.210 kcal.',
    tool:'adicionarRefeicao · plano',
    feito:'Montei o jantar das 21:30, uma hora depois do treino: omelete de 3 ovos com legumes e batata-doce.'},
  energia:{
    user:'Ajusta o plano para chegar perto do alvo de 2.480 kcal.',
    ai:'Reforcei as três refeições e acrescentei um lanche da tarde. O dia foi de 1.210 para 2.455 kcal, com 138 g de proteína. Referência da Nutrology Academy.',
    tool:'adicionarRefeicao + editarItemRefeicao · plano',
    feito:'Levei o dia de 1.210 para 2.455 kcal, a 25 do alvo. O alvo segue a regra da Academy: gasto de 2.780 menos déficit de 300.'},
  foco:{
    user:'Registra o foco da consulta: jantar cedo e proteína distribuída até o retorno.',
    ai:'F preenchido: "Jantar até 1h após o treino e proteína distribuída em 4 refeições. Reavaliar no retorno de setembro."',
    tool:'atualizarBlocoTexto · f_focoConsulta',
    feito:'Registrei a meta do F: jantar cedo e proteína distribuída até o retorno.'},
};

const guardado={};

function efeito(k,ligar){
  if(k==='energia'){
    const al=document.getElementById('alvoEnergia');
    if(!al) return;
    al.classList.toggle('abaixo',!ligar);
    document.getElementById('alvoGap').textContent = ligar
      ? 'plano em 2.455 kcal · dentro do alvo'
      : 'plano em 1.210 kcal · 1.270 abaixo do alvo';
  }
  if(k==='foco'){
    const ft=document.getElementById('focoTo');
    const f=abc.find(a=>a.k==='F');
    if(ligar){
      if(ft){ guardado.focoTo=ft.textContent; ft.textContent='Jantar até uma hora depois do treino e proteína distribuída em quatro refeições. Reavaliar no retorno de setembro.'; }
      if(f){ guardado.f={de:f.de,chegou:f.chegou,falta:f.falta};
        f.de='fala'; f.chegou=f.chegou+' Meta definida: jantar cedo e proteína distribuída até o retorno.'; f.falta=null; }
    } else {
      if(ft&&guardado.focoTo!==undefined) ft.textContent=guardado.focoTo;
      if(f&&guardado.f){ f.de=guardado.f.de; f.chegou=guardado.f.chegou; f.falta=guardado.f.falta; }
    }
    drawLive(); drawRail(); drawPane(); drawPend();
  }
}

function contarPreread(){
  const feitos=document.querySelectorAll('.preread .f.done').length;
  const total=document.querySelectorAll('.preread .f').length;
  if(phase==='conduta'){
    gioAgora(feitos===total
      ? 'conferi a ficha inteira · '+total+' pontos, todos reversíveis'
      : feitos
        ? 'apliquei '+feitos+' de '+total+' pontos'
        : 'li a ficha · nenhum ajuste aplicado');
  }
  contarGio();
}

function aplicar(row,narrar){
  const k=row.dataset.fix, fx=FIXES[k];
  if(row.classList.contains('done')) return;
  row.classList.add('done');
  row.querySelector('.tx').textContent=fx.feito;
  row.querySelector('[data-desfazer]').hidden=false;
  const ver=row.querySelector('.ver');
  if(ver){ ver.hidden=false; ver.href=row.dataset.alvo; }
  efeito(k,true);
  if(narrar){
    const msgs=document.getElementById('chatMsgs');
    msgs.insertAdjacentHTML('beforeend','<div class="m ai">'+fx.ai+'<span class="tool"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>'+fx.tool+'</span></div>');
    msgs.scrollTop=msgs.scrollHeight;
  }
  contarPreread();
}

function desfazer(row){
  const k=row.dataset.fix, fx=FIXES[k];
  row.classList.remove('done');
  row.querySelector('.tx').textContent=row.dataset.original;
  row.querySelector('[data-desfazer]').hidden=true;
  const verR=row.querySelector('.ver');
  if(verR) verR.hidden=true;
  efeito(k,false);
  const msgs=document.getElementById('chatMsgs');
  msgs.insertAdjacentHTML('beforeend','<div class="m ai">Desfiz esse ajuste. A ficha voltou ao que estava antes.<span class="tool"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/></svg>desfazer · '+fx.tool.split(' · ')[1]+'</span></div>');
  msgs.scrollTop=msgs.scrollHeight;
  window.gioToast('Ajuste desfeito. Você decide o que entra na ficha.');
  contarPreread();
}

const linhasFix=[...document.querySelectorAll('.preread .f')];
linhasFix.forEach((row)=>{
  row.dataset.original=row.querySelector('.tx').textContent;
  row.querySelector('[data-desfazer]').onclick=()=>desfazer(row);
  const ver=row.querySelector('.ver');
  if(ver) ver.onclick=(e)=>{
    e.preventDefault();
    const alvo=document.querySelector(row.dataset.alvo);
    if(!alvo) return;
    const suave=matchMedia('(prefers-reduced-motion: no-preference)').matches;
    alvo.scrollIntoView({behavior:suave?'smooth':'auto',block:'center'});
    alvo.classList.remove('flash');
    void alvo.offsetWidth;
    alvo.classList.add('flash');
  };
});
let prereadDisparado=false;
function dispararPreread(){
  if(prereadDisparado) return;
  prereadDisparado=true;
  linhasFix.forEach((row,i)=>setTimeout(()=>aplicar(row,true),600+i*900));
}

const aiCard=document.getElementById('aiCard');
document.querySelectorAll('[data-ai-act]').forEach((b)=>{
  b.onclick=()=>{
    if(b.dataset.aiAct==='manual'){aiCard.dataset.ai='ready';return;}
    aiCard.dataset.ai='processing';
    setTimeout(()=>{aiCard.dataset.ai='ready';},2200);
  };
});

const COMPOSICAO = '<div class="mg-cap"><span class="k">CID · tipo corporal InBody</span><b data-cid-nome></b></div>'
  + '<div class="mg">'
  + '<span class="faixa" aria-hidden="true"><span>abaixo</span><span>normal</span><span>acima</span></span>'
  + '<span class="grade" aria-hidden="true"></span>'
  + '<span class="rot">Peso</span><span class="val">84,2<small> kg</small></span><span class="tr" data-esc="peso" data-pct="142"><i></i></span><span class="esc"></span>'
  + '<span class="rot">Massa muscular esquelética</span><span class="val">36,4<small> kg</small></span><span class="tr" data-esc="musculo" data-pct="108"><i></i></span><span class="esc"></span>'
  + '<span class="rot">Massa de gordura</span><span class="val">15,5<small> kg</small></span><span class="tr" data-esc="gordura" data-pct="100"><i></i></span><span class="esc"></span>'
  + '<span class="forma" aria-hidden="true"></span>'
  + '<span class="letra" aria-hidden="true"></span>'
  + '</div>'
  + '<div class="bia">'
  + '<div class="grp">resumo</div>'
  + '<div class="row3"><span>Peso</span><span class="n">84,2 kg</span><span class="fx">50,4–68,2</span></div>'
  + '<div class="row3"><span>IMC</span><span class="n">25,1 kg/m²</span><span class="fx">18,5–25,0</span></div>'
  + '<div class="row3 limitrofe"><span>Percentual de gordura</span><span class="n">18,4 %</span><span class="fx">limítrofe · 10–18</span></div>'
  + '<div class="row3"><span>Massa de gordura</span><span class="n">15,5 kg</span><span class="fx">11,9–19,0</span></div>'
  + '<div class="grp">massa</div>'
  + '<div class="row3"><span>Massa livre de gordura</span><span class="n">62,0 kg</span><span class="fx">41,1–50,2</span></div>'
  + '<div class="row3"><span>Massa muscular esquelética</span><span class="n">36,4 kg</span><span class="fx">30,2–36,9</span></div>'
  + '<div class="row3"><span>Água corporal total</span><span class="n">45,1 L</span><span class="fx">30,1–36,8</span></div>'
  + '<div class="row3"><span>Proteína</span><span class="n">12,1 kg</span><span class="fx">8,1–9,9</span></div>'
  + '<div class="row3"><span>Minerais</span><span class="n">4,38 kg</span><span class="fx">2,79–3,41</span></div>'
  + '<div class="row3 vazio"><span>Índice de massa muscular (SMI)</span><span class="n">não veio no laudo</span><span class="fx">sem valor</span></div>'
  + '<div class="grp">energia e proporção</div>'
  + '<div class="row3"><span>Taxa metabólica basal</span><span class="n">1.812 kcal</span><span class="fx">1.297–1.502</span></div>'
  + '<div class="row3"><span>Gasto total do dia</span><span class="n">2.780 kcal</span><span class="fx">TMB medida (65%) + digestão + treino</span></div>'
  + '<div class="row3 alto"><span>Relação cintura-quadril</span><span class="n">0,89</span><span class="fx">alto · 0,75–0,85</span></div>'
  + '<div class="row3"><span>Grau de obesidade</span><span class="n">112 %</span><span class="fx">90–110</span></div>'
  + '<div class="grp">segmentar · massa magra</div>'
  + '<div class="seg"><span>Braço esquerdo</span><span class="n">3,42 kg</span><span class="pc">108,4 %</span></div>'
  + '<div class="seg"><span>Braço direito</span><span class="n">3,58 kg</span><span class="pc acima">113,6 %</span></div>'
  + '<div class="seg"><span>Tronco</span><span class="n">28,9 kg</span><span class="pc">106,1 %</span></div>'
  + '<div class="seg"><span>Perna esquerda</span><span class="n">9,74 kg</span><span class="pc">104,2 %</span></div>'
  + '<div class="seg"><span>Perna direita</span><span class="n">9,88 kg</span><span class="pc">105,7 %</span></div>'
  + '<div class="grp">evolução</div>'
  + '<div class="row3"><span>Desde 10/06</span><span class="n">−4,0 kg · −2,1 p.p. de gordura</span><span class="fx">3 meses</span></div>'
  + '<div class="fonte">fonte: bioimpedância InBody 570 · 21/07/2026 · faixas do próprio laudo, como manda o sistema</div>'
  + '</div>';

const abc=[
  {k:"A",nome:"Alimentação",de:"fala",
   chegou:"Café da manhã reforçado mantido desde a última consulta. O jantar sai às 22:15, depois do treino, com macarrão e frango. Refere fome à noite.",
   ev:{q:"Consegui manter o café reforçado, mas o jantar tá saindo tarde por causa do treino.",t:"03:18",b:1}},
  {k:"B",nome:"Biomarcadores",de:"contexto",
   chegou:"Perfil lipídico de 12/07 dentro das metas. A 25-OH-vitamina D não é refeita desde o início da suplementação.",
   ev:{doc:"Perfil lipídico + vitamina D · Laboratório Vita, 12/07"}},
  {k:"C",nome:"Composição corporal",de:"contexto",
   chegou:"84,2 kg, IMC 25,1, gordura 18,4% e massa magra 62 kg. Perdeu 4 kg em três meses, com a massa magra preservada.",
   ev:{doc:"Bioimpedância InBody 570 · 21/07"}, extra:COMPOSICAO},
  {k:"D",nome:"Drogas",de:"falta", chegou:"",
   ask:"Você continua tomando a vitamina D e o magnésio todo dia?",
   falta:"Há duas prescrições ativas desde abril e nenhuma fala sobre adesão nesta consulta."},
  {k:"E",nome:"Exercício",de:"fala",
   chegou:"Corrida cinco vezes por semana, sempre às 6h. Treina para uma maratona em setembro.",
   ev:{q:"Um pouco. Durmo por volta de meia-noite, acordo 6h pra correr.",t:"09:41",b:3}},
  {k:"F",nome:"Foco da consulta",de:"parcial",
   chegou:"Motivo registrado na pré-consulta: retorno de emagrecimento, quer ajustar o plano por causa do treino de maratona.",
   ask:"Se a gente resolvesse uma coisa só até o retorno, qual seria?",
   falta:"O motivo está registrado, mas a meta do retorno não foi conversada."},
  {k:"S",nome:"Sono",de:"fala",
   chegou:"Cerca de seis horas por noite. Dorme por volta de meia-noite e acorda às 6h para correr.",
   ev:{q:"Um pouco. Durmo por volta de meia-noite, acordo 6h pra correr.",t:"09:41",b:3}},
];
const coberta=(a)=>a.de==='fala'||a.de==='contexto'||a.de==='mao';

const bubbles=[...document.querySelectorAll('.bubbles .bubble')];
const dotsEl=document.getElementById('abcDots');
const doneEl=document.getElementById('abcDone');
const hintEl=document.getElementById('abcHint');
const askEl=document.getElementById('abcAsk');
let asking=-1;

function drawLive(){
  dotsEl.innerHTML='';
  abc.forEach((a,i)=>{
    const ok=coberta(a);
    const b=document.createElement('button');
    b.type='button'; b.className='ld'+(ok?' ok':'');
    b.textContent=a.k;
    b.setAttribute('aria-pressed', String(asking===i));
    b.setAttribute('aria-label', a.nome+(ok?' · coberta':' · ainda não coberta'));
    b.dataset.abc = a.k.toLowerCase();
    if(a.de==='parcial') b.classList.add('ok','parcial');
    b.onclick=()=>{ asking = asking===i ? -1 : i; drawLive(); };
    dotsEl.appendChild(b);
  });
  const falta=abc.filter(a=>!coberta(a));
  doneEl.textContent=String(7-falta.length);
  hintEl.innerHTML = falta.length
    ? 'Ainda faltam <b>'+falta.map(a=>a.k).join(', ')+'</b>.'
    : 'As sete categorias foram cobertas nesta consulta.';
  if(asking>-1){
    const a=abc[asking];
    askEl.hidden=false;
    askEl.innerHTML = !coberta(a)
      ? '<span class="w">'+(a.ask?'sugestão para cobrir o ':'ainda sem registro no ')+a.k+' · '+a.nome+'</span>'+(a.ask?'<span class="q">“'+a.ask+'”</span>':'')
      : '<span class="w">'+a.k+' · '+a.nome+' já registrado</span><span class="q">'+(a.chegou||'—')+'</span>';
  } else askEl.hidden=true;
  contarGio();
}
drawLive();

const railEl=document.getElementById('rail');
const paneEl=document.getElementById('pane');
let cur=0;

function drawRail(){
  railEl.innerHTML='';
  abc.forEach((a,i)=>{
    const b=document.createElement('button');
    b.type='button'; b.className='rl '+(coberta(a)?'ok':(a.de==='parcial'?'half':'miss'));
    b.setAttribute('role','tab');
    b.setAttribute('aria-selected', String(i===cur));
    const prev = a.chegou || (a.pend ? 'fica para a próxima consulta' : 'não conversado');
    b.innerHTML='<span class="lt" data-abc="'+a.k.toLowerCase()+'">'+a.k+'</span>'
      +'<span><span class="nm">'+a.nome+'</span><span class="pv">'+prev+'</span></span>'
      +'<span class="dt"></span>';
    b.onclick=()=>{ cur=i; drawRail(); drawPane(); };
    railEl.appendChild(b);
  });
}

function drawPane(){
  const a=abc[cur];
  bubbles.forEach(b=>b.classList.remove('cited'));
  let h='<div class="ph2"><span class="lt" data-abc="'+a.k.toLowerCase()+'">'+a.k+'</span>'
    +'<h3>'+a.nome+'</h3><span class="sp"></span>'
    +'<span class="lock"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'+(a.mao?'com texto seu':'montado pelo Gio')+'</span>'
    +(a.chegou?'<button class="btn-tiny" type="button" data-act="corrigir">corrigir</button>':'')
    +'<button class="btn-tiny" type="button" data-act="somar">acrescentar</button>'
    +(a.chegou?'<button class="btn-tiny apaga" type="button" data-act="apagar">'+LIXO+'apagar</button>':'')
    +'</div>';

  if(a.chegou){
    h+='<div class="como"><span class="lbl">como chegou</span>'
      +'<div class="bx"><textarea readonly>'+a.chegou+'</textarea></div></div>';
  }
  if(a.extra) h+=a.extra;

  if(!coberta(a)){
    h+='<div class="miss-box"><div class="t">'+(a.falta||'Nada foi dito sobre isso nesta consulta.')+'</div>'
      +(a.ask?'<div class="q">“'+a.ask+'”</div>':'')
      +'<div class="row"><button class="btn btn-soft" type="button" data-act="perguntar">Voltar e perguntar</button>'
      +'<button class="btn btn-soft" type="button" data-act="adiar">Deixar para a próxima</button></div></div>';
    if(a.pend) h+='<div class="kept"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>Marcado para o retorno. O Gio leva a pergunta para a próxima consulta.</div>';
  }

  if(a.ev){
    h+='<div class="evidence">';
    if(a.ev.doc) h+='<span class="lbl">evidência · documento anexado</span><blockquote>'+a.ev.doc+'</blockquote>';
    else h+='<span class="lbl">evidência na transcrição</span><blockquote>“'+a.ev.q+'”</blockquote>'
      +'<button class="play" type="button"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'+a.ev.t+' · ouvir na gravação</button>';
    h+='</div>';
  }
  paneEl.innerHTML=h;

  const mg=paneEl.querySelector('.mg');
  if(mg&&window.gioMg) window.gioMg(mg);

  const play=paneEl.querySelector('.play');
  if(play) play.onclick=()=>{
    const b=bubbles[a.ev.b];
    if(b){ goPhase('gravacao'); setTimeout(()=>{ b.classList.add('cited'); b.scrollIntoView({block:'center',behavior:'smooth'}); },120); }
  };
  const corrigir=paneEl.querySelector('[data-act="corrigir"]');
  if(corrigir) corrigir.onclick=()=>{
    const t=paneEl.querySelector('.como textarea');
    if(!t) return;
    t.readOnly=!t.readOnly;
    corrigir.textContent=t.readOnly?'corrigir':'concluir correção';
    if(!t.readOnly){ t.focus(); validado=false; paintState(); }
    else { a.chegou=t.value; drawRail(); }
  };
  const perguntar=paneEl.querySelector('[data-act="perguntar"]');
  if(perguntar) perguntar.onclick=()=>goPhase('gravacao');
  const adiar=paneEl.querySelector('[data-act="adiar"]');
  if(adiar) adiar.onclick=()=>{ a.pend=!a.pend; drawRail(); drawPane(); drawPend(); };

  const somar=paneEl.querySelector('[data-act="somar"]');
  if(somar) somar.onclick=()=>{
    if(paneEl.querySelector('.pane-add')) return;
    const box=document.createElement('div');
    box.className='pane-add';
    box.innerHTML='<textarea aria-label="Informação a acrescentar" placeholder="O que entra no '+a.k+' · '+a.nome+'?"></textarea>'
      +'<div class="row"><button type="button" class="btn btn-primary btn-sm" data-salva>Acrescentar</button>'
      +'<button type="button" class="btn btn-soft btn-sm" data-sai>Cancelar</button></div>';
    somar.after(box);
    const ta=box.querySelector('textarea');
    ta.focus();
    box.querySelector('[data-sai]').onclick=()=>box.remove();
    box.querySelector('[data-salva]').onclick=()=>{
      const v=ta.value.trim();
      if(!v) return;
      a.chegou=a.chegou?a.chegou+' '+v:v;
      if(!coberta(a)){ a.de='mao'; a.falta=null; }
      a.mao=true;
      validado=false; paintState();
      drawLive(); drawRail(); drawPane(); drawPend();
      window.gioToast(a.k+' · '+a.nome+' ganhou texto seu. O carimbo registra o acréscimo.');
    };
  };

  const apagar=paneEl.querySelector('[data-act="apagar"]');
  if(apagar) apagar.onclick=()=>{
    if(paneEl.querySelector('.pane-conf')) return;
    const box=document.createElement('div');
    box.className='pane-conf';
    box.innerHTML='<span>Apagar o registro do '+a.k+' · '+a.nome+'? O bloco volta a valer como não conversado.</span>'
      +'<div class="row"><button type="button" class="btn btn-danger btn-sm" data-sim>Apagar</button>'
      +'<button type="button" class="btn btn-soft btn-sm" data-nao>Cancelar</button></div>';
    apagar.closest('.ph2').after(box);
    box.querySelector('[data-nao]').focus();
    box.querySelector('[data-nao]').onclick=()=>box.remove();
    box.querySelector('[data-sim]').onclick=()=>{
      a.chegou='';
      a.de='falta';
      a.mao=false;
      a.falta='Registro apagado por você nesta consulta.';
      validado=false; paintState();
      drawLive(); drawRail(); drawPane(); drawPend();
      window.gioToast(a.k+' · '+a.nome+' apagado. Nada dessa letra entra no prontuário.');
    };
  };
}
drawRail(); drawPane();

const pendEl=document.getElementById('pendList');
function drawPend(){
  if(!pendEl) return;
  const itens=abc.filter(a=>!coberta(a)).slice(0,6);
  pendEl.innerHTML = itens.length ? itens.map((a)=>
    '<div class="crow" data-cols="3">'
    +'<span class="lt2" data-abc="'+a.k.toLowerCase()+'">'+a.k+'</span>'
    +'<div class="who"><div class="nm">'+a.nome+(a.falta?' <span class="pq">· '+a.falta+'</span>':'')+'</div>'+(a.ask?'<div class="mt">“'+a.ask+'”</div>':'')+'</div>'
    +'<span class="chip mini '+(a.pend?'done':'muted')+'"><i></i>'+(a.pend?'vai no retorno':'não marcado')+'</span>'
    +'</div>').join('')
    : '<p class="pend-vazio">Nada ficou de fora: as sete letras foram cobertas nesta consulta.</p>';
}
drawPend();

const msgs=document.getElementById('chatMsgs'), input=document.getElementById('chatIn');
const VERBOS=[
  {re:/(remov|tir[ae]|retir|exclu|apag|cancel)/i, acao:'remover'},
  {re:/(troc|mud[ae]|alter|corrig|substitu|pass[ae])/i, acao:'trocar'},
  {re:/(registr|escrev|anot|defin)/i, acao:'escrever'},
  {re:/(adicion|acrescent|inclu|coloc|p[oõ]e|ped[ei]|solicit|prescrev|receit)/i, acao:'adicionar'},
];
const ALVOS=[
  {re:/(exame|laborat|dosagem|hemograma|tsh|ferritina|glicad|lip[ií]dic)/i, letra:'b'},
  {re:/(prescri|medicament|suplement|vitamina|creatina|magn[eé]sio|[oô]mega|dose|posologia)/i, letra:'d'},
  {re:/(plano|refei[çc]|aliment|jantar|almo[çc]o|caf[eé]|lanche|ceia|kcal|prote[ií]na)/i, letra:'a'},
  {re:/(foco|meta|objetivo)/i, letra:'f'},
  {re:/(sono|dormir)/i, letra:'s'},
  {re:/(exerc[ií]cio|treino|corrid|muscula[çc])/i, letra:'e'},
];
const PARADAS=/^(a|o|as|os|um|uma|de|do|da|dos|das|no|na|nos|nas|em|para|pro|pra|que|e|com)$/i;
const desfeita=new Map();

function soTextoLetra(letra){ return letra==='e'||letra==='s'||letra==='f'; }
function acharBloco(letra){
  const lt=document.querySelector('[data-panel="conduta"] .decis .lt[data-abc="'+letra+'"]');
  return lt?lt.closest('.decis'):null;
}
function nomeBloco(bloco){ return bloco.querySelector('h3').textContent.trim(); }

function carga(texto,verbo){
  let t=texto.replace(verbo,' ');
  t=t.replace(/\b(por favor|pf)\b/ig,' ').replace(/\s+/g,' ').trim();
  t=t.replace(/\s*(no|na|do|da|em|a|ao)?\s*(plano alimentar|plano|conduta|ficha|prescri\S*|receita)\s*$/i,'');
  const palavras=t.split(' ');
  while(palavras.length&&PARADAS.test(palavras[0])) palavras.shift();
  return palavras.join(' ').replace(/[.!?,;]+$/,'').trim();
}
function primeiraMaiuscula(t){ return t?t[0].toUpperCase()+t.slice(1):t; }
function combina(linha,alvo){
  const chaves=alvo.toLowerCase().split(' ').filter(w=>w.length>3&&!PARADAS.test(w));
  const texto=linha.textContent.toLowerCase();
  return chaves.some(k=>texto.indexOf(k)>-1);
}

function opAdicionar(bloco,texto){
  const presc=bloco.querySelector('.presc');
  if(presc){
    const modelo=presc.querySelector('.p');
    if(!modelo) return null;
    const linha=modelo.cloneNode(true);
    const rm=linha.querySelector('.p-rm'); if(rm) rm.remove();
    linha.querySelectorAll('[contenteditable]').forEach(e=>e.removeAttribute('contenteditable'));
    const corte=texto.split(/,| que | por /)[0].trim();
    linha.querySelector('.med').textContent=primeiraMaiuscula(corte);
    linha.querySelector('.obs').textContent=texto.length>corte.length
      ? texto.slice(corte.length).replace(/^[,\s]+/,'') : 'a combinar';
    const h=linha.querySelector('.hrs'); if(h) h.textContent='–';
    presc.appendChild(linha); renumerar(presc);
    return 'acrescentei '+corte;
  }
  const itens=bloco.querySelector('[data-food-panel="plano"] .meal:last-of-type .items');
  if(itens){
    itens.insertAdjacentHTML('beforeend','<span class="it">'+texto+' <span>estimando…</span></span>');
    return 'acrescentei '+texto+' ao plano';
  }
  return opEscrever(bloco,texto);
}
function opRemover(bloco,texto){
  const linha=[...bloco.querySelectorAll('.presc .p, [data-food-panel="plano"] .it')].find(l=>combina(l,texto));
  if(!linha) return null;
  const nome=(linha.querySelector('.med')||linha).textContent.trim().split('\n')[0];
  const presc=linha.closest('.presc');
  linha.remove();
  if(presc) renumerar(presc);
  return 'tirei '+nome;
}
function opTrocar(bloco,texto){
  const partes=texto.split(/\bpara\b/i);
  const alvo=partes[0].trim();
  const valor=(partes[1]||'').trim();
  const linha=[...bloco.querySelectorAll('.presc .p')].find(l=>combina(l,alvo));
  if(!linha||!valor) return opEscrever(bloco,texto);
  const med=linha.querySelector('.med');
  const antes=med.textContent.trim();
  med.textContent=/\d/.test(antes)?antes.replace(/\s*[\d.,]+\s*\S*$/,' '+valor):antes+' '+valor;
  return 'passei '+antes+' para '+med.textContent.trim();
}
function opEscrever(bloco,texto){
  const destino=bloco.querySelector('.to');
  if(!destino||!texto) return null;
  destino.textContent=primeiraMaiuscula(texto)+(/[.!?]$/.test(texto)?'':'.');
  return 'registrei “'+(texto.length>46?texto.slice(0,46)+'…':texto)+'”';
}

const FERRAMENTA={adicionar:'inserirLinhaDaConduta',remover:'removerLinhaDaConduta',
  trocar:'editarLinhaDaConduta',escrever:'atualizarBlocoTexto'};

function marcarGio(bloco,antes){
  if(!desfeita.has(bloco)) desfeita.set(bloco,antes);
  bloco.dataset.gio='true';
  bloco.classList.remove('gio-tocou'); void bloco.offsetWidth; bloco.classList.add('gio-tocou');
  bloco.scrollIntoView({block:'center',behavior:'smooth'});
  const cabeca=bloco.querySelector('.dh');
  if(cabeca.querySelector('.gio-chip')) return;
  const chip=document.createElement('span');
  chip.className='gio-chip';
  chip.innerHTML='<i></i>ajuste do Gio<button type="button" class="gio-undo">desfazer</button>';
  chip.querySelector('.gio-undo').onclick=()=>{
    bloco.querySelector('.to').innerHTML=desfeita.get(bloco);
    desfeita.delete(bloco);
    delete bloco.dataset.gio;
    chip.remove();
    carimbarMao();
    window.gioToast('Desfeito. O bloco voltou como estava.');
  };
  cabeca.appendChild(chip);
}

function falaGio(html){
  const a=document.createElement('div'); a.className='m ai'; a.innerHTML=html;
  msgs.appendChild(a); msgs.scrollTop=msgs.scrollHeight;
}

function executar(pedido){
  const verbo=VERBOS.find(v=>v.re.test(pedido));
  const alvo=ALVOS.map(a=>({a,i:pedido.search(a.re)})).filter(x=>x.i>-1)
    .sort((x,y)=>x.i-y.i).map(x=>x.a)[0];
  if(!verbo||!alvo){
    falaGio('Não entendi o que mudar. Diga o bloco e a ação, como em <i>tira a creatina</i>.');
    return;
  }
  const bloco=acharBloco(alvo.letra);
  if(!bloco){ falaGio('Esse bloco não está nesta consulta.'); return; }
  if(bloco.classList.contains('editando')) bloco.querySelector('.dh .btn-tiny').click();
  const antes=bloco.querySelector('.to').innerHTML;
  let texto=carga(pedido,verbo.re);
  if(soTextoLetra(alvo.letra)) texto=texto.replace(alvo.re,' ').replace(/^[\s:,-]+/,'').replace(/\s+/g,' ').trim();
  const acao=(soTextoLetra(alvo.letra)&&verbo.acao!=='remover')?'escrever':verbo.acao;
  const ops={adicionar:opAdicionar,remover:opRemover,trocar:opTrocar,escrever:opEscrever};
  const resumo=ops[acao](bloco,texto);
  if(!resumo){
    falaGio('Não achei essa linha em <b>'+nomeBloco(bloco).toLowerCase()+'</b>.');
    return;
  }
  marcarGio(bloco,antes);
  carimbarMao();
  falaGio('<b>Feito:</b> '+resumo+', em '+nomeBloco(bloco).toLowerCase()+'.'
    +'<span class="tool"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>'+FERRAMENTA[acao]+'</span>');
}

function send(){
  const v=input.value.trim(); if(!v) return;
  const u=document.createElement('div'); u.className='m user'; u.textContent=v; msgs.appendChild(u);
  input.value='';
  msgs.scrollTop=msgs.scrollHeight;
  setTimeout(()=>executar(v), 480);
}
document.getElementById('chatSend').onclick=send;
input.addEventListener('keydown',e=>{ if(e.key==='Enter') send(); });

const abcState=document.getElementById('abcState');
const aiTag=document.querySelector('[data-panel="anamnese"] .ai-tag');
const manualBtn=document.getElementById('manualBtn');
const validateBtn=document.getElementById('validateBtn');
const validateHint=document.getElementById('validateHint');
let manual=false, validado=false;

function paintState(){
  if(validado){ abcState.className='state valid'; abcState.innerHTML='<i></i>validado'; }
  else { abcState.className='state draft'; abcState.innerHTML='<i></i>'+(manual?'manual':'rascunho'); }
  aiTag.classList.toggle('is-riscado', manual);
  manualBtn.setAttribute('aria-pressed', String(manual));
  manualBtn.lastChild.textContent = manual ? 'voltar a usar IA' : 'escrever sem IA';
  validateHint.textContent = validado
    ? 'Validado por Dra. Helena Prado · 21/07/2026, 11:14. Registrado no prontuário com o carimbo de apoio de IA.'
    : (manual ? 'Escrito sem apoio de IA. Nada entra no prontuário até você validar.'
              : 'Enquanto for rascunho, nada entra no prontuário.');
  validateBtn.hidden = validado;
  document.querySelectorAll('.frozen-note').forEach((n)=>{ n.hidden = (n.dataset.valida==='sim') !== validado; });
  const sv=document.getElementById('stampValida');
  if(sv) sv.textContent = validado
    ? 'validado por Dra. Helena Prado · CRM-RJ 00000'
    : 'anamnese em rascunho · ainda sem validação';
}
const irValidar=document.getElementById('irValidar');
if(irValidar) irValidar.onclick=()=>{
  goPhase('anamnese');
  setTimeout(()=>{
    validateBtn.scrollIntoView({block:'center',behavior:'smooth'});
    validateBtn.classList.remove('flash'); void validateBtn.offsetWidth; validateBtn.classList.add('flash');
  },260);
};
manualBtn.onclick=()=>{ manual=!manual; validado=false; paintState(); };
validateBtn.onclick=()=>{ validado=true; paintState(); };
paintState();

const retUndo=document.getElementById('retUndo');
if(retUndo) retUndo.onclick=()=>{
  const ok=document.getElementById('retOk'), gat=document.getElementById('retGatilho');
  const marcado=!ok.hidden;
  ok.hidden=marcado; gat.hidden=marcado;
  retUndo.textContent=marcado?'Marcar retorno':'Desmarcar';
  document.querySelector('#retornoCard .ai-tag').lastChild.textContent=marcado?'retorno indicado pelo Gio':'retorno marcado pelo Gio';
  window.gioToast(marcado
    ? 'Retorno desmarcado. A data fica só como indicação.'
    : 'Retorno remarcado para 17/09, 10:30.');
};

const waBtn=document.getElementById('waBtn'), waMsg=document.getElementById('waMsg');
if(waBtn) waBtn.onclick=()=>{ waMsg.hidden=false; waBtn.disabled=true; };

const modal=document.getElementById('delModal');
document.getElementById('cancelBtn').onclick=()=>modal.showModal();
document.getElementById('delCancel').onclick=()=>modal.close();
document.getElementById('delConfirm').onclick=()=>{
  modal.close();
  window.gioRec.stop();
  window.gioConsultas.marcar('Paulo R.','cancelada');
  sessionStorage.setItem('gio.toast','Consulta de Paulo R. cancelada. Nada foi para o prontuário.');
  location.href='dashboard.html';
};
modal.addEventListener('click',e=>{ if(e.target===modal) modal.close(); });

document.querySelectorAll('.ctx .doc').forEach((doc)=>{
  const nm=doc.querySelector('.nm'), mt=doc.querySelector('.mt');
  const ehBio=/bioimped|inbody/i.test(nm.textContent);
  const atual=ehBio?'bio':'lab';
  const acts=document.createElement('div');
  acts.className='doc-acts';
  const sel=document.createElement('select');
  sel.setAttribute('aria-label','Tipo do exame');
  sel.innerHTML=TIPOS_EXAME.map((t)=>'<option value="'+t[0]+'"'+(t[0]===atual?' selected':'')+'>'+t[1]+'</option>').join('');
  sel.onchange=()=>{
    const t=TIPOS_EXAME.find((x)=>x[0]===sel.value);
    mt.innerHTML=mt.innerHTML.replace(/alimenta o <b>[A-Z]<\/b>/,'alimenta o <b>'+t[2]+'</b>');
    window.gioToast('Tipo corrigido para '+t[1].toLowerCase()+'. Passa a alimentar o '+t[2]+'.');
  };
  const rm=document.createElement('button');
  rm.type='button'; rm.className='doc-rm'; rm.innerHTML=LIXO;
  rm.setAttribute('aria-label','Tirar este documento da consulta');
  rm.onclick=()=>{
    if(doc.querySelector('.doc-conf')) return;
    const conf=document.createElement('div');
    conf.className='doc-conf';
    conf.innerHTML='<span>Tirar este documento da consulta?</span><button type="button" class="btn btn-danger btn-sm" data-sim>Tirar</button><button type="button" class="btn btn-soft btn-sm" data-nao>Cancelar</button>';
    conf.querySelector('[data-sim]').onclick=()=>{
      const nome=nm.textContent.trim();
      doc.remove();
      window.gioToast(nome+' saiu da consulta. O arquivo continua em Exames.');
    };
    conf.querySelector('[data-nao]').onclick=()=>conf.remove();
    doc.appendChild(conf);
    conf.querySelector('[data-nao]').focus();
  };
  nm.setAttribute('tabindex','0');
  nm.setAttribute('role','button');
  nm.setAttribute('aria-label','Corrigir o nome do exame');
  const renomear=()=>{
    if(nm.querySelector('input')) return;
    const antes=nm.textContent.trim();
    nm.innerHTML='<input value="'+antes.replace(/"/g,'&quot;')+'" aria-label="Nome do exame" />';
    const inp=nm.querySelector('input');
    inp.focus(); inp.select();
    const fim=()=>{
      const v=inp.value.trim()||antes;
      nm.textContent=v;
      if(v!==antes) window.gioToast('Nome do exame corrigido.');
    };
    inp.addEventListener('keydown',(ev)=>{
      if(ev.key==='Enter') fim();
      if(ev.key==='Escape') nm.textContent=antes;
      ev.stopPropagation();
    });
    inp.addEventListener('blur',fim);
  };
  nm.addEventListener('click',renomear);
  nm.addEventListener('keydown',(ev)=>{ if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();renomear();} });
  acts.appendChild(sel);
  acts.appendChild(rm);
  doc.insertBefore(acts,doc.querySelector('.rd'));
});

const notaBtn=document.getElementById('abNota');
const notaCaixa=document.getElementById('notaCaixa');
const notaTxt=document.getElementById('notaTxt');
const notaDot=document.getElementById('notaDot');
try{ notaTxt.value=sessionStorage.getItem('gio.nota')||''; }catch(e){}
function pintarNota(){ notaDot.hidden=!notaTxt.value.trim(); }
notaTxt.addEventListener('input',()=>{
  try{ sessionStorage.setItem('gio.nota',notaTxt.value); }catch(e){}
  pintarNota();
});
notaBtn.onclick=()=>{
  const abre=notaCaixa.hidden;
  notaCaixa.hidden=!abre;
  notaBtn.setAttribute('aria-expanded',String(abre));
  if(abre) notaTxt.focus({preventScroll:true});
};
pintarNota();

const relatoEl=document.querySelector('[data-food-panel="relato"]');
if(relatoEl){
  relatoEl.addEventListener('click',(e)=>{
    const rm=e.target.closest('.it-rm');
    if(rm){
      const it=rm.closest('.it');
      const nome=it.firstChild.textContent.trim();
      it.remove();
      window.gioToast(nome+' saiu do recordatório. O ajuste fica no registro da consulta.');
      return;
    }
    const add=e.target.closest('[data-add-relato]');
    if(add){
      const nome=prompt('O que o paciente citou? (alimento e quantidade)');
      if(!nome) return;
      const ultimo=relatoEl.querySelector('.meal:last-of-type .items');
      ultimo.insertAdjacentHTML('beforeend','<span class="it" tabindex="0">'+nome+' <span>estimando…</span></span>');
      window.gioToast('Item acrescentado. O Gio busca os macros e atualiza o total.');
      setTimeout(()=>{ const novo=ultimo.querySelector('.it:last-child span'); if(novo) novo.textContent='12 g P'; },900);
      return;
    }
    const it=e.target.closest('.it');
    if(!it) return;
    ligarItem(it, 'Item corrigido. Os macros são recalculados e a correção fica registrada.');
  });
  relatoEl.querySelectorAll('.it').forEach((it)=>{
    it.setAttribute('tabindex','0');
    it.insertAdjacentHTML('beforeend','<button type="button" class="it-rm" aria-label="Remover este item do recordatório">×</button>');
  });
}


const stampMao = document.getElementById('stampMao');
function carimbarMao() {
  if (!stampMao) return;
  const nomes = [...document.querySelectorAll('.decis[data-editado]')]
    .map((d) => d.querySelector('h3').textContent.trim());
  stampMao.hidden = !nomes.length;
  stampMao.textContent = nomes.length
    ? 'escrito à mão por você: ' + nomes.join(', ').toLowerCase()
    : '';
  const stampGio = document.getElementById('stampGio');
  if (!stampGio) return;
  const doGio = [...document.querySelectorAll('.decis[data-gio]')]
    .map((d) => d.querySelector('h3').textContent.trim());
  stampGio.hidden = !doGio.length;
  stampGio.textContent = doGio.length
    ? 'ajustado pelo Gio a seu pedido: ' + doGio.join(', ').toLowerCase()
    : '';
}

function editavel(el, rotulo) {
  el.setAttribute('contenteditable', 'true');
  el.setAttribute('role', 'textbox');
  el.setAttribute('aria-label', rotulo);
  el.setAttribute('spellcheck', 'false');
}
function travar(el) {
  el.removeAttribute('contenteditable');
  el.removeAttribute('role');
  el.removeAttribute('aria-label');
  el.removeAttribute('spellcheck');
}

function renumerar(presc) {
  presc.querySelectorAll('.p .ord').forEach((o, i) => { o.textContent = i + 1; });
}

function abrirPresc(presc) {
  if (presc.dataset.antes === undefined) presc.dataset.antes = presc.innerHTML;
  presc.querySelectorAll('.p').forEach((linha) => {
    editavel(linha.querySelector('.med'), 'Nome da prescrição');
    editavel(linha.querySelector('.obs'), 'Posologia');
    const hrs = linha.querySelector('.hrs');
    if (hrs) editavel(hrs, 'Horário');
    if (!linha.querySelector('.p-rm')) {
      const rm = document.createElement('button');
      rm.type = 'button'; rm.className = 'p-rm'; rm.innerHTML = LIXO;
      rm.setAttribute('aria-label', 'Remover esta linha');
      rm.onclick = () => { linha.remove(); renumerar(presc); };
      linha.appendChild(rm);
    }
  });
  if (!presc.nextElementSibling || !presc.nextElementSibling.classList.contains('add-item')) {
    const add = document.createElement('button');
    add.type = 'button'; add.className = 'add-item';
    add.textContent = '+ acrescentar uma linha';
    add.onclick = () => {
      const linha = presc.querySelector('.p').cloneNode(true);
      linha.querySelector('.med').textContent = 'Nova prescrição';
      linha.querySelector('.obs').textContent = 'posologia';
      const h = linha.querySelector('.hrs');
      if (h) h.textContent = '–';
      const velho = linha.querySelector('.p-rm');
      if (velho) velho.remove();
      presc.appendChild(linha);
      renumerar(presc);
      abrirPresc(presc);
      linha.querySelector('.med').focus();
    };
    presc.after(add);
  }
}

function fecharPresc(presc) {
  presc.querySelectorAll('.p-rm').forEach((btn) => btn.remove());
  const add = presc.nextElementSibling;
  if (add && add.classList.contains('add-item')) add.remove();
  presc.querySelectorAll('.med, .obs, .hrs').forEach(travar);
  const mudou = presc.innerHTML !== presc.dataset.antes;
  delete presc.dataset.antes;
  return mudou;
}

function ligarItem(it, aviso, aoMudar) {
  if (it.querySelector('input')) return;
  const original = it.firstChild.textContent.trim();
  const macro = it.querySelector('span') ? it.querySelector('span').outerHTML : '';
  it.innerHTML = '<input value="' + original.replace(/"/g, '&quot;') + '" aria-label="Corrigir este item" />';
  const inp = it.querySelector('input');
  inp.focus(); inp.select();
  const confirma = () => {
    const v = inp.value.trim() || original;
    it.innerHTML = v + ' ' + macro;
    if (v !== original) { window.gioToast(aviso); if (aoMudar) aoMudar(); }
  };
  inp.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') confirma();
    if (ev.key === 'Escape') it.innerHTML = original + ' ' + macro;
  });
  inp.addEventListener('blur', confirma);
}

const planoEl = document.querySelector('[data-food-panel="plano"]');
let planoMudou = false;

function cliquePlano(e) {
  const rm = e.target.closest('.it-rm');
  if (rm) {
    const it = rm.closest('.it');
    const nome = it.firstChild.textContent.trim();
    it.remove();
    planoMudou = true;
    window.gioToast(nome + ' saiu do plano prescrito.');
    return;
  }
  const add = e.target.closest('[data-add-plano]');
  if (add) {
    const nome = prompt('O que entra no plano? (alimento e quantidade)');
    if (!nome) return;
    const ultimo = planoEl.querySelector('.meal:last-of-type .items');
    ultimo.insertAdjacentHTML('beforeend', '<span class="it" tabindex="0">' + nome
      + ' <span>estimando…</span><button type="button" class="it-rm" aria-label="Remover este item">×</button></span>');
    planoMudou = true;
    window.gioToast('Item acrescentado ao plano. O Gio busca os macros e refaz o total.');
    setTimeout(() => {
      const novo = ultimo.querySelector('.it:last-child span');
      if (novo) novo.textContent = '12 g P';
    }, 900);
    return;
  }
  const it = e.target.closest('.it');
  if (!it) return;
  ligarItem(it, 'Item corrigido no plano. Os macros são recalculados.', () => { planoMudou = true; });
}

function abrirPlano() {
  planoMudou = false;
  planoEl.addEventListener('click', cliquePlano);
  planoEl.querySelectorAll('.it').forEach((it) => {
    it.setAttribute('tabindex', '0');
    if (!it.querySelector('.it-rm')) {
      it.insertAdjacentHTML('beforeend',
        '<button type="button" class="it-rm" aria-label="Remover este item do plano">×</button>');
    }
  });
  if (!planoEl.querySelector('[data-add-plano]')) {
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'add-item';
    add.setAttribute('data-add-plano', '');
    add.textContent = '+ acrescentar um alimento ao plano';
    planoEl.appendChild(add);
  }
}

function fecharPlano() {
  planoEl.removeEventListener('click', cliquePlano);
  planoEl.querySelectorAll('.it-rm').forEach((b) => b.remove());
  planoEl.querySelectorAll('.it').forEach((it) => it.removeAttribute('tabindex'));
  const add = planoEl.querySelector('[data-add-plano]');
  if (add) add.remove();
  return planoMudou;
}

function abrirTexto(alvo) {
  const t = document.createElement('textarea');
  t.value = alvo.textContent.trim();
  t.setAttribute('aria-label', 'Texto do bloco');
  alvo.dataset.antes = alvo.innerHTML;
  alvo.textContent = '';
  alvo.appendChild(t);
  t.focus();
}

function fecharTexto(alvo) {
  const t = alvo.querySelector('textarea');
  if (!t) return false;
  const v = t.value.trim();
  if (!v) { alvo.innerHTML = alvo.dataset.antes || ''; return false; }
  alvo.textContent = v;
  return v !== (new DOMParser().parseFromString(alvo.dataset.antes || '', 'text/html').body.textContent || '').trim();
}

document.querySelectorAll('[data-panel="conduta"] .decis').forEach((bloco) => {
  const cabeca = bloco.querySelector('.dh');
  const presc = bloco.querySelector('.presc');
  const texto = bloco.querySelector('.to');
  const soTexto = texto && !texto.querySelector('.presc, .plano, .alvo');
  const ehPlano = planoEl && bloco.contains(planoEl);
  if (!presc && !soTexto && !ehPlano) return;

  if (!cabeca.querySelector('.sp')) {
    const sp = document.createElement('span');
    sp.className = 'sp';
    cabeca.appendChild(sp);
  }
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.className = 'btn-tiny';
  botao.setAttribute('aria-pressed', 'false');
  botao.innerHTML = '<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>editar';
  cabeca.appendChild(botao);

  botao.onclick = () => {
    const aberto = bloco.classList.toggle('editando');
    botao.setAttribute('aria-pressed', String(aberto));
    botao.lastChild.textContent = aberto ? 'concluir' : 'editar';
    if (aberto) {
      if (ehPlano) abrirPlano();
      else if (presc) abrirPresc(presc);
      else abrirTexto(texto);
      return;
    }
    let mudou = false;
    if (ehPlano) mudou = fecharPlano();
    else if (presc) mudou = fecharPresc(presc);
    else mudou = fecharTexto(texto);
    if (mudou) {
      bloco.dataset.editado = 'true';
      if (!cabeca.querySelector('.mao-chip')) {
        const chip = document.createElement('span');
        chip.className = 'mao-chip';
        chip.textContent = 'você escreveu';
        cabeca.insertBefore(chip, botao);
      }
      carimbarMao();
      if (phase === 'encerramento') pintarGio();
      window.gioToast(bloco.querySelector('h3').textContent.trim()
        + ' passou a ser texto seu. O carimbo do prontuário registra isso.');
    }
  };
});
carimbarMao();


const ARANHA_TGL=document.getElementById('aranhaTgl');
const ARANHA_BOX=document.getElementById('aranhaBox');
function notaLetra(a){
  if(a.de==='parcial') return .55;
  if(coberta(a)) return .88;
  return .22;
}
function desenharAranha(){
  const cx=150, cy=128, R=96, N=abc.length;
  const ponto=(i,f)=>{
    const ang=-Math.PI/2+i*2*Math.PI/N;
    return [cx+Math.cos(ang)*R*f, cy+Math.sin(ang)*R*f];
  };
  let h='<svg viewBox="0 0 300 260" role="img" aria-label="Mapa ABCDEFS da consulta">';
  [.33,.66,1].forEach((f)=>{
    h+='<polygon class="anel" points="'+abc.map((_,i)=>ponto(i,f).map((v)=>v.toFixed(1)).join(',')).join(' ')+'"/>';
  });
  abc.forEach((_,i)=>{
    const [x,y]=ponto(i,1);
    h+='<line class="eixo" x1="'+cx+'" y1="'+cy+'" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>';
  });
  h+='<polygon class="area" points="'+abc.map((a2,i)=>ponto(i,notaLetra(a2)).map((v)=>v.toFixed(1)).join(',')).join(' ')+'"/>';
  abc.forEach((a2,i)=>{
    const [x,y]=ponto(i,notaLetra(a2));
    h+='<circle class="no" data-abc="'+a2.k.toLowerCase()+'" cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="3.4"/>';
  });
  abc.forEach((a2,i)=>{
    const [x,y]=ponto(i,1.16);
    h+='<text class="lt3" data-abc="'+a2.k.toLowerCase()+'" x="'+x.toFixed(1)+'" y="'+(y+4).toFixed(1)+'">'+a2.k+'</text>';
  });
  h+='</svg><p class="legenda">Quanto mais perto da borda, mais conversada a área ficou nesta consulta.</p>';
  ARANHA_BOX.innerHTML=h;
}
if(ARANHA_TGL) ARANHA_TGL.onclick=()=>{
  const liga=ARANHA_TGL.getAttribute('aria-checked')!=='true';
  ARANHA_TGL.setAttribute('aria-checked',String(liga));
  ARANHA_BOX.hidden=!liga;
  if(liga) desenharAranha();
};

const AGORA = {
  gravacao: 'ouvindo e separando as falas',
  anamnese: 'esperando você conferir o rascunho',
  conduta: 'lendo os blocos um contra o outro',
  encerramento: 'terminei por aqui',
};

function gioAgora(texto) {
  const el = document.getElementById('gioAgoraTx');
  if (el) el.textContent = texto;
}

function contarGio() {
  let n = 0;
  let letras = [];
  if (phase === 'gravacao' || phase === 'anamnese') {
    letras = abc.filter((a) => !coberta(a));
    n = letras.length;
  } else if (phase === 'conduta') {
    n = document.querySelectorAll('.preread .f:not(.done)').length;
  }
  ['gioN', 'gioNAlca', 'gioNBarra'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.hidden = !n;
    el.textContent = n;
  });
  const pend = document.getElementById('gioPend');
  if (pend) {
    pend.innerHTML = letras.slice(0, 3).map((a) =>
      '<span data-abc="' + a.k.toLowerCase() + '">' + a.k + '</span>').join('')
      + (letras.length > 3 ? '<span class="mais">+' + (letras.length - 3) + '</span>' : '');
  }
  const antes = contarGio.antes;
  if (antes !== undefined && n > antes) acenar();
  contarGio.antes = n;
}

function acenar() {
  if (palco.dataset.gio !== 'fechado') return;
  ['gioAbrir', 'abGioBtn'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('acenou');
    void el.offsetWidth;
    el.classList.add('acenou');
  });
}

const CAMPO = {
  gravacao: 'Pergunte sobre o paciente…',
  anamnese: 'Pergunte sobre o paciente…',
  conduta: 'Peça um ajuste na ficha…',
  encerramento: 'Pergunte ao Gio…',
};

function pintarGio() {
  const campo = document.getElementById('chatIn');
  if (campo) campo.placeholder = CAMPO[phase];
  const poder = document.getElementById('gioPoder');
  if (poder) poder.hidden = phase !== 'conduta';
  document.querySelectorAll('.gio-grupo').forEach((g) => {
    g.hidden = !g.dataset.gioFase.split(' ').includes(phase);
  });
  if (phase === 'conduta') contarPreread();
  else gioAgora(AGORA[phase]);
  if (phase === 'encerramento') {
    const nomes = [...document.querySelectorAll('.decis[data-editado] h3')]
      .map((h) => h.textContent.trim().toLowerCase());
    const el = document.getElementById('gioFimMao');
    if (el) el.textContent = nomes.length
      ? 'Você reescreveu ' + nomes.join(', ') + '. Vai no carimbo.'
      : 'Nenhum bloco foi reescrito por você.';
  }
  contarGio();
}

const palco = document.getElementById('palco');
function abrirGio(aberto) {
  palco.dataset.gio = aberto ? 'aberto' : 'fechado';
  ['gioAbrir', 'abGioBtn'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) { el.setAttribute('aria-expanded', String(aberto)); el.classList.remove('acenou'); }
  });
}
function guardarGio(aberto) {
  try { localStorage.setItem('gio:painel', aberto ? 'aberto' : 'fechado'); } catch (e) {}
}
document.getElementById('gioFechar').onclick = () => { abrirGio(false); guardarGio(false); };
document.getElementById('gioAbrir').onclick = () => { abrirGio(true); guardarGio(true); };
document.getElementById('abGioBtn').onclick = () => {
  const novo = palco.dataset.gio === 'fechado';
  abrirGio(novo);
  guardarGio(novo);
};
let escolhaGio = null;
try { escolhaGio = localStorage.getItem('gio:painel'); } catch (e) { escolhaGio = null; }
abrirGio(escolhaGio !== 'fechado');
pintarGio();
