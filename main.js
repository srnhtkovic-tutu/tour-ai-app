      const spots = [
        { name: "嵐山の渡月橋",
          lat: 35.01267,
          lon: 135.677746,
          description: "京都の嵐山。四季折々の山並みの景色が美しい。食べ歩きも人気",
          vibe: "にぎやか・観光向け" },
        { name: "東映太秦映画村",
          lat: 35.016189,
          lon: 135.708637,
          description: "太秦駅から３分。江戸時代の生活文化を体験できる",
          vibe: "にぎやか・観光向け" },
        { name: "太秦乾公園",
          lat: 35.01826871,
          lon: 135.69797022,
          description: "太秦の公園。近くに住む子供たちが楽しく遊ぶ公園",
          vibe: "まったり・京都にとけ込みたい人向け" }
      ];
// ===== GPS取得 =====
function getLocation() {
  navigator.geolocation.getCurrentPosition(success, error);
}

function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  document.getElementById("status").innerText =
    `現在地: ${lat}, ${lon}`;

  const nearest = findNearestSpot(lat, lon);

  document.getElementById("result").innerText =
    `最寄りスポット: ${nearest.name}`;

  // AIに説明を作らせる
  generateGuide(nearest);
}

function error() {
  alert("位置情報を取得できません");
}

// ===== 距離計算 =====
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半径(km)

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// ===== 最寄りスポット判定 =====
function findNearestSpot(lat, lon) {
  let minDist = Infinity;
  let nearest = null;

  for (let spot of spots) {
    const dist = getDistance(lat, lon, spot.lat, spot.lon);

    if (dist < minDist) {
      minDist = dist;
      nearest = spot;
    }
  }

  return nearest;
}

// ===== AI呼び出し =====
function generateGuide(spot) {
  const guide = `${spot.name}へようこそ！ここは${spot.description}です。ぜひ楽しんでください。`;

  document.getElementById("result").innerText += "\n\n" + guide;
}