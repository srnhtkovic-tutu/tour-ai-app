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
          vibe: "まったり・京都に溶け込みたい人向け" }
      ];

// =========================
// グローバル変数
// =========================

let watchId = null;

// 現在の案内距離
let triggerDistance = 100;

// 案内済み管理
const guidedSpots = new Set();


// =========================
// スライダー初期化
// =========================

const slider = document.getElementById("distanceSlider");
const distanceValue = document.getElementById("distanceValue");

slider.addEventListener("input", function () {

  triggerDistance = Number(slider.value);

  distanceValue.textContent = triggerDistance;

  console.log("案内距離変更:", triggerDistance);

});


// =========================
// 位置監視開始
// =========================

function startWatch() {

  if (!navigator.geolocation) {

    alert("GPSが利用できません");
    return;
  }

  watchId = navigator.geolocation.watchPosition(

    success,

    error,

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }

  );

  document.getElementById("status").textContent =
    "位置監視中...";
}


// =========================
// GPS取得成功
// =========================

function success(position) {

  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  console.log("現在地:", lat, lng);

  document.getElementById("status").textContent =
    `現在地: ${lat}, ${lng}`;

  checkNearbySpots(lat, lng);

}


// =========================
// 近距離スポット判定
// =========================

function checkNearbySpots(currentLat, currentLng) {

  for (const spot of spots) {

    const distance = getDistance(
      currentLat,
      currentLng,
      spot.lat,
      spot.lng
    );

    console.log(
      spot.name,
      distance.toFixed(1) + "m"
    );

    // 近づいたか判定
    if (distance <= triggerDistance) {

      // 未案内なら案内
      if (!guidedSpots.has(spot.id)) {

        guidedSpots.add(spot.id);

        startGuide(spot);

      }

    }

  }

}


// =========================
// 案内開始
// =========================

function startGuide(spot) {

  alert(
    `【${spot.name}】\n\n${spot.description}`
  );

  console.log("案内開始:", spot.name);

}


// =========================
// 距離計算
// =========================

function getDistance(lat1, lng1, lat2, lng2) {

  const R = 6371000;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) *
    Math.sin(dLat / 2) +

    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *

    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(
    Math.sqrt(a),
    Math.sqrt(1 - a)
  );

  return R * c;
}


// =========================
// 度→ラジアン
// =========================

function toRad(value) {

  return value * Math.PI / 180;

}


// =========================
// GPSエラー
// =========================

function error(err) {

  console.error(err);

  alert("GPS取得失敗");

}