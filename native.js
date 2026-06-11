// ネイティブアプリ（Capacitor/iOS）でのみ動作する機能。ブラウザ/PWAでは何もしない。
// 日本戦リマインダー: 前日と、キックオフ3時間前にローカル通知を予約する。
(async () => {
  if (!window.Capacitor || !Capacitor.isNativePlatform || !Capacitor.isNativePlatform()) return;
  const LN = Capacitor.Plugins.LocalNotifications;
  if (!LN) return;
  try {
    const perm = await LN.requestPermissions();
    if (perm.display !== "granted") return;

    // 予約済みを一旦クリアして重複を防ぐ（日程更新にも追従できる）
    const pending = await LN.getPending();
    if (pending.notifications && pending.notifications.length) await LN.cancel(pending);

    const now = Date.now();
    const notifications = [];
    let id = 1;
    for (const m of JAPAN_MATCHES) {
      const ko = new Date(m.utc).getTime();
      const matchName = `${m.home} vs ${m.away}`;
      const slots = [
        { at: ko - 24 * 3600000, title: "⚽ 明日は日本戦！", body: `${matchName} — チェックリストの準備を済ませよう` },
        { at: ko - 3 * 3600000, title: "⚽ キックオフ3時間前", body: `${matchName} — 試合前モードで持ち物を最終確認！` },
      ];
      for (const s of slots) {
        if (s.at > now) {
          notifications.push({ id: id++, title: s.title, body: s.body, schedule: { at: new Date(s.at) } });
        }
      }
    }
    if (notifications.length) await LN.schedule({ notifications });
  } catch (_) { /* 通知が許可されなくてもアプリ本体は動く */ }
})();
