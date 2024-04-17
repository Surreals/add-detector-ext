// Response example
// [
//   {
//     start_time: "1:21",
//     end_time: "2:16",
//   },
// ]

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
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("v");
}

function initializeAdSkipping(ad_segments) {
  const player = document.querySelector("video");
  if (!player) {
    console.error("No video player found");
    return;
  }

  ad_segments.forEach((ad_segment, ind) => {
    const startSeconds = convertToSeconds(ad_segment.start_time);
    const endSeconds = convertToSeconds(ad_segment.end_time);

    player.addEventListener(`timeupdate-${ind}`, function onTimeUpdate() {
      // When current time is within the ad segment, skip to end time
      if (player.currentTime >= startSeconds && player.currentTime < endSeconds) {
        console.log("currentTime", player.currentTime, ad_segment);
        player.currentTime = endSeconds; // Move the video to the end of the ad
        player.removeEventListener(`timeupdate-${ind}`, onTimeUpdate);
      }
    });
  });
}

function convertToSeconds(time) {
  const parts = time.split(":");
  const minutes = parseInt(parts[0], 10);
  const seconds = parseInt(parts[1], 10);
  return minutes * 60 + seconds;
}
