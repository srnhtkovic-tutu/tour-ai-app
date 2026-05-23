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

// 一度案内したスポットを保存
const guidedSpots = new Set();


// 何m以内で案内するか
const GUIDE_DISTANCE = 100;



// 常時監視開始
navigator.geolocation.watchPosition(

  function(position) {

    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    console.log("現在地:", userLat, userLng);


    let nearestSpot = null;
    let nearestDistance = Infinity;


    // 全スポット確認
    for (const spot of spots) {

      // すでに案内済みならスキップ
      if (guidedSpots.has(spot.id)) {
        continue;
      }


      const distance = getDistance(
        userLat,
        userLng,
        spot.lat,
        spot.lng
      );

      console.log(spot.name, Math.round(distance) + "m");


      // 最も近いスポット更新
      if (distance < nearestDistance) {

        nearestDistance = distance;
        nearestSpot = spot;

      }

    }



    // 一番近いスポットが案内範囲内なら案内
    if (
      nearestSpot &&
      nearestDistance <= GUIDE_DISTANCE
    ) {

      console.log("案内開始:", nearestSpot.name);

      alert(
        "近くに " +
        nearestSpot.name +
        " があります"
      );


      // 案内済みに追加
      guidedSpots.add(nearestSpot.id);

    }

  },



  function(error) {

    console.error(error);

  },



  {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000
  }

);





// 距離計算
function getDistance(lat1, lng1, lat2, lng2) {

  const R = 6371000;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}