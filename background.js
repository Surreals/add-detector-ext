const API_KEY = "YOUR_YOUTUBE_API_KEY";

function storeAdSegments(ad_segments) {
  chrome.storage.local.set({ adSegments: ad_segments }, function () {
    console.log('Ad segments are stored');
  });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "skipAds") {
    Promise.resolve([{ start_time: "1:21", end_time: "2:16" }])
      .then((ad_segments) => {
        storeAdSegments(ad_segments);
        sendResponse(ad_segments);
      })
      .catch((error) => {
        sendResponse({ error });
      });

    return true; // Must return true to indicate async response
  } else if (request.action === "getAds") {
    sendResponse(ad_segments); // Return the stored ad segments
  }
});

// const videoId = request.videoId;
// const url = `https://www.api.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${API_KEY}`; // make own api

// fetch(url)
//   .then((response) => response.json())
//   .then((data) => {
//     if (data.ad_segments && data.ad_segments.length > 0) {
//       sendResponse({ ad_segments: data.ad_segments });
//     } else {
//       sendResponse({ error: "No captions available" });
//     }
//   })
//   .catch((error) => sendResponse({ error: error.message }));
// return true; // Indicates async response
