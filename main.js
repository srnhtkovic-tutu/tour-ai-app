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
          vibe: "まったり・京都にとけ込みたい人向け" },
        { name: "自宅正面のおうち",
          lat: 35.01799572460345,
          lon: 135.69711429525734,
          description: "正面のおうち。小さな子供たちの声が聞こえてきます",
          vibe: "まったり・京都にとけ込みたい人向け" }
      ];
// ===== 既に案内したスポット =====35.01799572460345, 135.69711429525734
const visited = new Set();

// ===== 距離計算 =====
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

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

// ===== 案内生成 =====
function generateGuide(spot) {

  const text =
    `${spot.name}の近くです。${spot.description}`;

  document.getElementById("result").innerText =
    text;

  // 音声読み上げ
  speechSynthesis.speak(
    new SpeechSynthesisUtterance(text)
  );
}

// ===== 常時監視開始 =====
function startWatch() {

  navigator.geolocation.watchPosition(
    (position) => {

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      document.getElementById("status").innerText =
        `現在地: ${lat}, ${lon}`;

      for (const spot of spots) {

        const dist = getDistance(
          lat,
          lon,
          spot.lat,
          spot.lon
        );

        // 100m以内
        if (dist < 0.05) {

          // 未案内なら
          if (!visited.has(spot.name)) {

            visited.add(spot.name);

            generateGuide(spot);
          }
        }
      }

    },
    (err) => {
      console.error(err);
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    }
  );
}
