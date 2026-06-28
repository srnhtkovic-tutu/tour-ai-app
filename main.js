let spots = [];
const SUPABASE_URL = "https://fugibstqzkmzplqrpovn.supabase.co";
const SUPABASE_KEY = "sb_publishable_CM7-Kj4GEFY0oG2EI3t-XQ_MijxwUcZ";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// =========================
// spots読み込み処理
// =========================
async function loadSpots() {

  const { data, error } = await supabaseClient
    .from("spots")
    .select("*");

  if (error) {
    console.error(error);
    return [];
  }

  console.log(data);

  return data.map(spot => ({
    id: spot.id,
    name: spot.name,
    lat: Number(spot.lat),
    lng: Number(spot.lng),
    description: spot.description,
    vibe: spot.vibe
  }));

}

// =========================
// 設定値
// =========================

// 案内開始距離
let triggerDistance = 5000;

// 離脱判定距離
const LEAVE_DISTANCE = 5500;

// 滞在必要時間
const STAY_TIME = 10 * 1000;

// 案内クールタイム
const GUIDE_COOLDOWN =
  5 * 60 * 1000;


// =========================
// 状態管理
// =========================

// 現在対象スポット
let currentSpot = null;

// 接近開始時間
let enterTime = null;

// 最後に案内した時刻
const lastGuideTime = {};

// 興味なしスポット
const ignoredSpots = new Set();

// 訪問済みスポット
const visitedSpots = new Set();

// 案内中フラグ
let guideActive = false;

// =========================
// スライダー
// =========================

const slider =
  document.getElementById(
    "distanceSlider"
  );

const distanceValue =
  document.getElementById(
    "distanceValue"
  );

slider.addEventListener(
  "input",
  function () {

    triggerDistance =
      Number(slider.value);

    distanceValue.textContent =
      triggerDistance;

  }
);


// =========================
// GPS監視開始
// =========================

function startWatch() {

  if (!navigator.geolocation) {

    alert("GPS非対応");
    return;

  }

  navigator.geolocation.watchPosition(

    success,

    error,

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

  );

  setStatus("GPS監視開始 version3");

}


// =========================
// GPS成功
// =========================

function success(position) {

  const lat =
    position.coords.latitude;

  const lng =
    position.coords.longitude;

  setStatus(
    `現在地: ${lat.toFixed(5)}, ${lng.toFixed(5)}`
  );

  processNearestSpot(lat, lng);

}


// =========================
// 最寄りスポット処理
// =========================

function processNearestSpot(
  currentLat,
  currentLng
) {
  if (guideActive) {
     return;
  }
  let nearest = null;
  let minDistance = Infinity;

  // 最短距離スポット探索
  for (const spot of spots) {

    if (
      ignoredSpots.has(spot.id)
      ||
      visitedSpots.has(spot.id)
    ) {
      continue;
    }

    const distance = getDistance(
      currentLat,
      currentLng,
      spot.lat,
      spot.lng
    );

    if (distance < minDistance) {

      minDistance = distance;
      nearest = spot;

    }

  }

  if (!nearest) return;

  // UI表示
  document.getElementById(
    "nearestSpot"
  ).textContent =

    `最寄りスポット:
     ${nearest.name}
     (${minDistance.toFixed(1)}m)`;


  // =====================
  // 接近判定
  // =====================

  if (minDistance <= triggerDistance) {

    // 新スポット接近
    if (
      !currentSpot ||
      currentSpot.id !== nearest.id
    ) {

      currentSpot = nearest;

      enterTime = Date.now();

      console.log(
        "接近開始:",
        nearest.name
      );

    }

    const stayMs =
      Date.now() - enterTime;

    document.getElementById(
      "stayTime"
    ).textContent =

      `滞在時間:
       ${(stayMs / 1000).toFixed(1)}秒`;



    // =====================
    // 滞在成立
    // =====================

    if (stayMs >= STAY_TIME) {

      const last =
        lastGuideTime[nearest.id] || 0;

      const now = Date.now();

      // クールタイム確認
      if (
        now - last >
        GUIDE_COOLDOWN
      ) {

        startGuide(nearest);

        lastGuideTime[
          nearest.id
        ] = now;

      }

    }

  }

  // =====================
  // 離脱判定
  // =====================

  else {

    if (
      currentSpot &&
      minDistance >
      LEAVE_DISTANCE
    ) {

      console.log(
        "離脱:",
        currentSpot.name
      );

      currentSpot = null;

      enterTime = null;

      document.getElementById(
        "stayTime"
      ).textContent =
        "滞在時間: 0秒";

    }

  }

}


// =========================
// 案内処理
// =========================

function startGuide(spot) {

  guideActive = true;

  currentSpot = spot;

  const guideText =

`近くに ${spot.name} があります。

${spot.description}`;

  showGuidePanel(
    guideText,
    spot
  );

  speakGuide(
    guideText
  );

}


// =========================
// 距離計算
// =========================

function getDistance(
  lat1,
  lng1,
  lat2,
  lng2
) {

  const R = 6371000;

  const dLat =
    toRad(lat2 - lat1);

  const dLng =
    toRad(lng2 - lng1);

  const a =

    Math.sin(dLat / 2) *
    Math.sin(dLat / 2)

    +

    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2))

    *

    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c =

    2 * Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;

}


// =========================
// 度→ラジアン
// =========================

function toRad(value) {

  return value *
    Math.PI / 180;

}


// =========================
// ステータス表示
// =========================

function setStatus(text) {

  document.getElementById(
    "status"
  ).textContent = text;

}


// =========================
// GPSエラー
// =========================

function error(err) {

  console.error(err);

  alert("GPS取得失敗");

}

function speakGuide(text){

  const speech =
    new SpeechSynthesisUtterance(
      text
    );

  speech.lang = "ja-JP";

  speechSynthesis.speak(
    speech
  );

}

function showGuidePanel(
  text,
  spot
){

  document.getElementById(
    "guidePanel"
  ).style.display = "block";

  document.getElementById(
    "guideTitle"
  ).textContent =
    spot.name;

  document.getElementById(
    "guideMessage"
  ).textContent =
    text;

}

document
.getElementById("detailBtn")
.addEventListener(
  "click",
  function(){

    openChatGPT(currentSpot);

  }
);

function openChatGPT(spot){

  const prompt = encodeURIComponent(

`私は今 ${spot.name}
の近くにいます。

詳しく教えてください。`

  );

  window.open(

`https://chat.openai.com/?q=${prompt}`,

"_blank"

  );

}

document
.getElementById("goBtn")
.addEventListener(
  "click",
  function(){

    visitedSpots.add(
      currentSpot.id
    );

    const url =

`https://www.google.com/maps/dir/?api=1&destination=${currentSpot.lat},${currentSpot.lng}`;

    window.open(
      url,
      "_blank"
    );

    closeGuide();

  }
);

document
.getElementById("ignoreBtn")
.addEventListener(
  "click",
  function(){

    ignoredSpots.add(
      currentSpot.id
    );

    closeGuide();

  }
);


function closeGuide(){

  document.getElementById(
    "guidePanel"
  ).style.display =
    "none";

  guideActive = false;

  currentSpot = null;

  enterTime = null;

}

async function initialize() {

  setStatus("スポット読込中...");

  spots = await loadSpots();

  console.log("spots=", spots);

  if (spots.length === 0) {
    setStatus("スポットがありません");
    return;
  }

  setStatus(`${spots.length}件読み込み完了`);

  startWatch();

}

initialize();

