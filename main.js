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

// ======================
// スライダーUI
// ======================

const slider =
  document.getElementById(
    "distanceSlider"
  );

const distanceValue =
  document.getElementById(
    "distanceValue"
  );



// 初期距離
let GUIDE_DISTANCE =
  Number(slider.value);



// スライダー変更
slider.addEventListener(

  "input",

  function() {

    GUIDE_DISTANCE =
      Number(slider.value);



    distanceValue.textContent =
      GUIDE_DISTANCE + "m";



    console.log(
      "案内距離変更:",
      GUIDE_DISTANCE
    );

  }

);




// ======================
// 案内管理
// ======================

// 一度案内したスポット
const guidedSpots = new Set();


// 現在滞在対象スポット
let currentStaySpotId = null;


// 滞在開始時刻
let stayStartTime = 0;



// 滞在条件
const STAY_TIME =
  30 * 1000;



// 案内後クールダウン
let lastGuideTime = 0;

const GUIDE_COOLDOWN =
  3 * 60 * 1000;



alert("Tour AI 起動");




// ======================
// GPS監視開始
// ======================

navigator.geolocation.watchPosition(

  function(position) {

    const userLat =
      position.coords.latitude;

    const userLng =
      position.coords.longitude;

    const now =
      Date.now();



    console.log(
      "現在地:",
      userLat,
      userLng
    );



    // クールダウン中
    if (
      now - lastGuideTime
      < GUIDE_COOLDOWN
    ) {

      console.log(
        "クールダウン中"
      );

      return;
    }



    let nearestSpot = null;

    let nearestDistance =
      Infinity;



    // ======================
    // 最寄りスポット探索
    // ======================

    for (const spot of spots) {

      // 案内済み除外
      if (
        guidedSpots.has(spot.id)
      ) {

        continue;

      }



      const distance =
        getDistance(

          userLat,
          userLng,

          spot.lat,
          spot.lng

        );



      console.log(

        spot.name,

        Math.round(distance) + "m"

      );



      // 範囲内のみ
      if (
        distance <= GUIDE_DISTANCE
      ) {

        // 最短更新
        if (
          distance
          < nearestDistance
        ) {

          nearestDistance =
            distance;

          nearestSpot =
            spot;

        }

      }

    }



    // ======================
    // 範囲内なし
    // ======================

    if (!nearestSpot) {

      currentStaySpotId =
        null;

      stayStartTime = 0;

      return;

    }



    // ======================
    // 滞在対象切替
    // ======================

    if (
      currentStaySpotId
      !== nearestSpot.id
    ) {

      currentStaySpotId =
        nearestSpot.id;

      stayStartTime =
        now;



      console.log(

        "滞在開始:",

        nearestSpot.name

      );



      return;

    }



    // ======================
    // 滞在時間計算
    // ======================

    const stayTime =
      now - stayStartTime;



    console.log(

      "滞在秒数:",

      Math.round(
        stayTime / 1000
      )

    );



    // ======================
    // 滞在条件達成
    // ======================

    if (
      stayTime >= STAY_TIME
    ) {

      alert(

        nearestSpot.name +
        "\n\n" +

        nearestSpot.description +
        "\n\n" +

        "雰囲気: " +
        nearestSpot.vibe

      );



      console.log(

        "案内:",

        nearestSpot.name

      );



      // 案内済みに追加
      guidedSpots.add(
        nearestSpot.id
      );



      // クールダウン開始
      lastGuideTime =
        now;



      // 滞在リセット
      currentStaySpotId =
        null;

      stayStartTime = 0;

    }

  },



  // GPS取得失敗
  function(error) {

    console.error(error);

  },



  // GPSオプション
  {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 10000
  }

);






// ======================
// 距離計算
// ======================

function getDistance(

  lat1,
  lng1,

  lat2,
  lng2

) {

  const R = 6371000;



  const dLat =

    (lat2 - lat1)
    * Math.PI / 180;



  const dLng =

    (lng2 - lng1)
    * Math.PI / 180;



  const a =

    Math.sin(dLat / 2)
    *
    Math.sin(dLat / 2)

    +

    Math.cos(
      lat1 * Math.PI / 180
    )

    *

    Math.cos(
      lat2 * Math.PI / 180
    )

    *

    Math.sin(dLng / 2)
    *
    Math.sin(dLng / 2);



  const c =

    2 * Math.atan2(

      Math.sqrt(a),

      Math.sqrt(1 - a)

    );



  return R * c;

}