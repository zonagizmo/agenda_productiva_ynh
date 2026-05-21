// ── i18n ─────────────────────────────────────────────────
const LANG = {
  es: {
    appTitle: "Agenda Productiva",
    tabAgenda: "📅 Agenda", tabHistorial: "📚 Historial", tabConfig: "⚙️ Config",
    today: "📍 Hoy", past: "📁 Pasado", upcoming: "📅 Próximo",
    planAt: "Plan a las",
    sections: [
      { key:"objetivos", label:"Objetivos", icon:"🎯", placeholder:"Añadir objetivo..." },
      { key:"tareas",    label:"Tareas",    icon:"✅", placeholder:"Añadir tarea..." },
      { key:"reuniones", label:"Reuniones", icon:"🗓️", placeholder:"Añadir reunión..." },
      { key:"plazos",    label:"Plazos",    icon:"⏰", placeholder:"Añadir plazo..." },
    ],
    addBtn: "+ Añadir", genBtn: "⚡ Generar plan del día", generating: "Generando...",
    planTitle: "🚀 Plan del día", regen: "↺ Regenerar", delPlan: "✕ Borrar",
    histTitle: "📚 Historial",
    histEmpty: "Aún no hay días planificados.", histStart: "✏️ Empezar",
    histOpen: "Abrir →",
    configTitle: "⚙️ Configuración", configSub: "Define tu jornada laboral.",
    jornadaSection: "🕐 Horario de jornada",
    jornadaStart: "Inicio de jornada", jornadaEnd: "Fin de jornada",
    pausaSection: "🍽️ Pausa para comer",
    pausaToggle: "Incluir pausa para comer", yes: "Sí", no: "No",
    pausaStart: "Inicio pausa", pausaEnd: "Fin pausa",
    diasSection: "📅 Días laborables",
    dias: ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"],
    notasSection: "📝 Instrucciones adicionales",
    notasPlaceholder: "Ej: Prefiero reuniones por la mañana...",
    notasHint: "Se incluyen al generar cada plan.",
    summaryLabel: "Resumen: ",
    summaryJornada: "Jornada de",
    summaryTo: "a",
    summaryPausa: "pausa",
    summaryDias: "Días:",
    weekStartLabel: "Primer día de la semana",
    weekStartSun: "Domingo",
    weekStartMon: "Lunes",
    priors: [{key:"alta",label:"Alta",dot:"🔴"},{key:"media",label:"Media",dot:"🟡"},{key:"baja",label:"Baja",dot:"🟢"}],
    aviso: "Aviso:", addAviso: "+ Añadir aviso", fired: "✓ Enviado",
    notifGranted: "🔔 ON", notifDenied: "🔕", notifDefault: "🔔?",
    notifActivate: "Activar",
    notifBannerText: "Activa las notificaciones para recibir avisos.",
    notifDeniedText: "Notificaciones bloqueadas en el navegador.",
    notifStatusGranted: "✓ Notificaciones activas",
    notifStatusDenied: "🚫 Bloqueadas en el navegador",
    notifStatusDefault: "🔕 Notificaciones no activadas",
    upcoming_avisos: "Próximos", past_avisos: "Pasados",
    noAvisos: "Sin avisos configurados.", noAvisosHint: "Pulsa 🔔 en cualquier elemento.",
    calLegend: "🟢 Plan  🟡 Datos  🔴 Alta  🟠 Media  ● Baja",
    goToday: "📍 Ir a hoy",
    errNoContent: "Añade al menos un elemento antes de generar.",
    errNoResponse: "La IA no devolvió respuesta. Inténtalo de nuevo.",
    errConnect: "Error al conectar. Inténtalo de nuevo.",
  },
  en: {
    appTitle: "Productive Agenda",
    tabAgenda: "📅 Agenda", tabHistorial: "📚 History", tabConfig: "⚙️ Config",
    today: "📍 Today", past: "📁 Past", upcoming: "📅 Upcoming",
    planAt: "Plan at",
    sections: [
      { key:"objetivos", label:"Goals",     icon:"🎯", placeholder:"Add goal..." },
      { key:"tareas",    label:"Tasks",     icon:"✅", placeholder:"Add task..." },
      { key:"reuniones", label:"Meetings",  icon:"🗓️", placeholder:"Add meeting..." },
      { key:"plazos",    label:"Deadlines", icon:"⏰", placeholder:"Add deadline..." },
    ],
    addBtn: "+ Add", genBtn: "⚡ Generate day plan", generating: "Generating...",
    planTitle: "🚀 Day Plan", regen: "↺ Regenerate", delPlan: "✕ Delete",
    histTitle: "📚 History",
    histEmpty: "No days planned yet.", histStart: "✏️ Start",
    histOpen: "Open →",
    configTitle: "⚙️ Settings", configSub: "Define your work schedule.",
    jornadaSection: "🕐 Work hours",
    jornadaStart: "Start time", jornadaEnd: "End time",
    pausaSection: "🍽️ Lunch break",
    pausaToggle: "Include lunch break", yes: "Yes", no: "No",
    pausaStart: "Break start", pausaEnd: "Break end",
    diasSection: "📅 Work days",
    dias: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    notasSection: "📝 Additional instructions",
    notasPlaceholder: "E.g.: I prefer meetings in the morning...",
    notasHint: "Included when generating each plan.",
    summaryLabel: "Summary: ",
    summaryJornada: "Schedule from",
    summaryTo: "to",
    summaryPausa: "break",
    summaryDias: "Days:",
    weekStartLabel: "First day of week",
    weekStartSun: "Sunday",
    weekStartMon: "Monday",
    priors: [{key:"alta",label:"High",dot:"🔴"},{key:"media",label:"Med",dot:"🟡"},{key:"baja",label:"Low",dot:"🟢"}],
    aviso: "Alert:", addAviso: "+ Add alert", fired: "✓ Sent",
    notifGranted: "🔔 ON", notifDenied: "🔕", notifDefault: "🔔?",
    notifActivate: "Enable",
    notifBannerText: "Enable notifications to receive alerts.",
    notifDeniedText: "Notifications blocked in browser settings.",
    notifStatusGranted: "✓ Notifications active",
    notifStatusDenied: "🚫 Blocked in browser",
    notifStatusDefault: "🔕 Notifications not enabled",
    upcoming_avisos: "Upcoming", past_avisos: "Past",
    noAvisos: "No alerts configured.", noAvisosHint: "Press 🔔 on any item.",
    calLegend: "🟢 Plan  🟡 Data  🔴 High  🟠 Med  ● Low",
    goToday: "📍 Go to today",
    errNoContent: "Add at least one item before generating.",
    errNoResponse: "AI returned no response. Try again.",
    errConnect: "Connection error. Try again.",
  }
};

// ── State ─────────────────────────────────────────────────
let lang        = "es";
let agenda      = {};
let config      = defaultConfig();
let selDate     = todayKey();
let curTab      = "agenda";
let sideTab     = "cal";
let sideOpen    = true;
let calCursor   = { y: new Date().getFullYear(), m: new Date().getMonth() };
let generating  = false;
let openAvisos  = {};   // itemId -> boolean
let firedSet    = new Set();
let notifInterval = null;

// ── Helpers ───────────────────────────────────────────────
function todayKey() { return new Date().toISOString().slice(0,10); }
function isToday(k) { return k === todayKey(); }
function isPast(k)  { return k < todayKey(); }
function uid()      { return Math.random().toString(36).slice(2,9); }
function newItem(t=""){ return { id:uid(), texto:t, avisos:[] }; }
function newAviso() { return { id:uid(), texto:"", fecha:todayKey(), hora:"09:00", prioridad:"media", fired:false }; }

function defaultConfig() {
  return { jornadaInicio:"09:00", jornadaFin:"18:00", pausaComida:true,
    pausaInicio:"14:00", pausaFin:"15:00", diasLaborables:[1,2,3,4,5], notas:"",
    iaProvider:"groq", iaApiKey:"", iaModel:"", weekStart:1 };
}
function emptyDay() {
  return { objetivos:[newItem()], tareas:[newItem()], reuniones:[newItem()], plazos:[newItem()], plan:null, generatedAt:null };
}
function migrateDay(d) {
  if (!d) return emptyDay();
  const out = { plan:d.plan||null, generatedAt:d.generatedAt||null };
  ["objetivos","tareas","reuniones","plazos"].forEach(k => {
    const raw = d[k];
    if (!raw || !raw.length) { out[k]=[newItem()]; return; }
    out[k] = raw.map(x => typeof x==="string" ? newItem(x) : (x.id ? x : {...newItem(x.texto||""),...x}));
  });
  return out;
}
function getDay(k) { return agenda[k] || emptyDay(); }
function fmtLong(k) {
  return new Date(k+"T12:00:00").toLocaleDateString(lang==="es"?"es-ES":"en-US",
    { weekday:"long", day:"numeric", month:"long", year:"numeric" });
}
function fmtShort(k) {
  return new Date(k+"T12:00:00").toLocaleDateString(lang==="es"?"es-ES":"en-US",
    { day:"2-digit", month:"short" });
}
function t() { return LANG[lang]; }

function dayAvisoColor(d) {
  if (!d) return null;
  const all = [];
  ["objetivos","tareas","reuniones","plazos"].forEach(s =>
    (d[s]||[]).forEach(item => (item.avisos||[]).forEach(av => { if(av.texto) all.push(av.prioridad); }))
  );
  if (!all.length) return null;
  if (all.includes("alta"))  return "#ff6b6b";
  if (all.includes("media")) return "#ff9f43";
  return "#6bcb77";
}

function collectAvisos() {
  const list = [];
  const secs = t().sections;
  Object.entries(agenda).forEach(([dk, day]) => {
    secs.forEach(sec => {
      (day[sec.key]||[]).forEach(item => {
        (item.avisos||[]).forEach(av => {
          if (!av.texto) return;
          const dt = new Date(`${av.fecha}T${av.hora}:00`);
          list.push({...av, itemTexto:item.texto, secLabel:sec.label, secIcon:sec.icon, dateKey:dk, dt});
        });
      });
    });
  });
  return list.sort((a,b) => a.dt-b.dt);
}

// ── Storage API calls ─────────────────────────────────────
async function storageGet(key) {
  try {
    const r = await fetch(`./api/storage/${key}`);
    const d = await r.json();
    return d.value ? JSON.parse(d.value) : null;
  } catch { return null; }
}
async function storageSet(key, val) {
  try {
    await fetch(`./api/storage/${key}`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ value: JSON.stringify(val) })
    });
  } catch {}
}

async function loadAll() {
  const raw = await storageGet("agenda-v3");
  if (raw) {
    Object.entries(raw).forEach(([k,v]) => { agenda[k] = migrateDay(v); });
  }
  const cfg = await storageGet("config-v1");
  if (cfg) config = { ...defaultConfig(), ...cfg };
}
async function saveAgendaRemote() { await storageSet("agenda-v3", agenda); }
async function saveConfigRemote() { await storageSet("config-v1", config); }

// ── Notifications ─────────────────────────────────────────
function notifPerm() {
  return typeof Notification !== "undefined" ? Notification.permission : "unsupported";
}
async function requestNotifPerm() {
  if (typeof Notification === "undefined") return;
  await Notification.requestPermission();
  render();
}
function startNotifChecker() {
  if (notifInterval) clearInterval(notifInterval);
  notifInterval = setInterval(checkAvisos, 30000);
}
function checkAvisos() {
  if (notifPerm() !== "granted") return;
  const now = new Date();
  const win = 2*60*1000;
  let dirty = false;
  Object.values(agenda).forEach(day => {
    ["objetivos","tareas","reuniones","plazos"].forEach(sec => {
      (day[sec]||[]).forEach(item => {
        (item.avisos||[]).forEach(av => {
          if (!av.texto || av.fired) return;
          const dt = new Date(`${av.fecha}T${av.hora}:00`);
          const diff = now - dt;
          if (diff >= 0 && diff < win && !firedSet.has(av.id)) {
            firedSet.add(av.id);
            const secs = t().sections;
            const sec = secs.find(s => day[s.key] && day[s.key].some(i => i.id===item.id));
            const dot = t().priors.find(p=>p.key===av.prioridad)?.dot||"🔔";
            try {
              new Notification(`${dot} ${sec?.icon||""} ${sec?.label||""} — ${t().aviso}`, {
                body: `${av.texto}${item.texto ? "\n📌 "+item.texto : ""}`,
                tag: av.id,
              });
            } catch {}
            av.fired = true;
            dirty = true;
          }
        });
      });
    });
  });
  if (dirty) { saveAgendaRemote(); renderPlanSection(); }
}

// ── Render helpers ────────────────────────────────────────
function el(id) { return document.getElementById(id); }
function ce(tag, cls, html="") {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

function renderPlanText(text, container) {
  container.innerHTML = "";
  const div = ce("div","plan-text");
  text.split("\n").forEach(line => {
    const cl = line.replace(/\*\*/g,"");
    let p;
    if (/^#{1,3}\s/.test(line)) {
      p = ce("h3"); p.textContent = cl.replace(/^#+\s/,"");
    } else if (/^\*\*.*\*\*$/.test(line.trim())) {
      p = ce("p","p-bold"); p.textContent = cl;
    } else if (/^[-•]\s/.test(line)) {
      p = ce("p","p-bull"); p.textContent = "• "+cl.replace(/^[-•]\s/,"");
    } else if (/🔴|🟡|🟢/.test(line)) {
      p = ce("p","p-prio"); p.textContent = cl;
    } else if (/^\d+\.\s/.test(line)) {
      p = ce("p","p-num"); p.textContent = cl;
    } else if (!line.trim()) {
      p = ce("div"); p.style.height="0.4rem";
    } else {
      p = ce("p","p-norm"); p.textContent = cl;
    }
    div.appendChild(p);
  });
  container.appendChild(div);
}

// ── Mini Calendar ─────────────────────────────────────────
function renderCalendar(container) {
  const { y, m } = calCursor;
  const ws = config.weekStart || 0; // 0=Sun, 1=Mon
  const rawFirst = new Date(y,m,1).getDay();
  const firstDay = (rawFirst - ws + 7) % 7;
  const daysInMonth = new Date(y,m+1,0).getDate();
  const monthName = new Date(y,m,1).toLocaleDateString(lang==="es"?"es-ES":"en-US",{month:"long",year:"numeric"});

  let html = `<div class="mini-cal">
    <div class="cal-header">
      <button class="cal-nav" id="cal-prev">‹</button>
      <span class="cal-month" style="text-transform:capitalize">${monthName}</span>
      <button class="cal-nav" id="cal-next">›</button>
    </div>
    <div class="cal-grid">`;

  const dowAll = lang==="es" ? ["D","L","M","X","J","V","S"] : ["S","M","T","W","T","F","S"];
  const dow = [...dowAll.slice(ws), ...dowAll.slice(0,ws)];
  dow.forEach(d => { html += `<div class="cal-dow">${d}</div>`; });
  for (let i=0;i<firstDay;i++) html += `<div></div>`;
  for (let d=1;d<=daysInMonth;d++) {
    const k = `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const cls = ["cal-day", isToday(k)?"today":"", k===selDate?"sel":""].join(" ").trim();
    const hasPlan = agenda[k]?.plan;
    const hasData = agenda[k] && !hasPlan;
    const aClr   = dayAvisoColor(agenda[k]);
    let dots = "";
    if (hasPlan)            dots += `<span class="cal-dot" style="background:${k===selDate?"#fff":"#6bcb77"}"></span>`;
    if (hasData && !hasPlan)dots += `<span class="cal-dot" style="background:#ffd93d"></span>`;
    if (aClr)               dots += `<span class="cal-dot" style="background:${k===selDate?"#fff":aClr}"></span>`;
    html += `<button class="cal-day ${isToday(k)?"today":""} ${k===selDate?"sel":""}" data-calday="${k}">
      ${d}${dots?`<span class="cal-dots">${dots}</span>`:""}
    </button>`;
  }
  html += `</div><div class="cal-legend">${t().calLegend}</div></div>`;
  container.innerHTML = html;
  container.querySelector("#cal-prev").onclick = () => {
    const d = new Date(calCursor.y, calCursor.m-1);
    calCursor = {y:d.getFullYear(), m:d.getMonth()};
    renderSidebar();
  };
  container.querySelector("#cal-next").onclick = () => {
    const d = new Date(calCursor.y, calCursor.m+1);
    calCursor = {y:d.getFullYear(), m:d.getMonth()};
    renderSidebar();
  };
  container.querySelectorAll("[data-calday]").forEach(btn => {
    btn.onclick = () => { selDate = btn.dataset.calday; render(); };
  });
}

// ── Aviso editor ──────────────────────────────────────────
function renderAvisoEditor(av, color, onUpdate, onDelete, container) {
  const div = ce("div","aviso-editor fade");
  div.style.borderColor = color+"44";
  const priorBtns = t().priors.map(p =>
    `<button class="prior-btn${av.prioridad===p.key?" active":""}" data-p="${p.key}" style="${av.prioridad===p.key?`background:${getPriorColor(p.key)}33;border-color:${getPriorColor(p.key)};color:${getPriorColor(p.key)}`:""}">
      ${p.dot} ${p.label}
    </button>`
  ).join("");
  div.innerHTML = `
    <div class="aviso-row1">
      <span class="aviso-label">${t().aviso}</span>
      <input class="aviso-text" placeholder="..." value="${esc(av.texto)}" style="--fc:${color}">
      <button class="aviso-del">✕</button>
    </div>
    <div class="aviso-row2">
      <span style="font-size:.7rem;color:var(--muted)">📅</span>
      <input type="date" class="aviso-date" value="${av.fecha}">
      <span style="font-size:.7rem;color:var(--muted)">🕐</span>
      <input type="time" class="aviso-time" value="${av.hora}">
      <div class="prior-btns">${priorBtns}</div>
      ${av.fired?`<span class="fired-badge">${t().fired}</span>`:""}
    </div>`;
  div.querySelector(".aviso-text").oninput = e => onUpdate({...av, texto:e.target.value, fired:false});
  div.querySelector(".aviso-text").onfocus = e => e.target.style.borderColor=color;
  div.querySelector(".aviso-text").onblur  = e => e.target.style.borderColor="var(--border)";
  div.querySelector(".aviso-date").onchange = e => onUpdate({...av, fecha:e.target.value, fired:false});
  div.querySelector(".aviso-time").onchange = e => onUpdate({...av, hora:e.target.value, fired:false});
  div.querySelector(".aviso-del").onclick = onDelete;
  div.querySelectorAll(".prior-btn").forEach(b => {
    b.onclick = () => onUpdate({...av, prioridad:b.dataset.p});
  });
  container.appendChild(div);
}

function getPriorColor(p) {
  return p==="alta"?"#ff6b6b" : p==="media"?"#ff9f43" : "#6bcb77";
}
function esc(s) { return (s||"").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }

// ── Item row ──────────────────────────────────────────────
function renderItemRow(item, sec, dayKey, secKey, idx, totalItems, container) {
  const color = sec.color || "#4d96ff";
  const hasAvisos = item.avisos && item.avisos.length > 0;
  const isOpen = openAvisos[item.id];

  const row = ce("div","item-row fade");
  const main = ce("div","item-main");

  // dot
  const dot = ce("span","item-dot");
  dot.style.color = color; dot.textContent = "•";

  // input
  const inp = ce("input","item-input");
  inp.type="text"; inp.value=item.texto; inp.placeholder=sec.placeholder;
  inp.oninput = e => {
    item.texto = e.target.value;
    agenda[dayKey] = agenda[dayKey] || emptyDay();
    saveAgendaRemote();
    renderSidebarRecent();
  };
  inp.onfocus = () => inp.style.borderColor=color;
  inp.onblur  = () => inp.style.borderColor="var(--border)";

  // bell btn
  const bell = ce("button","item-bell"+(hasAvisos?" has-avisos":""));
  bell.innerHTML = `🔔${hasAvisos?`<span class="bell-badge">${item.avisos.length}</span>`:""}`;
  bell.title = hasAvisos ? `${item.avisos.length} aviso(s)` : t().addAviso;
  bell.onclick = () => {
    if (!isOpen && !hasAvisos) {
      item.avisos = [newAviso()];
      saveAgendaRemote();
    }
    openAvisos[item.id] = !isOpen;
    renderAgendaMain();
  };

  main.append(dot, inp, bell);

  // delete btn
  if (totalItems > 1) {
    const del = ce("button","item-del"); del.textContent="✕";
    del.onclick = () => {
      const day = agenda[dayKey] || emptyDay();
      day[secKey] = day[secKey].filter((_,i)=>i!==idx);
      if (!day[secKey].length) day[secKey]=[newItem()];
      saveAgendaRemote(); renderAgendaMain();
    };
    main.appendChild(del);
  }
  row.appendChild(main);

  // chips (closed)
  if (!isOpen && hasAvisos) {
    const chips = ce("div","aviso-chips");
    item.avisos.forEach(av => {
      const c = getPriorColor(av.prioridad);
      const chip = ce("span","aviso-chip");
      chip.style.cssText = `background:${c}22;border-color:${c}55;color:${c}`;
      chip.textContent = `${av.fired?"✓":"🔔"} ${av.fecha} ${av.hora}${av.texto?" · "+av.texto.slice(0,18)+(av.texto.length>18?"…":""):""}`;
      chip.onclick = () => { openAvisos[item.id]=true; renderAgendaMain(); };
      chips.appendChild(chip);
    });
    row.appendChild(chips);
  }

  // aviso panel (open)
  if (isOpen) {
    const panel = ce("div","avisos-panel");
    (item.avisos||[]).forEach((av,ai) => {
      renderAvisoEditor(av, color,
        updated => { item.avisos[ai]=updated; saveAgendaRemote(); renderAgendaMain(); },
        () => { item.avisos.splice(ai,1); if(!item.avisos.length) openAvisos[item.id]=false; saveAgendaRemote(); renderAgendaMain(); },
        panel
      );
    });
    const addBtn = ce("button","add-aviso-btn"); addBtn.textContent=t().addAviso;
    addBtn.onclick = () => { item.avisos.push(newAviso()); saveAgendaRemote(); renderAgendaMain(); };
    panel.appendChild(addBtn);
    row.appendChild(panel);
  }

  container.appendChild(row);
}

// ── Section block ─────────────────────────────────────────
function renderSection(sec, dayKey, container) {
  const day   = getDay(dayKey);
  const items = day[sec.key] || [newItem()];
  const color = sec.color || "#4d96ff";
  const count = items.filter(x=>x.texto).length;
  const avCnt = items.reduce((a,x)=>a+(x.avisos?.length||0),0);

  const block = ce("div","section-block");
  const hdr   = ce("div","section-header");
  const lbl   = ce("span","section-label");
  lbl.style.color=color;
  lbl.innerHTML = `${sec.icon} ${sec.label}
    <span class="section-badge" style="background:${color}22;border-color:${color}44;color:${color}">${count}</span>
    ${avCnt>0?`<span class="section-badge" style="background:#ff9f4322;border-color:#ff9f4355;color:#ff9f43">🔔 ${avCnt}</span>`:""}`;
  const addBtn = ce("button","section-add");
  addBtn.style.cssText=`background:${color}22;border-color:${color}55;color:${color}`;
  addBtn.textContent = t().addBtn;
  addBtn.onclick = () => {
    const d = agenda[dayKey] || emptyDay();
    d[sec.key].push(newItem());
    agenda[dayKey] = d;
    saveAgendaRemote(); renderAgendaMain();
  };
  hdr.append(lbl, addBtn);
  block.appendChild(hdr);

  items.forEach((item,i) => renderItemRow(item, sec, dayKey, sec.key, i, items.length, block));
  container.appendChild(block);
}

// ── Agenda main panel ─────────────────────────────────────
function renderAgendaMain() {
  const panel = el("main-panel");
  panel.innerHTML="";
  const inner = ce("div","main-inner fade");

  // Notif banner
  const perm = notifPerm();
  if (perm==="default") {
    const b = ce("div","notif-banner warn");
    b.innerHTML=`<span>${t().notifBannerText}</span>
      <button class="notif-activate">${t().notifActivate}</button>`;
    b.querySelector(".notif-activate").onclick = requestNotifPerm;
    inner.appendChild(b);
  } else if (perm==="denied") {
    const b = ce("div","notif-banner error"); b.textContent="🔕 "+t().notifDeniedText;
    inner.appendChild(b);
  }

  // Date header
  const hdr = ce("div","date-header");
  const dayInfo = ce("div");
  const title = ce("div","date-title"); title.textContent=fmtLong(selDate);
  const day   = getDay(selDate);
  const sub   = ce("div","date-sub");
  sub.textContent=(isToday(selDate)?t().today:isPast(selDate)?t().past:t().upcoming)
    +(day.generatedAt?` · ${t().planAt} ${new Date(day.generatedAt).toLocaleTimeString(lang==="es"?"es-ES":"en-US",{hour:"2-digit",minute:"2-digit"})}` : "");
  dayInfo.append(title,sub);

  const nav = ce("div","day-nav");
  const prev=ce("button","day-nav-btn"); prev.textContent="‹";
  prev.onclick=()=>{ const d=new Date(selDate+"T12:00:00"); d.setDate(d.getDate()-1); selDate=d.toISOString().slice(0,10); render(); };
  const next=ce("button","day-nav-btn"); next.textContent="›";
  next.onclick=()=>{ const d=new Date(selDate+"T12:00:00"); d.setDate(d.getDate()+1); selDate=d.toISOString().slice(0,10); render(); };
  nav.append(prev,next);
  hdr.append(dayInfo,nav);
  inner.appendChild(hdr);

  // Sections card
  const card = ce("div","sections-card");
  t().sections.forEach(sec => renderSection(sec, selDate, card));
  inner.appendChild(card);

  // Error
  const errDiv = ce("div","error-banner"); errDiv.id="error-banner"; errDiv.style.display="none";
  inner.appendChild(errDiv);

  // Generate button
  if (!day.plan) {
    const genBtn = ce("button","gen-btn"); genBtn.id="gen-btn";
    genBtn.disabled = generating;
    genBtn.innerHTML = generating
      ? `<div class="spinner"></div>${t().generating}`
      : t().genBtn;
    genBtn.onclick = generatePlan;
    inner.appendChild(genBtn);
  }

  // Plan card
  if (day.plan) {
    const pc = ce("div","plan-card fade");
    const ph = ce("div","plan-header");
    const pt = ce("span","plan-title"); pt.textContent=t().planTitle;
    const pb = ce("div","plan-btns");
    const regen=ce("button","plan-btn-regen"); regen.textContent=t().regen;
    regen.onclick=generatePlan;
    const del=ce("button","plan-btn-del"); del.textContent=t().delPlan;
    del.onclick=()=>{
      const d=agenda[selDate]||emptyDay();
      d.plan=null; d.generatedAt=null;
      agenda[selDate]=d; saveAgendaRemote(); renderAgendaMain();
    };
    pb.append(regen,del); ph.append(pt,pb); pc.appendChild(ph);
    const planBody=ce("div"); renderPlanText(day.plan, planBody);
    pc.appendChild(planBody);
    inner.appendChild(pc);
  }

  panel.appendChild(inner);
}

// ── Generate plan ─────────────────────────────────────────
async function callAiDirect(prompt) {
  const provRes   = await fetch("./api/providers");
  const providers = await provRes.json();
  const provider  = config.iaProvider || "groq";
  const apiKey    = config.iaApiKey   || "";
  const prov      = providers[provider];
  if (!prov) throw new Error("Unknown provider: " + provider);
  const model  = config.iaModel || prov.default_model;
  const url    = prov.url;
  const mode   = prov.mode;
  const body   = JSON.stringify({ model, max_tokens: 1024, messages: [{ role: "user", content: prompt }] });
  const headers = mode === "anthropic"
    ? { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" }
    : { "Content-Type": "application/json", "Authorization": "Bearer " + apiKey };
  const r = await fetch(url, { method: "POST", headers, body });
  if (!r.ok) {
    let detail = "";
    try { const j = await r.json(); detail = j?.error?.message || j?.message || ""; }
    catch { detail = await r.text().catch(() => ""); detail = detail.slice(0, 120); }
    const es = lang === "es";
    if (r.status === 429) throw new Error(es ? "Límite de peticiones alcanzado. Espera unos segundos e inténtalo de nuevo." : "Rate limit reached. Wait a moment and try again.");
    if (r.status === 401 || r.status === 403) throw new Error(es ? "API key inválida o sin permisos." : "Invalid API key or insufficient permissions.");
    throw new Error("HTTP " + r.status + (detail ? ": " + detail : ""));
  }
  const data = await r.json();
  return mode === "anthropic" ? data.content[0].text : data.choices[0].message.content;
}

async function generatePlan() {
  if (generating) return;
  const day  = getDay(selDate);
  const secs = t().sections;
  if (!secs.some(s => (day[s.key]||[]).some(x=>x.texto.trim()))) { showError(t().errNoContent); return; }
  if (!config.iaApiKey) { showError(lang==="es"?"API key no configurada. Ve a ⚙️ Config.":"API key not set. Go to ⚙️ Config."); return; }

  generating=true; renderAgendaMain();

  const body = { lang, fecha_larga:fmtLong(selDate), jornada_inicio:config.jornadaInicio,
    jornada_fin:config.jornadaFin, pausa_comida:config.pausaComida,
    pausa_inicio:config.pausaInicio, pausa_fin:config.pausaFin, notas_extra:config.notas };
  secs.forEach(s => { body[s.key] = (day[s.key]||[]).map(x=>({texto:x.texto,avisos:x.avisos||[]})); });

  try {
    const pr = await fetch("./api/build-prompt",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) });
    const pd = await pr.json();
    if (pd.error) { showError(pd.error==="no_content"?t().errNoContent:pd.error); return; }
    const planText = await callAiDirect(pd.prompt);
    if (!planText) { showError(t().errNoResponse); return; }
    agenda[selDate] = agenda[selDate] || emptyDay();
    agenda[selDate].plan = planText;
    agenda[selDate].generatedAt = new Date().toISOString();
    await saveAgendaRemote();
  } catch(e) { showError(e.message || t().errConnect); }
  finally { generating=false; renderAgendaMain(); }
}
function showError(msg) {
  const b=el("error-banner");
  if(b){ b.textContent="⚠️ "+msg; b.style.display="block"; }
}

// ── Sidebar ───────────────────────────────────────────────
function renderSidebarRecent() {
  const rc = el("sidebar-recent");
  if (!rc) return;
  rc.innerHTML="";
  const histDays = Object.keys(agenda)
    .filter(k=>agenda[k]?.plan||t().sections.some(s=>(agenda[k]?.[s.key]||[]).some(x=>x.texto)))
    .sort((a,b)=>b.localeCompare(a)).slice(0,6);
  histDays.forEach(k=>{
    const btn=ce("button","recent-day"+(k===selDate?" sel":""));
    const aClr=dayAvisoColor(agenda[k]);
    btn.innerHTML=`<span style="text-transform:capitalize">${fmtShort(k)}${isToday(k)?" · "+(lang==="es"?"hoy":"today"):""}</span>
      <span class="recent-dots">
        ${agenda[k]?.plan?`<span class="rdot" style="background:#6bcb77"></span>`:""}
        ${aClr?`<span class="rdot" style="background:${aClr}"></span>`:""}
      </span>`;
    btn.onclick=()=>{ selDate=k; render(); };
    rc.appendChild(btn);
  });
}

function renderAvisosPanel(container) {
  const perm=notifPerm();
  let html=`<div class="notif-status" style="background:${perm==="granted"?"#6bcb7718":"#ff9f4318"};border:1px solid ${perm==="granted"?"#6bcb7744":"#ff9f4344"}">`;
  if (perm==="granted") {
    html+=`<span style="color:#6bcb77;font-size:.7rem">${t().notifStatusGranted}</span>`;
  } else if (perm==="denied") {
    html+=`<span style="color:#ff6b6b;font-size:.7rem">${t().notifStatusDenied}</span>`;
  } else {
    html+=`<div style="display:flex;justify-content:space-between;align-items:center">
      <span style="color:#ff9f43;font-size:.72rem">${t().notifStatusDefault}</span>
      <button class="notif-activate" id="notif-act-side" style="margin-left:.4rem">${t().notifActivate}</button>
    </div>`;
  }
  html+=`</div>`;
  container.innerHTML=html;
  const btn=container.querySelector("#notif-act-side");
  if(btn) btn.onclick=requestNotifPerm;

  const all=collectAvisos();
  const now=new Date();
  const upcoming=all.filter(a=>a.dt>=now);
  const past=all.filter(a=>a.dt<now);

  if (!all.length) {
    const empty=ce("div","");
    empty.style.cssText="text-align:center;padding:1.5rem .5rem;color:var(--muted)";
    empty.innerHTML=`<p style="font-size:1.4rem">🔕</p><p style="font-size:.8rem">${t().noAvisos}</p><p style="font-size:.72rem">${t().noAvisosHint}</p>`;
    container.appendChild(empty);
    return;
  }

  const renderGroup=(list,label,dim)=>{
    if(!list.length) return;
    const lbl=ce("p",""); lbl.style.cssText="font-size:.68rem;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin:.5rem 0 .3rem";
    lbl.textContent=`${label} (${list.length})`;
    container.appendChild(lbl);
    list.forEach(av=>{
      const pc=getPriorColor(av.prioridad);
      const card=ce("div","aviso-card"+(dim?" dim":""));
      card.style.cssText=`background:${dim?"var(--bg)":"var(--card)"};border-color:${dim?"var(--border)":pc+"44"};border-left-color:${dim?"var(--faint)":pc}`;
      card.innerHTML=`<div class="aviso-card-title">${esc(av.texto)}</div>
        <div class="aviso-card-sub">${av.secIcon} ${av.secLabel}${av.itemTexto?" · "+av.itemTexto.slice(0,28)+(av.itemTexto.length>28?"…":""):""}</div>
        <div class="aviso-card-time">📅 ${av.fecha} 🕐 ${av.hora}${av.fired?" · <span style='color:#6bcb77'>✓</span>":""}</div>`;
      card.onclick=()=>{ selDate=av.dateKey; sideTab="cal"; render(); };
      container.appendChild(card);
    });
  };
  renderGroup(upcoming, t().upcoming_avisos, false);
  renderGroup(past, t().past_avisos, true);
}

function renderSidebar() {
  const sidebar=el("sidebar");
  if(!sidebar) return;
  sidebar.className="";
  if(!sideOpen){sidebar.className="hidden";return;}

  const stabs=el("sidebar-tabs");
  const allAv=collectAvisos().filter(a=>a.dt>=new Date()).length;
  stabs.innerHTML=`
    <button class="sidebar-tab${sideTab==="cal"?" active":""}" data-st="cal">📅 ${lang==="es"?"Cal":"Cal"}</button>
    <button class="sidebar-tab${sideTab==="avisos"?" active":""}" data-st="avisos">🔔${allAv>0?" "+allAv:""}</button>`;
  stabs.querySelectorAll("[data-st]").forEach(b=>{
    b.onclick=()=>{ sideTab=b.dataset.st; renderSidebar(); };
  });

  const sc=el("sidebar-content"); sc.innerHTML="";

  if(sideTab==="cal"){
    const calDiv=ce("div"); renderCalendar(calDiv); sc.appendChild(calDiv);
    const todayBtn=ce("button","goto-today"); todayBtn.textContent=t().goToday;
    todayBtn.onclick=()=>{ selDate=todayKey(); render(); };
    sc.appendChild(todayBtn);
    const recentDiv=ce("div"); recentDiv.id="sidebar-recent"; sc.appendChild(recentDiv);
    renderSidebarRecent();
  } else {
    const ap=ce("div"); ap.style.display="flex;flex-direction:column;gap:.5rem";
    renderAvisosPanel(ap); sc.appendChild(ap);
  }
}

// ── Historial ─────────────────────────────────────────────
function renderHistorial() {
  const view=el("historial-view");
  view.innerHTML=`<h2 class="hist-title">${t().histTitle}</h2>`;
  const secs=t().sections;
  const histDays=Object.keys(agenda)
    .filter(k=>agenda[k]?.plan||secs.some(s=>(agenda[k]?.[s.key]||[]).some(x=>x.texto)))
    .sort((a,b)=>b.localeCompare(a));

  if(!histDays.length){
    const empty=ce("div","hist-empty");
    empty.innerHTML=`<p style="font-size:2rem">📭</p><p>${t().histEmpty}</p>
      <button class="gen-btn" style="width:auto;padding:.65rem 1.4rem;margin-top:.8rem" id="hist-start">${t().histStart}</button>`;
    empty.querySelector("#hist-start").onclick=()=>{curTab="agenda";render();};
    view.appendChild(empty); return;
  }

  const colors=["#4d96ff","#c77dff","#6bcb77","#ffd93d","#ff6b6b"];
  histDays.forEach((k,idx)=>{
    const d=agenda[k];
    const total=secs.reduce((a,s)=>a+(d[s.key]?.filter(x=>x.texto).length||0),0);
    const avCnt=secs.reduce((a,s)=>a+(d[s.key]?.reduce((b,x)=>b+(x.avisos?.length||0),0)||0),0);
    const aClr=dayAvisoColor(d);
    const card=ce("div","hist-card fade");
    card.style.borderLeft=`4px solid ${colors[idx%5]}`;
    const info=ce("div"); info.style.flex="1";
    const dateEl=ce("div","hist-date");
    dateEl.innerHTML=`${fmtLong(k)}
      ${isToday(k)?`<span class="badge today">${lang==="es"?"Hoy":"Today"}</span>`:""}
      ${aClr?`<span class="aviso-prio-dot" style="background:${aClr}" title="Avisos"></span>`:""}`;
    const meta=ce("div","hist-meta");
    meta.innerHTML=`${total} ${lang==="es"?"elemento":"item"}${total!==1?"s":""}
      ${secs.map(s=>{ const n=d[s.key]?.filter(x=>x.texto).length; return n?` · ${s.icon} ${n}`:""; }).join("")}`;
    const badges=ce("div","hist-badges");
    if(d.plan) badges.innerHTML+=`<span class="badge plan">✓ Plan</span>`;
    if(avCnt>0) badges.innerHTML+=`<span class="badge avisos">🔔 ${avCnt}</span>`;
    info.append(dateEl,meta,badges);
    const acts=ce("div","hist-actions");
    const openBtn=ce("button","hist-open"); openBtn.textContent=t().histOpen;
    openBtn.onclick=()=>{ selDate=k; curTab="agenda"; render(); };
    const delBtn=ce("button","hist-del"); delBtn.textContent="🗑️";
    delBtn.onclick=()=>{ delete agenda[k]; saveAgendaRemote(); renderHistorial(); };
    acts.append(openBtn,delBtn);
    card.append(info,acts);
    view.appendChild(card);
  });
}

// ── Config ────────────────────────────────────────────────
function renderConfig() {
  const view=el("config-view");
  const T=t();
  const dias=T.dias;

  providers = {}; // reset
  view.innerHTML=`
  <h2 class="config-title">${T.configTitle}</h2>
  <p class="config-sub">${T.configSub}</p>

  <div class="config-block">
    <p class="config-section-title" style="color:#4d96ff">${T.jornadaSection}</p>
    <div class="config-row"><span class="config-row-label">${T.jornadaStart}</span>
      <input type="time" class="config-time" id="cfg-inicio" value="${config.jornadaInicio}"></div>
    <div class="config-row"><span class="config-row-label">${T.jornadaEnd}</span>
      <input type="time" class="config-time" id="cfg-fin" value="${config.jornadaFin}"></div>
  </div>

  <div class="config-block">
    <p class="config-section-title" style="color:#ffd93d">${T.pausaSection}</p>
    <div class="config-row"><span class="config-row-label">${T.pausaToggle}</span>
      <button class="toggle-btn ${config.pausaComida?"on":"off"}" id="cfg-pausa-toggle">
        ${config.pausaComida?T.yes:T.no}</button></div>
    <div id="pausa-rows" style="display:${config.pausaComida?"block":"none"}">
      <div class="config-row"><span class="config-row-label">${T.pausaStart}</span>
        <input type="time" class="config-time" id="cfg-pausa-inicio" value="${config.pausaInicio}"></div>
      <div class="config-row"><span class="config-row-label">${T.pausaEnd}</span>
        <input type="time" class="config-time" id="cfg-pausa-fin" value="${config.pausaFin}"></div>
    </div>
  </div>

  <div class="config-block">
    <p class="config-section-title" style="color:#c77dff">${T.diasSection}</p>
    <div class="days-grid">
      ${dias.map((d,i)=>`<button class="day-btn${config.diasLaborables.includes(i)?" active":""}" data-day="${i}">${d}</button>`).join("")}
    </div>
  </div>

  <div class="config-block">
    <p class="config-section-title" style="color:#4d96ff">${T.weekStartLabel}</p>
    <div style="display:flex;gap:.5rem;margin-top:.3rem">
      <button class="day-btn${config.weekStart===0?' active':''}" id="cfg-ws-0">${T.weekStartSun}</button>
      <button class="day-btn${config.weekStart===1?' active':''}" id="cfg-ws-1">${T.weekStartMon}</button>
    </div>
  </div>

  <div class="config-block">
    <p class="config-section-title" style="color:#ff9f43">${T.notasSection}</p>
    <textarea class="config-textarea" id="cfg-notas" rows="3" placeholder="${T.notasPlaceholder}">${esc(config.notas)}</textarea>
    <p class="config-hint">${T.notasHint}</p>
  </div>

  <div class="config-summary">
    <strong>${T.summaryLabel}</strong>
    ${T.summaryJornada} <strong>${config.jornadaInicio}</strong> ${T.summaryTo} <strong>${config.jornadaFin}</strong>
    ${config.pausaComida?`, ${T.summaryPausa} ${config.pausaInicio}–${config.pausaFin}`:""}. 
    ${T.summaryDias} <strong>${config.diasLaborables.map(d=>dias[d]).join(", ")}</strong>.
  </div>`;


  // IA section — loaded async
  const iaBlock = document.createElement('div');
  iaBlock.id = 'ia-config-block';
  iaBlock.className = 'config-block';
  iaBlock.innerHTML = '<p class="config-section-title" style="color:#c77dff">🤖 ' + (lang==='es'?'Inteligencia Artificial':'AI Provider') + '</p><p style="font-size:.8rem;color:var(--muted);margin:.3rem 0 .7rem">Cargando proveedores...</p>';
  view.appendChild(iaBlock);

  // Load providers and render IA block
  fetch('./api/providers').then(r=>r.json()).then(providers => {
    const pKey = config.iaProvider || 'groq';
    const prov = providers[pKey] || providers['groq'];
    const models = prov ? prov.models : [];
    const selModel = config.iaModel || (prov ? prov.default_model : '');

    const provOpts = Object.entries(providers).map(([k,p]) =>
      `<option value="${k}" ${k===pKey?'selected':''}>${p.name}${p.free?' ✓':''}  </option>`
    ).join('');
    const modelOpts = models.map(m =>
      `<option value="${m}" ${m===selModel?'selected':''}>${m}</option>`
    ).join('');
    const keyUrl = prov ? prov.key_url : '';
    const keyHint = prov ? prov.key_hint : '';

    iaBlock.innerHTML = `
      <p class="config-section-title" style="color:#c77dff">🤖 ${lang==='es'?'Inteligencia Artificial':'AI Provider'}</p>
      <div class="config-row">
        <span class="config-row-label">${lang==='es'?'Proveedor':'Provider'}</span>
        <select id="cfg-ia-provider" style="background:#0a0a1a;border:1px solid var(--border);border-radius:7px;color:var(--text);padding:4px 8px;font-size:.82rem;font-family:inherit">
          ${provOpts}
        </select>
      </div>
      <div class="config-row">
        <span class="config-row-label">${lang==='es'?'Modelo':'Model'}</span>
        <select id="cfg-ia-model" style="background:#0a0a1a;border:1px solid var(--border);border-radius:7px;color:var(--text);padding:4px 8px;font-size:.82rem;font-family:inherit;max-width:220px">
          ${modelOpts}
        </select>
      </div>
      <div class="config-row" style="flex-direction:column;align-items:flex-start;gap:.4rem">
        <span class="config-row-label">API Key <a href="${keyUrl}" target="_blank" style="color:var(--accent);font-size:.72rem;margin-left:.4rem">Obtener →</a></span>
        <div style="display:flex;gap:.4rem;width:100%">
          <input id="cfg-ia-key" type="password" placeholder="${keyHint}" value="${esc(config.iaApiKey||'')}"
            style="flex:1;background:#0a0a1a;border:1px solid var(--border);border-radius:7px;color:var(--text);padding:5px 8px;font-size:.82rem;font-family:inherit">
          <button id="cfg-ia-show" style="background:var(--faint);border:none;border-radius:7px;color:var(--muted);padding:5px 9px;font-size:.78rem">👁</button>
        </div>
      </div>
      <div style="margin-top:.6rem;display:flex;gap:.5rem;align-items:center">
        <button id="cfg-ia-test" style="background:#c77dff22;border:1px solid #c77dff55;color:#c77dff;border-radius:8px;padding:.35rem .9rem;font-size:.78rem;font-weight:600">${lang==='es'?'Probar conexión':'Test connection'}</button>
        <span id="cfg-ia-status" style="font-size:.75rem"></span>
      </div>
      <p style="font-size:.68rem;color:var(--muted);margin-top:.5rem">✓ = ${lang==='es'?'Gratis con cuenta':'Free with account'}</p>`;

    // Provider change → reload page section
    document.getElementById('cfg-ia-provider').onchange = e => {
      config.iaProvider = e.target.value;
      config.iaModel = '';
      saveConfigRemote(); renderConfig();
    };
    document.getElementById('cfg-ia-model').onchange = e => {
      config.iaModel = e.target.value; saveConfigRemote();
    };
    const keyInput = document.getElementById('cfg-ia-key');
    keyInput.oninput = e => { config.iaApiKey = e.target.value; saveConfigRemote(); };
    keyInput.onfocus = () => keyInput.style.borderColor='#c77dff';
    keyInput.onblur  = () => keyInput.style.borderColor='var(--border)';
    document.getElementById('cfg-ia-show').onclick = () => {
      keyInput.type = keyInput.type==='password'?'text':'password';
    };
    document.getElementById('cfg-ia-test').onclick = async () => {
      const st = document.getElementById('cfg-ia-status');
      st.style.color='var(--muted)'; st.textContent = lang==='es'?'Probando...':'Testing...';
      try {
        const result = await callAiDirect('Reply with just the word OK.');
        st.style.color='#6bcb77'; st.textContent='✓ OK: '+result.trim().slice(0,60);
      } catch(e) { st.style.color='#ff6b6b'; st.textContent='✗ '+e.message.slice(0,80); }
    };
  }).catch(()=>{ iaBlock.innerHTML += '<p style="color:#ff6b6b;font-size:.78rem">Error cargando proveedores</p>'; });

  el("cfg-inicio").onchange=e=>{config.jornadaInicio=e.target.value;saveConfigRemote();renderConfig();};
  el("cfg-fin").onchange=e=>{config.jornadaFin=e.target.value;saveConfigRemote();renderConfig();};
  el("cfg-pausa-toggle").onclick=()=>{config.pausaComida=!config.pausaComida;saveConfigRemote();renderConfig();};
  const pi=el("cfg-pausa-inicio"); if(pi) pi.onchange=e=>{config.pausaInicio=e.target.value;saveConfigRemote();};
  const pf=el("cfg-pausa-fin");   if(pf) pf.onchange=e=>{config.pausaFin=e.target.value;saveConfigRemote();};
  el("cfg-notas").oninput=e=>{config.notas=e.target.value;saveConfigRemote();};
  const ws0=el("cfg-ws-0"); if(ws0) ws0.onclick=()=>{ config.weekStart=0; saveConfigRemote(); renderConfig(); renderSidebar(); };
  const ws1=el("cfg-ws-1"); if(ws1) ws1.onclick=()=>{ config.weekStart=1; saveConfigRemote(); renderConfig(); renderSidebar(); };
  view.querySelectorAll(".day-btn").forEach(b=>{
    b.onclick=()=>{
      const d=parseInt(b.dataset.day);
      const idx=config.diasLaborables.indexOf(d);
      if(idx>-1) config.diasLaborables.splice(idx,1);
      else config.diasLaborables.push(d);
      config.diasLaborables.sort();
      saveConfigRemote(); renderConfig();
    };
  });
}

// ── Main render ───────────────────────────────────────────
function render() {
  // Update tab buttons
  document.querySelectorAll(".tab-btn").forEach(b=>{
    b.classList.toggle("active", b.dataset.tab===curTab);
  });

  // Update lang buttons
  document.querySelectorAll(".lang-btn").forEach(b=>{
    b.classList.toggle("active", b.dataset.lang===lang);
  });

  // Update title
  el("app-title").textContent = t().appTitle;

  // Update notif button
  const perm=notifPerm();
  const nb=el("notif-btn");
  nb.textContent=perm==="granted"?t().notifGranted:perm==="denied"?t().notifDenied:t().notifDefault;
  nb.className="notif-btn "+(perm==="granted"?"granted":perm==="denied"?"denied":"default");
  nb.onclick=perm==="default"?requestNotifPerm:null;

  // Show/hide views
  el("agenda-view").style.display  = curTab==="agenda"    ? "flex" : "none";
  el("historial-view").style.display= curTab==="historial" ? "block" : "none";
  el("config-view").style.display  = curTab==="config"    ? "block" : "none";

  if (curTab==="agenda")    { renderSidebar(); renderAgendaMain(); }
  if (curTab==="historial") renderHistorial();
  if (curTab==="config")    renderConfig();
}

function renderPlanSection() { if(curTab==="agenda") renderAgendaMain(); }

// ── Init ──────────────────────────────────────────────────
(async function init() {
  // Tab buttons
  document.querySelectorAll(".tab-btn").forEach(b=>{
    b.onclick=()=>{ curTab=b.dataset.tab; render(); };
  });
  // Menu
  el("menu-btn").onclick=()=>{ sideOpen=!sideOpen; render(); };
  // Lang
  document.querySelectorAll(".lang-btn").forEach(b=>{
    b.onclick=()=>{ lang=b.dataset.lang; render(); };
  });

  await loadAll();
  render();
  startNotifChecker();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {});
  }
})();
