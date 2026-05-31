      const spots = [
        { id: 1,
          name: "嵐山の渡月橋",
          lat: 35.01267,
          lng: 135.677746,
          description: "京都の嵐山。四季折々の山並みの景色が美しい。食べ歩きも人気",
          vibe: "にぎやか・観光向け" },
        { id: 2,
          name: "東映太秦映画村",
          lat: 35.016189,
          lng: 135.708637,
          description: "太秦駅から３分。江戸時代の生活文化を体験できる",
          vibe: "にぎやか・観光向け" },
        { id: 3,
          name: "太秦乾公園",
          lat: 35.01826871,
          lng: 135.69797022,
          description: "太秦の公園。近くに住む子供たちが楽しく遊ぶ公園",
          vibe: "まったり・京都にとけ込みたい人向け" },
        { id: 4,
          name: "自宅正面のおうち",
          lat: 35.01799572460345,
          lng: 135.69711429525734,
          description: "正面のおうち。子供たちの声が聞こえてきます",
          vibe: "まったり・京都にとけ込みたい人向け" },
        { id: 5,
          name: "ご近所さん西角のおうち",
          lat: 35.01800066707424, 
          lng: 135.69676158477435,
          description: "西の角のおうち。サンサーラの入り口のまんまえです",
          vibe: "まったり・京都にとけ込みたい人向け" },
        { id: 6,
          name: "ご近所さん東角のおうち",
          lat: 35.01800066707424,
          lng: 135.69728394496906,
          description: "東角のおうち。サンサーラの東側のおうちです",
          vibe: "まったり・京都に溶け込みたい人向け" },
        { id: 7,
          name: "まとば歯科",
          lat: 34.93307855135378,
          lng: 135.76081355250946,
          description: "古くからの歯医者さんです",
          vibe: "まったり・京都に溶け込みたい人向け" },
        { id: 8,
          name: "エディオンタニヤマ",
          lat: 34.93308184975226, 
          lng: 135.7606553021809,
          description: "古くからの電気屋さんです",
          vibe: "まったり・京都に溶け込みたい人向け" },
        { id: 9,
          name: "茶寮油長",
          lat: 34.9329334216898,
          lng: 135.7614130262247,
          description: "古くからのお茶屋さんです",
          vibe: "まったり・京都に溶け込みたい人向け" },
        { id: 10,
          name: "タカノ",
          lat: 34.93294771477424,
          lng: 135.76163699067274,
          description: "古くからの時計屋さんです",
          vibe: "まったり・京都に溶け込みたい人向け" },
        { id: 11,
          name: "ドコモショップ伏見",
          lat: 34.932943316902346,
          lng: 135.76185559070285,
          description: "配達先のケイタイショップです",
          vibe: "まったり・京都に溶け込みたい人向け" },
      ];

// =========================
// 設定値
// =========================

// 案内開始距離
let triggerDistance = 100;

// 離脱判定距離
const LEAVE_DISTANCE = 120;

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

  setStatus("GPS監視開始1");

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

  let nearest = null;
  let minDistance = Infinity;

  // 最短距離スポット探索
  for (const spot of spots) {

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

  alert(

`【${spot.name}】

${spot.description}`

  );

  console.log(
    "案内開始:",
    spot.name
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