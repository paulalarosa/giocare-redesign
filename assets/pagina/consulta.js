if (window.gioRec && !window.gioRec.get()) {
  window.gioRec.start({ nome: 'Paulo R.', iniciais: 'PR', modo: 'presencial', since: Date.now() - 12 * 60 * 1000 - 4000 });
}

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
    user:'Ajusta o plano para chegar perto das 2.480 kcal recomendadas.',
    ai:'Reforcei as três refeições e acrescentei um lanche da tarde. O dia foi de 1.210 para 2.455 kcal, com 138 g de proteína. Referência da Nutrology Academy.',
    tool:'adicionarRefeicao + editarItemRefeicao · plano',
    feito:'Levei o dia de 1.210 para 2.455 kcal, perto das 2.480 que a bioimpedância recomenda.'},
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
    al.querySelector('.bar i').style.width = ligar ? '99%' : '49%';
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
  const hd=document.getElementById('prereadHd');
  if(!hd) return;
  hd.innerHTML = feitos===total
    ? 'a IA ajustou a ficha · '+total+' pontos, todos revisáveis'
    : feitos
      ? 'a IA ajustou '+feitos+' de '+total+' pontos'
      : 'a IA leu a ficha · nenhum ajuste aplicado';
}

function aplicar(row,narrar){
  const k=row.dataset.fix, fx=FIXES[k];
  if(row.classList.contains('done')) return;
  row.classList.add('done');
  row.querySelector('.tx').textContent=fx.feito;
  row.querySelector('[data-desfazer]').hidden=false;
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
});
linhasFix.forEach((row,i)=>setTimeout(()=>aplicar(row,true),700+i*900));

const aiCard=document.getElementById('aiCard');
document.querySelectorAll('[data-ai-act]').forEach((b)=>{
  b.onclick=()=>{
    if(b.dataset.aiAct==='manual'){aiCard.dataset.ai='ready';return;}
    aiCard.dataset.ai='processing';
    setTimeout(()=>{aiCard.dataset.ai='ready';},2200);
  };
});

const COMPOSICAO = '<div class="bia">'
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
  + '<div class="row3"><span>Ingestão calórica recomendada</span><span class="n">2.480 kcal</span><span class="fx">do aparelho</span></div>'
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
  {k:"A",nome:"Alimentação",cor:"var(--abc-a)",de:"fala",
   chegou:"Café da manhã reforçado mantido desde a última consulta. O jantar sai às 22:15, depois do treino, com macarrão e frango. Refere fome à noite.",
   ev:{q:"Consegui manter o café reforçado, mas o jantar tá saindo tarde por causa do treino.",t:"03:18",b:1}},
  {k:"B",nome:"Biomarcadores",cor:"var(--abc-b)",de:"contexto",
   chegou:"Perfil lipídico de 12/07 dentro das metas. A 25-OH-vitamina D não é refeita desde o início da suplementação.",
   ev:{doc:"Perfil lipídico + vitamina D · Laboratório Vita, 12/07"}},
  {k:"C",nome:"Composição corporal",cor:"var(--abc-c)",de:"contexto",
   chegou:"84,2 kg, IMC 25,1, gordura 18,4% e massa magra 62 kg. Perdeu 4 kg em três meses, com a massa magra preservada.",
   ev:{doc:"Bioimpedância InBody 570 · 21/07"}, extra:COMPOSICAO},
  {k:"D",nome:"Drogas",cor:"var(--abc-d)",de:"falta", chegou:"",
   ask:"Você continua tomando a vitamina D e o magnésio todo dia?"},
  {k:"E",nome:"Exercício",cor:"var(--abc-e)",de:"fala",
   chegou:"Corrida cinco vezes por semana, sempre às 6h. Treina para uma maratona em setembro.",
   ev:{q:"Um pouco. Durmo por volta de meia-noite, acordo 6h pra correr.",t:"09:41",b:3}},
  {k:"F",nome:"Foco da consulta",cor:"var(--abc-f)",de:"parcial",
   chegou:"Motivo registrado na pré-consulta: retorno de emagrecimento, quer ajustar o plano por causa do treino de maratona.",
   ask:"Se a gente resolvesse uma coisa só até o retorno, qual seria?",
   falta:"O motivo está registrado, mas a meta do retorno não foi conversada."},
  {k:"S",nome:"Sono",cor:"var(--abc-s)",de:"fala",
   chegou:"Cerca de seis horas por noite. Dorme por volta de meia-noite e acorda às 6h para correr.",
   ev:{q:"Um pouco. Durmo por volta de meia-noite, acordo 6h pra correr.",t:"09:41",b:3}},
];
const coberta=(a)=>a.de==='fala'||a.de==='contexto';

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
    if(ok) b.style.background=a.cor;
    else if(a.de==='parcial'){ b.style.background=a.cor; b.classList.add('ok','parcial'); }
    b.onclick=()=>{ asking = asking===i ? -1 : i; drawLive(); };
    dotsEl.appendChild(b);
  });
  const falta=abc.filter(a=>!coberta(a));
  doneEl.textContent=String(7-falta.length);
  hintEl.innerHTML = falta.length
    ? 'Ainda faltam: <b>'+falta.map(a=>a.k).join(', ')+'</b>. Toque na letra para ver o que perguntar, ou deixe para a próxima. A IA monta o rascunho sozinha e mostra cada ajuste; o prontuário só é assinado quando você valida.'
    : 'As sete categorias foram cobertas nesta consulta.';
  if(asking>-1){
    const a=abc[asking];
    askEl.hidden=false;
    askEl.innerHTML = !coberta(a)
      ? '<span class="w">sugestão para cobrir o '+a.k+' · '+a.nome+'</span><span class="q">“'+a.ask+'”</span>'
      : '<span class="w">'+a.k+' · '+a.nome+' já registrado</span><span class="q">'+(a.chegou||'—')+'</span>';
  } else askEl.hidden=true;
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
    b.innerHTML='<span class="lt" style="background:'+a.cor+'">'+a.k+'</span>'
      +'<span><span class="nm">'+a.nome+'</span><span class="pv">'+prev+'</span></span>'
      +'<span class="dt"></span>';
    b.onclick=()=>{ cur=i; drawRail(); drawPane(); };
    railEl.appendChild(b);
  });
}

function drawPane(){
  const a=abc[cur];
  bubbles.forEach(b=>b.classList.remove('cited'));
  let h='<div class="ph2"><span class="lt" style="background:'+a.cor+'">'+a.k+'</span>'
    +'<h3>'+a.nome+'</h3><span class="sp"></span>'
    +'<span class="lock"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>montado pela IA</span>'
    +'<button class="btn-tiny" type="button" data-act="corrigir">corrigir</button></div>';

  if(a.chegou){
    h+='<div class="como"><span class="lbl">como chegou</span>'
      +'<div class="bx"><textarea readonly>'+a.chegou+'</textarea></div></div>';
  }
  if(a.extra) h+=a.extra;

  if(!coberta(a)){
    h+='<div class="miss-box"><div class="t">'+(a.falta||'Nada foi dito sobre isso nesta consulta.')+'</div>'
      +'<div class="q">“'+a.ask+'”</div>'
      +'<div class="row"><button class="btn btn-soft" type="button" data-act="perguntar" style="padding:7px 14px;font-size:13px">Voltar e perguntar</button>'
      +'<button class="btn btn-soft" type="button" data-act="adiar" style="padding:7px 14px;font-size:13px">Deixar para a próxima</button></div></div>';
    if(a.pend) h+='<div class="kept"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>Marcado para o retorno. A IA leva a pergunta para a próxima consulta.</div>';
  }

  if(a.ev){
    h+='<div class="evidence">';
    if(a.ev.doc) h+='<span class="lbl">evidência · documento anexado</span><blockquote>'+a.ev.doc+'</blockquote>';
    else h+='<span class="lbl">evidência na transcrição</span><blockquote>“'+a.ev.q+'”</blockquote>'
      +'<button class="play" type="button"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'+a.ev.t+' · ouvir na gravação</button>';
    h+='</div>';
  }
  paneEl.innerHTML=h;

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
}
drawRail(); drawPane();

const pendEl=document.getElementById('pendList');
function drawPend(){
  if(!pendEl) return;
  const itens=abc.filter(a=>!coberta(a));
  pendEl.innerHTML=itens.map((a)=>
    '<div class="crow" style="grid-template-columns:auto 1fr auto">'
    +'<span class="lt2" style="background:'+a.cor+'">'+a.k+'</span>'
    +'<div class="who"><div class="nm">'+a.nome+'</div><div class="mt">“'+a.ask+'”</div></div>'
    +'<span class="chip '+(a.pend?'done':'muted')+'" style="font-size:11.5px"><i></i>'+(a.pend?'vai no retorno':'não marcado')+'</span>'
    +'</div>').join('');
}
drawPend();

const msgs=document.getElementById('chatMsgs'), input=document.getElementById('chatIn');
function send(){
  const v=input.value.trim(); if(!v) return;
  const u=document.createElement('div'); u.className='m user'; u.textContent=v; msgs.appendChild(u);
  input.value='';
  setTimeout(()=>{ const a=document.createElement('div'); a.className='m ai';
    a.innerHTML='Ajuste aplicado à ficha. Revise antes de confirmar.<span class="tool"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>atualizarAbcdefsCategoria</span>';
    msgs.appendChild(a); msgs.scrollTop=msgs.scrollHeight; }, 500);
  msgs.scrollTop=msgs.scrollHeight;
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
  validateBtn.style.display = validado ? 'none' : '';
}
manualBtn.onclick=()=>{ manual=!manual; validado=false; paintState(); };
validateBtn.onclick=()=>{ validado=true; paintState(); };
paintState();

const retUndo=document.getElementById('retUndo');
if(retUndo) retUndo.onclick=()=>{
  const ok=document.getElementById('retOk'), gat=document.getElementById('retGatilho');
  const marcado=!ok.hidden;
  ok.hidden=marcado; gat.hidden=marcado;
  retUndo.textContent=marcado?'Marcar retorno':'Desmarcar';
  document.querySelector('#retornoCard .ai-tag').lastChild.textContent=marcado?'retorno indicado pela IA':'retorno marcado pela IA';
  window.gioToast(marcado
    ? 'Retorno desmarcado. A data fica só como indicação.'
    : 'Retorno remarcado para 17/09, 10:30.');
};

const waBtn=document.getElementById('waBtn'), waMsg=document.getElementById('waMsg');
if(waBtn) waBtn.onclick=()=>{ waMsg.hidden=false; waBtn.disabled=true; };

const modal=document.getElementById('delModal');
document.getElementById('cancelBtn').onclick=()=>modal.showModal();
document.getElementById('delCancel').onclick=()=>modal.close();
document.getElementById('delConfirm').onclick=()=>modal.close();
modal.addEventListener('click',e=>{ if(e.target===modal) modal.close(); });
