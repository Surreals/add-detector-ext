function getAdSegments(callback) {
  chrome.storage.local.get("adSegments", function (result) {
    if (result.adSegments) {
      callback(result.adSegments);
    } else {
      callback([]);
    }
  });
}

getAdSegments(function (ad_segments) {
  const adList = document.getElementById("adList");
  ad_segments.forEach((ad) => {
    const li = document.createElement("li");
    li.textContent = `${ad.start_time} - ${ad.end_time}`;
    adList.appendChild(li);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getAds" });
  });
});
