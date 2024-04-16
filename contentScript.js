// contentScript.js
function extractVideoIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("v");
}


function skipAds(adEndTime) {
  const player = document.querySelector("video");
  if (player && adEndTime) {
    player.currentTime = adEndTime; // Move the video to the end of the ad
  }
}

chrome.runtime.sendMessage(
  {
    action: "skipAds",
    videoId: extractVideoIdFromUrl(),
  },
  (response) => {
    if (response.error) {
      console.error("Failed to fetch ad times:", response.error);
    } else {
      console.log("Ad times data:", response.adTimes);
      if (response.adTimes && response.adTimes.endTime) {
        skipAds(response.adTimes.endTime);
      }
    }
  }
);
