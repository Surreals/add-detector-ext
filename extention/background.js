const API_ENDPOINT = "http://localhost:3000/detect_ads"; // Заміна на ваше реальне API

function storeAdSegments(ad_segments) {
  chrome.storage.local.set({ adSegments: ad_segments }, function () {
    console.log("Ad segments are stored");
  });
}

// Отримання рекламних таймкодів з API
async function fetchAdSegments(videoId) {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ youtube_url: `https://www.youtube.com/watch?v=${videoId}` }),
    });

    if (!response.ok) {
      throw new Error(`Error fetching ad segments: ${response.statusText}`);
    }

    const data = await response.json();
    return data.ad_timings || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.action === "skipAds") {
    const videoId = request.videoId;

    // Запит рекламних сегментів через API
    const ad_segments = await fetchAdSegments(videoId);
    storeAdSegments(ad_segments);
    sendResponse(ad_segments);
  } else if (request.action === "getAds") {
    chrome.storage.local.get("adSegments", function (result) {
      sendResponse(result.adSegments || []);
    });
  }
  return true; // Повертаємо true, щоб вказати на асинхронну відповідь
});
