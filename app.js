// ===== ユーティリティ =====
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

function fmtInTz(date, tz, opts = {}) {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: tz,
    month: "numeric", day: "numeric", weekday: "short",
    hour: "2-digit", minute: "2-digit",
    ...opts,
  }).format(date);
}
function clockInTz(tz) {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: tz, hour: "2-digit", minute: "2-digit" }).format(new Date());
}
function dateInTz(tz) {
  return new Intl.DateTimeFormat("ja-JP", { timeZone: tz, month: "numeric", day: "numeric", weekday: "short" }).format(new Date());
}
function stadiumById(id) { return STADIUMS.find(s => s.id === id); }
function mapsUrl(s) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.maps)}`; }
function officialSearchUrl(s) { return `https://www.google.com/search?q=${encodeURIComponent(s.known + " official site")}`; }
function esc(str) { return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

// ===== localStorage =====
const store = {
  get(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? fallback : v; }
    catch { return fallback; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
};

let myInfo = store.get("myInfo", {});
let checklistDone = store.get("checklistDone", {});
let simPicks = store.get("simPicks", { 0: null, 1: null, 2: null });
let rates = store.get("rates", { ...DEFAULT_RATES });
let ratesUpdatedAt = store.get("ratesUpdatedAt", null);

async function refreshRates() {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=JPY&to=USD,CAD,MXN");
    const data = await res.json();
    for (const cur of ["USD", "CAD", "MXN"]) {
      if (data.rates[cur]) rates[cur] = 1 / data.rates[cur];
    }
    ratesUpdatedAt = data.date;
    store.set("rates", rates);
    store.set("ratesUpdatedAt", ratesUpdatedAt);
    if (state.tab === "tip") render();
  } catch (_) { /* オフライン時は保存済みレートで続行 */ }
}

// ===== 状態 =====
const state = {
  tab: "today",
  stadiumFilter: "all",
  tip: { country: "us", scene: "restaurant", pct: 20, amount: "" },
  mode: null,
};

// ===== 共通パーツ =====
function nextMatch() {
  const now = new Date();
  return JAPAN_MATCHES.find(m => new Date(m.utc) > now) || null;
}

function countdownText(utc) {
  const diff = new Date(utc) - new Date();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const mi = Math.floor((diff % 3600000) / 60000);
  return `${d}日 ${h}時間 ${mi}分`;
}

function checklistProgress() {
  const done = CHECKLIST.filter(c => checklistDone[c.id]).length;
  return { done, total: CHECKLIST.length, pct: Math.round(done / CHECKLIST.length * 100) };
}

function myInfoDisplay(keys) {
  const rows = keys.map(k => {
    const f = MYINFO_FIELDS.find(f => f.key === k);
    const v = myInfo[k];
    return `<div class="k">${f.label}</div><div class="v ${v ? "" : "empty"}">${v ? esc(v) : "未登録（下の編集欄から保存できます）"}</div>`;
  }).join("");
  return `<div class="myinfo-display">${rows}</div>`;
}

function eventItems(events) {
  return events.map(ev => `
    <div class="ev-item">
      <div class="ev-name">${ev.icon} ${ev.name}</div>
      <div class="ev-meta">📍 ${ev.place}　🗓️ ${ev.period}</div>
      <div class="ev-note">${ev.note}</div>
      <a class="ev-link" href="${ev.url}" target="_blank" rel="noopener">最新情報を見る ↗</a>
    </div>`).join("");
}

function myInfoEditor(keys) {
  return keys.map(k => {
    const f = MYINFO_FIELDS.find(f => f.key === k);
    return `<div class="field"><label>${f.label}</label><input type="text" data-myinfo="${f.key}" placeholder="${f.placeholder}" value="${esc(myInfo[k] || "")}"></div>`;
  }).join("");
}

// ===== 今日タブ =====
function renderToday() {
  const next = nextMatch();
  const prog = checklistProgress();
  let html = "";

  if (next) {
    const st = stadiumById(next.stadiumId);
    const dt = new Date(next.utc);
    const cd = countdownText(next.utc);
    const isToday = new Intl.DateTimeFormat("ja-JP", { timeZone: st.tz, dateStyle: "short" }).format(dt) ===
                    new Intl.DateTimeFormat("ja-JP", { timeZone: st.tz, dateStyle: "short" }).format(new Date());
    html += `
      <div class="card countdown-card">
        <div class="label">${isToday ? "🔥 今日は試合日！キックオフまで" : "次の日本戦まで"}</div>
        <div class="matchup">${next.home} vs ${next.away}</div>
        <div class="timer">${cd}</div>
        <div class="venue-line">📍 ${st.known}（${st.city}）<br>現地 ${fmtInTz(dt, st.tz)} ／ 日本 ${fmtInTz(dt, "Asia/Tokyo")}</div>
      </div>`;

    html += `
      <div class="today-times">
        <div class="tbox"><div class="l">🏟️ 会場の現地時間</div><div class="v">${clockInTz(st.tz)}</div><div class="d">${dateInTz(st.tz)}</div></div>
        <div class="tbox"><div class="l">🇯🇵 日本時間</div><div class="v">${clockInTz("Asia/Tokyo")}</div><div class="d">${dateInTz("Asia/Tokyo")}</div></div>
      </div>`;

    // 今日やること
    const days = Math.floor((new Date(next.utc) - new Date()) / 86400000);
    let todos;
    if (isToday) {
      todos = ["🎒 出発前に「試合前モード」を開く", "🎫 会場に着いたら「入場前モード」", "🏨 帰りは「試合後帰宅モード」", "💧 水分・塩分をこまめに"];
    } else if (days <= 1) {
      todos = ["✅ チェックリストを全部済ませる", "🚌 会場への移動手段・所要時間を最終確認", "🏨 ホテル住所をこのアプリに保存", "🔋 モバイルバッテリーを充電"];
    } else {
      todos = [`📅 試合まであと${days + 1}日。チェックリストを進めよう`, "🎫 チケットアプリにログインできるか確認", "🤝 同行者と集合場所を決めておく"];
    }
    html += `<div class="card"><h3 style="font-size:1rem;margin-bottom:6px">📝 今日やること</h3><ul class="todo-list">${todos.map(t => `<li>${t}</li>`).join("")}</ul></div>`;
  } else {
    html += `<div class="card countdown-card"><div class="matchup">グループステージ全日程終了</div><div class="venue-line">ノックアウトの組み合わせは「日本代表」タブへ</div></div>`;
  }

  // 現地イベント（次の試合の都市）
  if (next) {
    const cityEvents = EVENTS.filter(ev => ev.cityIds.includes(next.stadiumId));
    if (cityEvents.length) {
      const st2 = stadiumById(next.stadiumId);
      html += `
        <div class="card">
          <h3 style="font-size:1rem;margin-bottom:4px">🎉 ${st2.city.split("（")[0].split(" (")[0]}の現地イベント</h3>
          ${eventItems(cityEvents)}
        </div>`;
    }
  }

  // チェックリスト進捗
  html += `
    <div class="card">
      <h3 style="font-size:1rem">✅ 試合当日チェックリスト</h3>
      <div class="progress-wrap"><div class="progress-bar" style="width:${prog.pct}%"></div></div>
      <div class="note">${prog.done} / ${prog.total} 完了${prog.done === prog.total ? " — 準備バッチリ！🎉" : ""}（リストは「遠征メモ」タブ）</div>
    </div>`;

  // いまのおすすめモード（試合日の時間帯で自動判定）
  const now2 = new Date();
  let recommended = null;
  const lastMatch = [...JAPAN_MATCHES].reverse().find(m => new Date(m.utc) <= now2);
  if (lastMatch && now2 - new Date(lastMatch.utc) < 6 * 3600000) {
    recommended = "gohome";
  } else if (next) {
    const st0 = stadiumById(next.stadiumId);
    const dt0 = new Date(next.utc);
    const sameDay = new Intl.DateTimeFormat("ja-JP", { timeZone: st0.tz, dateStyle: "short" }).format(dt0) ===
                    new Intl.DateTimeFormat("ja-JP", { timeZone: st0.tz, dateStyle: "short" }).format(now2);
    const diffH = (dt0 - now2) / 3600000;
    if (sameDay && diffH > 3) recommended = "prematch";
    else if (sameDay && diffH <= 3) recommended = "entry";
  }
  if (recommended) {
    const rm = MODES[recommended];
    html += `<button class="btn btn-primary" data-mode="${recommended}" style="font-size:1.15rem;padding:18px">${rm.icon} いまは「${rm.title}」 →</button>`;
  }

  // モード一覧（コンパクト）
  html += `
    <div class="section-title">🧭 行動モード</div>
    <div class="card mode-list">
      <div class="m-row" data-mode="prematch"><span class="m-ico">🎒</span>試合前モード<span class="chev">›</span></div>
      <div class="m-row" data-mode="entry"><span class="m-ico">🎫</span>入場前モード<span class="chev">›</span></div>
      <div class="m-row" data-mode="gohome"><span class="m-ico">🏨</span>試合後帰宅モード<span class="chev">›</span></div>
    </div>`;

  // 困った時
  html += `
    <div class="section-title">🆘 困った時</div>
    <div class="btn-grid" style="margin-bottom:10px">
      <button class="btn btn-outline" data-mode="lost">🤝 はぐれた</button>
      <button class="btn btn-danger" data-mode="emergencyMode">🚨 緊急時</button>
    </div>`;

  // 便利リンク
  const st = next ? stadiumById(next.stadiumId) : STADIUMS[0];
  html += `
    <div class="btn-grid" style="margin-bottom:10px">
      <a class="btn btn-soft" href="https://www.fifa.com/tickets" target="_blank" rel="noopener">🎫 チケットアプリ</a>
      <a class="btn btn-soft" href="${mapsUrl(st)}" target="_blank" rel="noopener">🗺️ 会場へのMaps</a>
    </div>
    <p class="offline-badge">📶 このアプリは一度開けばオフラインでも使えます</p>`;

  return html;
}

// ===== 日本代表タブ =====
function renderJapan() {
  const now = new Date();
  let html = `<div class="section-title">グループF 日本戦日程</div>`;

  for (const m of JAPAN_MATCHES) {
    const st = stadiumById(m.stadiumId);
    const dt = new Date(m.utc);
    const done = dt < now;
    html += `
      <div class="card match-card">
        <div class="match-head">
          <span class="match-no">${m.no}</span>
          <span class="match-status">${done ? "終了" : "予定"}</span>
        </div>
        <div class="match-teams">${m.home} vs ${m.away}</div>
        <div class="match-times">
          <div class="time-box"><div class="tz">🏟️ 現地時間</div><div class="t">${fmtInTz(dt, st.tz)}</div></div>
          <div class="time-box"><div class="tz">🇯🇵 日本時間</div><div class="t">${fmtInTz(dt, "Asia/Tokyo")}</div></div>
        </div>
        <div class="match-venue">📍 ${st.fifaName}<br>　通称: ${st.known} / ${st.city}</div>
        <div class="note">📺 ${m.broadcast}</div>
      </div>`;
  }

  // 勝ち点シミュレーター
  const labels = ["オランダ戦", "チュニジア戦", "スウェーデン戦"];
  const pts = [0, 1, 2].reduce((sum, i) => sum + (simPicks[i] === "w" ? 3 : simPicks[i] === "d" ? 1 : 0), 0);
  const picked = [0, 1, 2].filter(i => simPicks[i] !== null).length;
  let verdict = "";
  if (picked === 3) {
    if (pts >= 6) verdict = `<span style="color:var(--green)">突破濃厚！2位以内がほぼ確実なライン 🎉</span>`;
    else if (pts >= 4) verdict = `<span style="color:var(--green)">有力。4以上なら3位でも上位8チームに残る可能性大</span>`;
    else if (pts === 3) verdict = `<span style="color:var(--gold)">3位次第。他組の結果待ちでヒリヒリする展開</span>`;
    else verdict = `<span style="color:var(--red)">かなり厳しい…が、サッカーに絶対はない</span>`;
  } else {
    verdict = `<span style="color:var(--muted)">3試合の結果を選んでみよう</span>`;
  }
  html += `
    <div class="section-title">勝ち点シミュレーター</div>
    <div class="card">
      ${labels.map((l, i) => `
        <div class="sim-row">
          <span class="sim-label">${l}</span>
          <div class="seg" data-sim="${i}">
            <button data-r="w" class="${simPicks[i] === "w" ? "active" : ""}">勝</button>
            <button data-r="d" class="${simPicks[i] === "d" ? "active" : ""}">分</button>
            <button data-r="l" class="${simPicks[i] === "l" ? "active" : ""}">負</button>
          </div>
        </div>`).join("")}
      <div class="sim-result">
        <div class="pts">勝ち点 ${pts}</div>
        <div class="verdict">${verdict}</div>
      </div>
      <p class="note" style="text-align:center">※ 12組×4チーム制。各組2位以内＋3位の上位8チームがラウンド32へ</p>
    </div>`;

  html += `<div class="section-title">ノックアウトステージ</div><div class="card">`;
  html += KO_ROUNDS.map(r => `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);font-size:0.88rem"><b>${r.round}</b><span>${r.dates}</span></div>`).join("");
  html += `<p class="note" style="margin-top:8px">日本の進出が決まったら組み合わせを更新します。</p></div>`;

  html += `<p class="disclaimer">日程・会場は2026年6月12日時点の公式情報を照合済み。<br>変更の可能性があるため、観戦前にFIFA公式アプリでもご確認ください。</p>`;
  return html;
}

// ===== スタジアムタブ =====
function japanMatchLabels() {
  // 例: { dallas: "第1・3戦", monterrey: "第2戦" }
  const map = {};
  for (const m of JAPAN_MATCHES) {
    const label = m.no.replace("GS ", "").replace("戦", "");
    map[m.stadiumId] = map[m.stadiumId] ? map[m.stadiumId] + "・" + label.replace("第", "") + "戦" : label + "戦";
  }
  return map;
}

function stadiumCard(s, jpLabels) {
  return `
    <div class="card stadium-card">
      <div class="s-head">
        <div>
          <h3>${s.known}${jpLabels[s.id] ? `<span class="badge-jp">日本戦 ${jpLabels[s.id]}</span>` : ""}</h3>
          <div class="s-city">${s.fifaName}<br>${s.city} ・ ${COUNTRY_LABEL[s.country]}</div>
        </div>
        <div class="s-now">現地 ${clockInTz(s.tz)}</div>
      </div>
      <div class="s-rows">
        <div class="s-row"><span class="s-ico">🚇</span><span>${s.access}</span></div>
        <div class="s-row"><span class="s-ico">🌡️</span><span>${s.heat}</span></div>
        <div class="s-row"><span class="s-ico">🌙</span><span>${s.safety}</span></div>
        <div class="s-row"><span class="s-ico">🎒</span><span>クリアバッグ規定あり・水ボトル590ml以下1本可（米加）。詳細は遠征メモへ</span></div>
        <div class="s-row"><span class="s-ico">🔙</span><span><b>帰り方:</b> ${s.depart}</span></div>
      </div>
      <div class="s-btns">
        <a class="btn btn-soft" href="${mapsUrl(s)}" target="_blank" rel="noopener">🗺️ Mapsで開く</a>
        <a class="btn btn-soft" href="${officialSearchUrl(s)}" target="_blank" rel="noopener">🔍 公式情報を見る</a>
      </div>
    </div>`;
}

function renderStadiums() {
  const filters = [["all", "すべて"], ["us", "🇺🇸 米国"], ["mx", "🇲🇽 メキシコ"], ["ca", "🇨🇦 カナダ"]];
  let html = `<div class="filter-row">` + filters.map(([v, l]) =>
    `<button class="chip ${state.stadiumFilter === v ? "active" : ""}" data-filter="${v}">${l}</button>`).join("") + `</div>`;

  const jpLabels = japanMatchLabels();
  // 日本戦会場を試合順で先頭に
  const japanOrder = [...new Set(JAPAN_MATCHES.map(m => m.stadiumId))];
  const list = STADIUMS.filter(s => state.stadiumFilter === "all" || s.country === state.stadiumFilter);
  const japanVenues = japanOrder.map(id => list.find(s => s.id === id)).filter(Boolean);
  const otherVenues = list.filter(s => !japanOrder.includes(s.id));

  if (japanVenues.length) {
    html += `<div class="section-title">🇯🇵 日本戦の会場</div>`;
    html += japanVenues.map(s => stadiumCard(s, jpLabels)).join("");
  }
  if (otherVenues.length) {
    html += `<div class="section-title">その他の会場</div>`;
    html += otherVenues.map(s => stadiumCard(s, jpLabels)).join("");
  }

  html += `<p class="disclaimer">持ち込み規定・交通情報は変更される場合があります。観戦前に各スタジアムとFIFA公式の案内をご確認ください。</p>`;
  return html;
}

// ===== チップ計算タブ =====
function renderTip() {
  const { country, scene, pct, amount } = state.tip;
  const guide = TIP_GUIDE[country];
  const sceneData = guide.scenes[scene];
  const amt = parseFloat(amount) || 0;

  let resultHtml;
  if (sceneData.flat) {
    resultHtml = `
      <div class="tip-result">
        <div class="big">現金で渡す</div>
        <div class="sub">${sceneData.note}</div>
      </div>`;
  } else {
    const tip = amt * pct / 100;
    const total = amt + tip;
    const jpy = Math.round(total * rates[guide.currency]);
    resultHtml = `
      <div class="tip-result">
        <div class="big">チップ ${guide.symbol}${tip.toFixed(2)}</div>
        <div class="sub">合計 ${guide.symbol}${total.toFixed(2)}（${pct}%）</div>
        <div class="jpy">≈ ${jpy.toLocaleString()} 円</div>
        ${sceneData.note ? `<div class="sub" style="margin-top:8px">💡 ${sceneData.note}</div>` : ""}
      </div>`;
  }

  return `
    <div class="card">
      <div class="field">
        <label>国</label>
        <div class="seg" id="tip-country">
          ${Object.entries(TIP_GUIDE).map(([k, v]) => `<button data-c="${k}" class="${k === country ? "active" : ""}">${v.label}</button>`).join("")}
        </div>
      </div>
      <div class="field">
        <label>シーン</label>
        <div class="seg" id="tip-scene">
          ${Object.entries(guide.scenes).map(([k, v]) => `<button data-s="${k}" class="${k === scene ? "active" : ""}">${v.label}</button>`).join("")}
        </div>
      </div>
      ${sceneData.flat ? "" : `
      <div class="field">
        <label>合計金額（${guide.currency}）</label>
        <input type="text" id="tip-amount" inputmode="decimal" autocomplete="off" placeholder="例: 80" value="${amount}">
      </div>
      <div class="field">
        <label>チップ率</label>
        <div class="seg" id="tip-pct">
          ${sceneData.pct.map(p => `<button data-p="${p}" class="${p === pct ? "active" : ""}">${p}%</button>`).join("")}
        </div>
      </div>`}
      ${resultHtml}
      <div class="rate-note">レート: $1=${rates.USD.toFixed(1)}円 / C$1=${rates.CAD.toFixed(1)}円 / MXN1=${rates.MXN.toFixed(2)}円${ratesUpdatedAt ? `（${ratesUpdatedAt}時点・自動取得）` : "（概算・オフライン）"}</div>
    </div>
    <div class="card info-card">
      <h3>💡 相場メモ</h3>
      <ul>
        <li>🇺🇸 レストラン18〜20%が標準。バーは1杯$1〜2でも可</li>
        <li>🇨🇦 レストラン15〜18%が標準</li>
        <li>🇲🇽 レストラン10〜15%（propina）。タクシーは基本不要</li>
        <li>ホテル清掃: 米$2〜5 / 加C$2〜5 / 墨20〜50ペソ（現金で枕元に）</li>
      </ul>
    </div>`;
}

// ===== 遠征メモタブ =====
function renderInfo() {
  const prog = checklistProgress();
  return `
    <div class="card info-card">
      <h3>✅ 試合当日チェックリスト（${prog.done}/${prog.total}）</h3>
      <div class="progress-wrap"><div class="progress-bar" style="width:${prog.pct}%"></div></div>
      ${CHECKLIST.map(c => `
        <label class="check-item ${checklistDone[c.id] ? "done" : ""}">
          <input type="checkbox" data-check="${c.id}" ${checklistDone[c.id] ? "checked" : ""}>
          <span>${c.label}</span>
        </label>`).join("")}
    </div>

    <div class="card info-card">
      <h3>📇 マイ情報（この端末にだけ保存されます）</h3>
      ${myInfoEditor(MYINFO_FIELDS.map(f => f.key))}
      <p class="note">入力すると自動保存。帰宅モード・はぐれたモード・緊急時モードに表示されます。</p>
    </div>

    <div class="card info-card">
      <h3>🚨 緊急通報（3カ国共通）</h3>
      <div class="emg-num"><div class="n">911</div><div class="l">警察・消防・救急</div></div>
      <p style="margin-top:10px">パスポート紛失・トラブル時は最寄りの日本国大使館・総領事館へ。渡航前に外務省「<b>たびレジ</b>」登録を推奨。</p>
    </div>

    <div class="card info-card">
      <h3>🛂 入国・渡航メモ</h3>
      <ul>
        <li>アメリカ: <b>ESTA</b> 必須・申請は最低72時間前・料金約US$40（2025年9月に値上げ）。申請は公式 esta.cbp.dhs.gov のみで</li>
        <li>カナダ: <b>eTA</b> 必須（空路入国時・C$7）</li>
        <li>メキシコ: 180日以内の観光はビザ不要。米国からの陸路入国はFMM（入国カード）に注意</li>
        <li>メキシコ↔アメリカ間は1時間の時差（6月: ダラス=UTC-5、モンテレイ=UTC-6）</li>
        <li>都市間は基本飛行機。遅延前提で<b>試合前日入り</b>が鉄則</li>
      </ul>
    </div>

    <div class="card info-card">
      <h3>🌡️ 暑さ対策（最重要）</h3>
      <ul>
        <li>ダラス・ヒューストン・モンテレイ・マイアミは体感40℃超もザラ。<b>水は常に携帯</b></li>
        <li>帽子・日焼け止め・電解質タブレットが有効</li>
        <li>メキシコシティ（標高2,200m）は高地。到着初日は無理しない</li>
      </ul>
    </div>

    <div class="card info-card">
      <h3>🎒 持ち込みルール</h3>
      <ul>
        <li>バッグは<b>透明（クリアバッグ）約30×15×30cm以内</b>＋手のひらサイズの小型ポーチのみ可が基本</li>
        <li>米加会場は<b>未開封のソフトプラスチック製水ボトル590ml以下を1本</b>持ち込み可</li>
        <li>ビン・カン・傘・大型バッテリーは不可。最新規定は各会場の公式案内で</li>
      </ul>
    </div>

    <div class="card info-card">
      <h3>💳 お金・通信</h3>
      <ul>
        <li>米加はほぼ完全キャッシュレス。タッチ決済対応クレカ必須</li>
        <li>メキシコは小額の現金（ペソ）も用意</li>
        <li>通信は3カ国対応eSIMが手軽。スタジアム周辺は回線輻輳しがちなので<b>チケットは事前にオフライン表示確認</b></li>
      </ul>
    </div>

    <div class="card info-card">
      <h3>🗣️ 英語・スペイン語フレーズ</h3>
      <ul>
        <li>🇺🇸 "Where is the nearest gate for section ___?"（___ブロックに近いゲートは？）</li>
        <li>🇺🇸 "Could you call a medic, please?"（救護を呼んでください）</li>
        <li>🇲🇽 "¿Dónde está la entrada?"（入口はどこですか？）</li>
        <li>🇲🇽 "¡Vamos Japón!"（がんばれ日本！）</li>
      </ul>
      <p class="note">困った時用の「見せる文」は、今日タブの各モードに大きく表示されます。</p>
    </div>

    <div class="card info-card">
      <h3>🎉 現地イベント・日本人コミュニティ</h3>
      ${eventItems(EVENTS)}
      <p class="note">開催情報は変更されることがあります。必ずリンク先で最新情報をご確認ください。JFA公式SNSでも現地イベントの告知が出ます。</p>
    </div>

    <div class="card info-card">
      <h3>🔗 公式リンク集</h3>
      <div class="link-list">
        ${LINKS.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label} ↗</a>`).join("")}
      </div>
    </div>

    <p class="disclaimer">本アプリは非公式の個人制作ファンガイドです。FIFAおよび各団体とは関係ありません。<br>制度・規定は変更されることがあります。必ず公式情報をご確認ください。<br>掲載情報は2026年6月12日時点で一次情報と照合済み（45項目検証）。</p>`;
}

// ===== 行動モード =====
function openMode(key) {
  state.mode = key;
  const m = MODES[key];
  const overlay = $("#mode-overlay");
  overlay.className = `mode-overlay ${m.color === "red" ? "red" : ""}`;

  let html = `
    <div class="mode-head ${m.color === "red" ? "red" : ""}">
      <h2>${m.icon} ${m.title}</h2>
      <button class="mode-close" id="mode-close">✕ 閉じる</button>
    </div>`;

  if (key === "emergencyMode") {
    html += `<a class="emg-call" href="tel:911">📞 911 に発信</a>`;
  }

  html += `<ol class="mode-steps">${m.steps.map(s => `<li>${s}</li>`).join("")}</ol>`;

  if (m.phrases) {
    html += `<div class="section-title">この画面をそのまま見せる</div>`;
    html += m.phrases.map(p => `
      <div class="show-card">
        <div class="lang">${p.lang}</div>
        <div class="phrase">${p.show}</div>
      </div>`).join("");
  }

  if (m.showInfo) {
    html += `<div class="section-title">あなたの情報</div>`;
    html += myInfoDisplay(m.showInfo);
    html += `<div class="card">${myInfoEditor(m.showInfo)}</div>`;
  }

  html += `<button class="btn btn-outline" id="mode-close2">✕ モードを閉じる</button>`;
  overlay.innerHTML = html;
  overlay.scrollTop = 0;
  window.scrollTo(0, 0);
}

function closeMode() {
  state.mode = null;
  const overlay = $("#mode-overlay");
  overlay.className = "mode-overlay hidden";
  overlay.innerHTML = "";
}

// ===== レンダリング＆イベント =====
const renderers = { today: renderToday, japan: renderJapan, stadiums: renderStadiums, tip: renderTip, info: renderInfo };

function render() {
  $("#view").innerHTML = renderers[state.tab]();
}

$("#tabbar").addEventListener("click", e => {
  const btn = e.target.closest("button[data-tab]");
  if (!btn) return;
  state.tab = btn.dataset.tab;
  $$("#tabbar button").forEach(b => b.classList.toggle("active", b === btn));
  window.scrollTo(0, 0);
  render();
});

document.body.addEventListener("click", e => {
  // モードを開く
  const modeBtn = e.target.closest("[data-mode]");
  if (modeBtn) { openMode(modeBtn.dataset.mode); return; }

  // モードを閉じる
  if (e.target.id === "mode-close" || e.target.id === "mode-close2") { closeMode(); render(); return; }

  // スタジアムフィルタ
  const filter = e.target.closest("[data-filter]");
  if (filter) { state.stadiumFilter = filter.dataset.filter; render(); return; }

  // 勝ち点シミュレーター
  const simBtn = e.target.closest("[data-sim] button");
  if (simBtn) {
    const i = simBtn.closest("[data-sim]").dataset.sim;
    simPicks[i] = simPicks[i] === simBtn.dataset.r ? null : simBtn.dataset.r;
    store.set("simPicks", simPicks);
    render();
    return;
  }

  // チップ計算
  const c = e.target.closest("#tip-country button");
  if (c) { state.tip.country = c.dataset.c; state.tip.scene = "restaurant"; state.tip.pct = TIP_GUIDE[c.dataset.c].scenes.restaurant.pct[1]; render(); return; }
  const s = e.target.closest("#tip-scene button");
  if (s) { state.tip.scene = s.dataset.s; state.tip.pct = TIP_GUIDE[state.tip.country].scenes[s.dataset.s].pct[1]; render(); return; }
  const p = e.target.closest("#tip-pct button");
  if (p) { state.tip.pct = +p.dataset.p; render(); return; }
});

document.body.addEventListener("input", e => {
  // チップ金額
  if (e.target.id === "tip-amount") {
    state.tip.amount = e.target.value;
    const pos = e.target.selectionStart;
    render();
    const input = $("#tip-amount");
    if (input) { input.focus(); try { input.setSelectionRange(pos, pos); } catch (_) {} }
    return;
  }
  // マイ情報（自動保存）
  if (e.target.dataset.myinfo) {
    myInfo[e.target.dataset.myinfo] = e.target.value;
    store.set("myInfo", myInfo);
    return;
  }
});

document.body.addEventListener("change", e => {
  // チェックリスト
  if (e.target.dataset.check) {
    checklistDone[e.target.dataset.check] = e.target.checked;
    store.set("checklistDone", checklistDone);
    if (state.tab === "info" || state.tab === "today") render();
  }
});

// カウントダウン・時計を毎分更新
setInterval(() => {
  if (state.mode === null && (state.tab === "today" || state.tab === "japan" || state.tab === "stadiums")) render();
}, 60000);

// PWA: Service Worker登録
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

render();
refreshRates();
