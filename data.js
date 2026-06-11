// ===== 日本代表 グループF 日程（UTC基準で保持し、表示時にタイムゾーン変換） =====
// 出典: FIFA公式・JFA・FOX Sports（2026-06-12検証済み・FACTCHECK.md参照）
const JAPAN_MATCHES = [
  {
    no: "GS 第1戦",
    home: "オランダ",
    away: "日本",
    utc: "2026-06-14T20:00:00Z",
    stadiumId: "dallas",
    broadcast: "NHK総合 / DAZN（無料）",
  },
  {
    no: "GS 第2戦",
    home: "チュニジア",
    away: "日本",
    utc: "2026-06-21T04:00:00Z",
    stadiumId: "monterrey",
    broadcast: "日本テレビ系 / NHK BS / DAZN（無料）",
  },
  {
    no: "GS 第3戦",
    home: "日本",
    away: "スウェーデン",
    utc: "2026-06-25T23:00:00Z",
    stadiumId: "dallas",
    broadcast: "NHK総合 / DAZN（無料）",
  },
];

// ===== 16会場データ =====
// fifaName: 大会公式名称 / known: 通称 / tz: IANAタイムゾーン / maps: Google Maps検索クエリ
const STADIUMS = [
  // アメリカ
  { id: "newyork", country: "us", fifaName: "ニューヨーク・ニュージャージー・スタジアム", known: "MetLife Stadium", city: "イーストラザフォード (NY/NJ)", tz: "America/New_York",
    maps: "MetLife Stadium East Rutherford NJ",
    access: "マンハッタンからNJ Transit（Penn Station → Secaucus乗換 → Meadowlands駅）で約40〜60分。決勝(7/19)の開催地",
    heat: "蒸し暑い日もあるが、南部ほどの猛暑は少なめ",
    safety: "夜の駅周辺は人の流れと一緒に行動。単独でうろつかない",
    depart: "試合後は駅が大混雑し1〜2時間待ちもあり得る。水・モバイルバッテリーを残しておき、焦らず列に並ぶ" },
  { id: "losangeles", country: "us", fifaName: "ロサンゼルス・スタジアム", known: "SoFi Stadium", city: "イングルウッド (CA)", tz: "America/Los_Angeles",
    maps: "SoFi Stadium Inglewood CA",
    access: "公共交通は弱い。Metro K線 Downtown Inglewood駅から無料シャトル、または配車アプリ。LAX空港から車で約15分",
    heat: "乾いた暑さで日差しが強い。屋根はあるが側面開放の半屋外構造",
    safety: "夜間の徒歩移動は避け、配車アプリで建物の前まで",
    depart: "配車は指定ピックアップゾーンのみ。場所を入場前に確認しておく。退場後の渋滞は長め" },
  { id: "dallas", country: "us", fifaName: "ダラス・スタジアム", known: "AT&T Stadium", city: "アーリントン (TX)", tz: "America/Chicago",
    maps: "AT&T Stadium Arlington TX",
    access: "日本のGS第1戦・第3戦の会場。鉄道駅なし。ダラス/フォートワース市内からシャトルか配車アプリで約30分",
    heat: "6月は体感40℃級の猛暑。場内は屋内型でエアコンあり。屋外の待機列で消耗しないよう水必須",
    safety: "周辺は広大な駐車場エリア。夜は明るい通り沿いを集団で",
    depart: "配車の待機列がかなり長い。大会シャトルの乗り場と最終時刻を入場前に確認しておくのが安全" },
  { id: "houston", country: "us", fifaName: "ヒューストン・スタジアム", known: "NRG Stadium", city: "ヒューストン (TX)", tz: "America/Chicago",
    maps: "NRG Stadium Houston TX",
    access: "METRORail Red Line「Stadium Park/Astrodome」駅が至近。ダウンタウンから約15〜20分",
    heat: "高温多湿。場内は屋内型でエアコンあり",
    safety: "夜は駅まで観客の流れと一緒に移動",
    depart: "試合後は電車が増発される予定だが、終電時刻を事前に確認しておく" },
  { id: "atlanta", country: "us", fifaName: "アトランタ・スタジアム", known: "Mercedes-Benz Stadium", city: "アトランタ (GA)", tz: "America/New_York",
    maps: "Mercedes-Benz Stadium Atlanta GA",
    access: "MARTA（地下鉄）GWCC/CNN Center駅直結で交通至便",
    heat: "屋内型でエアコンあり。屋外イベントは高温多湿に注意",
    safety: "ダウンタウンの夜間は人通りの少ない通りを避ける",
    depart: "MARTAが最速の帰宅手段。場内は完全キャッシュレスなのでタッチ決済カードを用意" },
  { id: "miami", country: "us", fifaName: "マイアミ・スタジアム", known: "Hard Rock Stadium", city: "マイアミガーデンズ (FL)", tz: "America/New_York",
    maps: "Hard Rock Stadium Miami Gardens FL",
    access: "3位決定戦(7/18)の開催地。市中心部から車で約30〜40分。配車アプリ推奨",
    heat: "高温多湿＋夕方のスコールに注意。雨具（ポンチョ）があると安心",
    safety: "夜間の徒歩移動は避ける",
    depart: "配車ピックアップゾーンが遠い場合あり。帰りの待ち時間は長めに見積もる" },
  { id: "philadelphia", country: "us", fifaName: "フィラデルフィア・スタジアム", known: "Lincoln Financial Field", city: "フィラデルフィア (PA)", tz: "America/New_York",
    maps: "Lincoln Financial Field Philadelphia PA",
    access: "地下鉄Broad Street Line終点「NRG駅」から徒歩約15分",
    heat: "屋外型。日差し対策必須",
    safety: "夜は地下鉄で人の流れと一緒に。空いた車両を避ける",
    depart: "試合後は地下鉄がピストン運行。ダウンタウンまで一本で戻れる" },
  { id: "seattle", country: "us", fifaName: "シアトル・スタジアム", known: "Lumen Field", city: "シアトル (WA)", tz: "America/Los_Angeles",
    maps: "Lumen Field Seattle WA",
    access: "ダウンタウンから徒歩圏。Link Light Rail「Stadium」駅からゲートまで徒歩約1分",
    heat: "夏のシアトルは比較的涼しく過ごしやすい",
    safety: "比較的安全だが、夜のPioneer Square周辺は注意",
    depart: "徒歩＋Linkで帰りやすい会場。ホテルをダウンタウンに取ると楽" },
  { id: "sfbay", country: "us", fifaName: "サンフランシスコ・ベイエリア・スタジアム", known: "Levi's Stadium", city: "サンタクララ (CA)", tz: "America/Los_Angeles",
    maps: "Levi's Stadium Santa Clara CA",
    access: "SF市内から約70km。Caltrain → Mountain View乗換 → VTAライトレールで約1.5時間",
    heat: "日中の日差しが強い（特に東側席）。夜は冷えるので羽織りもの",
    safety: "帰りの駅で終電を必ず確認",
    depart: "SFまで帰るなら長旅。終電時刻の確認と帰路の計画を試合前に済ませておく" },
  { id: "boston", country: "us", fifaName: "ボストン・スタジアム", known: "Gillette Stadium", city: "フォックスボロー (MA)", tz: "America/New_York",
    maps: "Gillette Stadium Foxborough MA",
    access: "ボストン市内から約35km。試合日はSouth Station発の直行臨時列車「Boston Stadium Train」あり（要事前購入）",
    heat: "夏のボストンは比較的穏やか。日差し対策は必要",
    safety: "周辺に飲食店が少ない。併設のPatriot Placeモールを活用",
    depart: "臨時列車の発車時刻は厳守。乗り遅れると帰宅手段が極端に限られる" },
  { id: "kansascity", country: "us", fifaName: "カンザスシティ・スタジアム", known: "Arrowhead Stadium", city: "カンザスシティ (MO)", tz: "America/Chicago",
    maps: "Arrowhead Stadium Kansas City MO",
    access: "公共交通ほぼなし。大会専用シャトル「ConnectKC26」か車・配車アプリで",
    heat: "内陸の猛暑に注意。屋外型",
    safety: "巨大駐車場で迷いやすい。車・シャトルの位置を写真で記録",
    depart: "シャトル乗り場と最終便の時刻を入場前に必ず確認" },
  // メキシコ
  { id: "mexicocity", country: "mx", fifaName: "エスタディオ・シウダ・デ・メヒコ", known: "Estadio Azteca", city: "メキシコシティ", tz: "America/Mexico_City",
    maps: "Estadio Azteca Mexico City",
    access: "開幕戦が行われた歴史的スタジアム。電車Tren Ligero「Estadio Azteca」駅下車",
    heat: "標高約2,200mの高地。気温は穏やかだが酸素が薄く、日差しが強い。到着初日は無理しない。夕方のにわか雨に注意",
    safety: "夜の移動はUber等の配車アプリで。流しのタクシーは使わない。水道水は飲まずボトル水を",
    depart: "夜は駅まで歩くよりUber推奨。混雑のピークを少し外すと拾いやすい" },
  { id: "guadalajara", country: "mx", fifaName: "エスタディオ・グアダラハラ", known: "Estadio Akron", city: "グアダラハラ", tz: "America/Mexico_City",
    maps: "Estadio Akron Guadalajara",
    access: "市中心部から車で約30〜40分",
    heat: "標高約1,500mの高地。日差しが強い",
    safety: "夜間の単独行動は避ける。移動は配車アプリで",
    depart: "帰りもUber等で。乗車位置はスタジアムの案内に従う" },
  { id: "monterrey", country: "mx", fifaName: "エスタディオ・モンテレイ", known: "Estadio BBVA", city: "モンテレイ（グアダルペ）", tz: "America/Monterrey",
    maps: "Estadio BBVA Guadalupe Monterrey",
    access: "日本のGS第2戦の会場。市中心部から車で約20〜30分。配車アプリ推奨",
    heat: "16会場で最高レベルの酷暑（6月は40℃近い）。夜試合でも水分・塩分必須",
    safety: "夜はUber等で移動し徒歩は避ける。米国からの陸路入国はFMM（入国カード）に注意",
    depart: "日本戦は22時キックオフ→深夜の帰宅になる。Uberを早めに手配し、ホテル直行" },
  // カナダ
  { id: "toronto", country: "ca", fifaName: "トロント・スタジアム", known: "BMO Field", city: "トロント", tz: "America/Toronto",
    maps: "BMO Field Toronto",
    access: "ストリートカー509/511、またはUnion駅からExhibition GO駅（1駅・目の前）。eTA（電子渡航認証）必要",
    heat: "夏のトロントは快適。屋外型",
    safety: "比較的安全。夜は人の流れと一緒に",
    depart: "試合後はGO増発・深夜ストリートカーの運行予定あり。Union駅方面が基本ルート" },
  { id: "vancouver", country: "ca", fifaName: "BCプレイス・バンクーバー", known: "BC Place", city: "バンクーバー", tz: "America/Vancouver",
    maps: "BC Place Vancouver",
    access: "ダウンタウン至近。SkyTrain「Stadium-Chinatown」駅すぐ。開閉式屋根あり。eTA必要",
    heat: "夏のバンクーバーは快適",
    safety: "比較的安全だが、East Hastings方面へは夜間近づかない",
    depart: "試合日は入退場規制で「Main Street-Science World」駅利用を案内される場合あり。係員の誘導に従う" },
];

const COUNTRY_LABEL = { us: "🇺🇸 アメリカ", mx: "🇲🇽 メキシコ", ca: "🇨🇦 カナダ" };

// ===== チップ相場（国×シーン） =====
const TIP_GUIDE = {
  us: {
    label: "🇺🇸 アメリカ", currency: "USD", symbol: "$",
    scenes: {
      restaurant: { label: "レストラン", pct: [18, 20, 22], note: "18〜20%が標準。伝票にService Charge込みなら追加不要" },
      taxi: { label: "タクシー/配車", pct: [15, 18, 20], note: "配車アプリはアプリ内で追加" },
      bar: { label: "バー", pct: [15, 18, 20], note: "1杯ごとなら$1〜2でもOK" },
      hotel: { label: "ホテル清掃", pct: [0, 0, 0], note: "清掃$2〜5/泊、ポーター$1〜2/個を現金で", flat: true },
    },
  },
  ca: {
    label: "🇨🇦 カナダ", currency: "CAD", symbol: "C$",
    scenes: {
      restaurant: { label: "レストラン", pct: [15, 18, 20], note: "15〜18%が標準" },
      taxi: { label: "タクシー/配車", pct: [10, 15, 18], note: "" },
      bar: { label: "バー", pct: [15, 18, 20], note: "1杯ごとならC$1〜2でもOK" },
      hotel: { label: "ホテル清掃", pct: [0, 0, 0], note: "清掃C$2〜5/泊を現金で", flat: true },
    },
  },
  mx: {
    label: "🇲🇽 メキシコ", currency: "MXN", symbol: "$",
    scenes: {
      restaurant: { label: "レストラン", pct: [10, 15, 20], note: "10〜15%が標準（propina）" },
      taxi: { label: "タクシー/配車", pct: [0, 10, 15], note: "タクシーは基本チップ不要・配車は任意" },
      bar: { label: "バー", pct: [10, 15, 20], note: "" },
      hotel: { label: "ホテル清掃", pct: [0, 0, 0], note: "清掃20〜50ペソ/泊を現金で", flat: true },
    },
  },
};

// 為替レート初期値（オンライン時に自動更新・localStorageに保存）
const DEFAULT_RATES = { USD: 150, CAD: 110, MXN: 8.0 };

// ===== ノックアウトステージ日程（参考） =====
const KO_ROUNDS = [
  { round: "ラウンド32", dates: "6/28 〜 7/3" },
  { round: "ラウンド16", dates: "7/4 〜 7/7" },
  { round: "準々決勝", dates: "7/9 〜 7/11" },
  { round: "準決勝", dates: "7/14・7/15" },
  { round: "3位決定戦", dates: "7/18（マイアミ）" },
  { round: "決勝", dates: "7/19（ニューヨーク・ニュージャージー）" },
];

// ===== 試合当日チェックリスト =====
const CHECKLIST = [
  { id: "ticket", label: "チケットアプリにログインし、表示できるか確認した" },
  { id: "bag", label: "クリアバッグ（約30×15×30cm以内）を準備した" },
  { id: "water", label: "未開封の水ボトル（590ml以下・ソフトプラ製）を用意した" },
  { id: "battery", label: "モバイルバッテリーを満充電にした" },
  { id: "sun", label: "帽子・日焼け止め・サングラスを持った" },
  { id: "passport", label: "パスポートのコピーを持った（原本はホテルへ）" },
  { id: "hotel", label: "ホテル名・住所をこのアプリに保存した" },
  { id: "transport", label: "帰りの交通手段と最終時刻を確認した" },
  { id: "cash", label: "少額の現金を持った（チップ・屋台用）" },
  { id: "meet", label: "はぐれた時の集合場所を同行者と決めた" },
];

// ===== マイ情報のフィールド定義（localStorage保存） =====
const MYINFO_FIELDS = [
  { key: "hotelName", label: "ホテル名", placeholder: "例: Hilton Arlington" },
  { key: "hotelAddr", label: "ホテル住所（英語で）", placeholder: "例: 2401 E Lamar Blvd, Arlington, TX" },
  { key: "meetPoint", label: "はぐれた時の集合場所", placeholder: "例: ゲートA前の旗のところ" },
  { key: "companion", label: "同行者メモ", placeholder: "例: 田中 +81-90-xxxx-xxxx" },
  { key: "emergency", label: "緊急連絡先（保険会社など）", placeholder: "例: 海外旅行保険 0120-xxx-xxx（24時間）" },
];

// ===== 行動モード定義 =====
const MODES = {
  prematch: {
    icon: "🎒", title: "試合前モード", color: "blue",
    steps: [
      "チケットアプリを開いて表示確認（電波が悪くても出せるように）",
      "水（未開封590ml以下）とモバイルバッテリーをバッグへ",
      "クリアバッグ以外の荷物はホテルに置く",
      "ホテル住所と集合場所をこのアプリに保存",
      "会場への移動手段と所要時間を確認（開場は試合2〜3時間前）",
      "暑さ対策（帽子・日焼け止め・塩分）をして出発",
    ],
  },
  entry: {
    icon: "🎫", title: "入場前モード", color: "blue",
    steps: [
      "チケットアプリを起動し、画面を開いたままにする",
      "バッグはクリアバッグのみ。禁止物（ビン・カン・傘など）がないか最終確認",
      "自分のゲート番号とセクションを確認",
      "セキュリティチェックは時間がかかる。列に並んだら焦らない",
      "入場したら、同行者と「はぐれた時の集合場所」を再確認",
    ],
  },
  gohome: {
    icon: "🏨", title: "試合後帰宅モード", color: "blue",
    steps: [
      "まず同行者と合流する",
      "自分が出た出口番号を確認する",
      "すぐUber/Lyftを呼ばない（料金高騰＆大渋滞のため）",
      "人混みから少し離れた場所へ移動する",
      "公式シャトル・公共交通の運行を先に確認する",
      "下のホテル住所を運転手や係員に見せる",
      "不安な場合は会場スタッフ・警備員に相談する",
    ],
    phrases: [
      { lang: "英語", show: "I am trying to get back to my hotel.\nCould you tell me the safest way to get there?" },
      { lang: "スペイン語", show: "Quiero volver a mi hotel.\n¿Podría decirme la forma más segura de llegar?" },
    ],
    showInfo: ["hotelName", "hotelAddr"],
  },
  lost: {
    icon: "🤝", title: "はぐれた時モード", color: "blue",
    steps: [
      "その場で1〜2分待つ（相手も探している）",
      "決めておいた集合場所へ向かう",
      "電波があれば同行者にメッセージ（電話より届きやすい）",
      "見つからなければ、下の文を係員に見せる",
    ],
    phrases: [
      { lang: "英語", show: "I got separated from my family.\nWe agreed to meet at this location.\nCould you help me get there?" },
      { lang: "スペイン語", show: "Me separé de mi familia.\nQuedamos en reunirnos en este lugar.\n¿Podría ayudarme a llegar allí?" },
    ],
    showInfo: ["meetPoint", "hotelName", "hotelAddr", "companion"],
  },
  emergencyMode: {
    icon: "🚨", title: "緊急時モード", color: "red",
    steps: [
      "安全な場所へ移動する（建物の中・係員のそば）",
      "緊急通報は 911（米国・カナダ・メキシコ共通）",
      "話せなくても電話をつないだままにすれば位置を特定してもらえる場合がある",
      "下の文をそのまま見せる・読む",
      "落ち着いたら保険会社・ホテル・同行者に連絡",
    ],
    phrases: [
      { lang: "英語", show: "I need help.\nPlease call 911.\nI am Japanese.\nI need a Japanese interpreter if possible." },
      { lang: "スペイン語", show: "Necesito ayuda.\nPor favor llame al 911.\nSoy japonés.\nNecesito un intérprete de japonés si es posible." },
    ],
    showInfo: ["emergency", "hotelName", "hotelAddr", "companion"],
  },
};

// ===== 現地イベント・日本人コミュニティ情報 =====
// 2026-06-12時点でWeb確認済み。開催情報は変わるためリンク先で最新確認を促す
const EVENTS = [
  { cityIds: ["dallas"], icon: "🎪", name: "FIFAファンフェスティバル ダラス",
    place: "Fair Park（1818 1st Ave, Dallas）", period: "6/11〜7/19（試合のない日は休み）",
    note: "全104試合を巨大スクリーンで観戦できる公式ファンゾーン。入場無料だが事前のチケット取得が必要",
    url: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/fifa-fan-festival/dallas" },
  { cityIds: ["dallas"], icon: "🍻", name: "日本人サポーター向け観戦イベント（アーリントン）",
    place: "Hearsay Arlington ほか市内の飲食店", period: "日本戦の前後",
    note: "日本戦に合わせた決起集会・観戦イベントが企画されている。開催日・参加方法は店舗サイトやSNSで最新確認を",
    url: "https://hearsayarlington.com/" },
  { cityIds: ["dallas"], icon: "🏘️", name: "ダラス日本人会（DJA）",
    place: "ダラス近郊", period: "通年",
    note: "約1,000世帯が参加する日本人コミュニティ。現地の生活情報やイベント告知の入口に",
    url: "https://godja.org/" },
  { cityIds: ["monterrey"], icon: "🎪", name: "FIFAファンフェスティバル モンテレイ",
    place: "Parque Fundidora（フンディドーラ公園）", period: "6/11〜7/19",
    note: "一般入場は無料・登録不要（先着順）。メトロ1号線「Y Griega」駅から徒歩数分。無料コンサートも多数",
    url: "https://www.fifafanfestivalmonterrey.com/en" },
];

// ===== 公式リンク集 =====
const LINKS = [
  { label: "FIFA公式（試合・チケット）", url: "https://www.fifa.com/" },
  { label: "JFA 日本代表", url: "https://www.jfa.jp/samuraiblue/" },
  { label: "外務省 海外安全ホームページ", url: "https://www.anzen.mofa.go.jp/" },
  { label: "たびレジ登録", url: "https://www.ezairyu.mofa.go.jp/tabireg/" },
  { label: "ESTA申請（米国公式）", url: "https://esta.cbp.dhs.gov/" },
  { label: "eTA申請（カナダ公式）", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada/eta.html" },
];
