chrome.runtime.sendMessage(
  {
    action: "skipAds",
    videoId: extractVideoIdFromUrl(),
  },
  (response) => {
    if (response && response.error) {
      console.error("Error fetching ad segments:", response.error);
      return;
    } else if (response) {
      console.log("Ad times data:", response);
      initializeAdSkipping(response);
    }
  }
);

function extractVideoIdFromUrl() {
  // Витягання параметра "v" з URL відео
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get("v");
  console.log("videoId", videoId);

  if (!videoId) {
    // Якщо URL не містить параметр "v", перевіряємо альтернативний формат
    const urlPath = window.location.pathname;
    const match = urlPath.match(/\/watch\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  return videoId;
}

function initializeAdSkipping(ad_segments) {
  const player = document.querySelector("video");
  if (!player) {
    console.error("No video player found");
    return;
  }

  console.log('initializeAdSkipping', ad_segments, player)

  ad_segments.forEach((ad_segment) => {
    const startSeconds = convertToSeconds(ad_segment.start_time);
    const endSeconds = convertToSeconds(ad_segment.end_time);

    player.addEventListener("timeupdate", () => {
      const currentTime = player.currentTime;
      ad_segments.forEach((ad) => {
        const start = convertToSeconds(ad.start_time);
        const end = convertToSeconds(ad.end_time);
        if (currentTime >= start && currentTime < end) {
          console.log("Skipping ad segment:", ad);
          player.currentTime = end;
        }
      });
    });
  });
}

function convertToSeconds(time) {
  const parts = time.split(":");
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  return minutes * 60 + seconds;
}
