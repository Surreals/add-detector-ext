const API_ENDPOINT = "http://localhost:3000/detect_ads"; // Заміна на ваше реальне API

function storeAdSegments(ad_segments) {
  chrome.storage.local.set({ adSegments: ad_segments }, function () {
    console.log("Ad segments are stored");
  });
}

// Отримання рекламних таймкодів з API
async function fetchAdSegments(videoId) {
  console.log(`[MOCK] Returning ad segments for video ${videoId}`);

  // TODO: Uncomment when backend is ready
  // try {
  //   const response = await fetch(API_ENDPOINT, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({ youtube_url: `https://www.youtube.com/watch?v=${videoId}` }),
  //   });

  //   if (!response.ok) {
  //     throw new Error(`Error fetching ad segments: ${response.statusText}`);
  //   }

  //   const data = await response.json();
  //   return data.ad_timings || [];
  // } catch (error) {
  //   console.error(error);
  // }

  // Always return mock data for now
  return [
    { start_time: "0:20", end_time: "2:16" },
    { start_time: "4:00", end_time: "5:00" },
  ];
}
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  console.log('onMessage', request)
  if (request.action === "skipAds") {
    const videoId = request.videoId;

    // Запит рекламних сегментів через API
    const ad_segments = await fetchAdSegments(videoId);
    // console.log('ad_segments', ad_segments)
    storeAdSegments(ad_segments);
    sendResponse(ad_segments);
  } else if (request.action === "getAds") {
    chrome.storage.local.get("adSegments", function (result) {
      sendResponse(result.adSegments || []);
    });
  }
  return true; // Повертаємо true, щоб вказати на асинхронну відповідь
});
