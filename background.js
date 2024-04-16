const API_KEY = 'YOUR_YOUTUBE_API_KEY';
const mockAdTimes = {
    endTime: 120 // This means skip to 2 minutes into the video
  };

  chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.action === "skipAds") {
        // setInterval(() => sendResponse({adTimes: mockAdTimes}), 30000)
        await startSegmentedTranscriptRequests(request.videoId, sendResponse);
        
        return true;
      // const videoId = request.videoId;
      // const url = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${API_KEY}`;
  
      // fetch(url)
      //   .then(response => response.json())
      //   .then(data => {
      //     if (data.items && data.items.length > 0) {
      //       // Assuming you want the first available caption
      //       const captionId = data.items[0].id;
      //       fetchCaptionDetails(captionId, sendResponse);
      //     } else {
      //       sendResponse({ error: "No captions available" });
      //     }
      //   })
      //   .catch(error => sendResponse({ error: error.message }));
      // return true;  // Indicates async response
    }
  });
  
  function startSegmentedTranscriptRequests(videoId, sendResponse) {
    let minutesPassed = 0;
    setInterval(() => {
      fetchTranscript(videoId, minutesPassed, sendResponse)
        .then(segment => sendTranscriptToAdAPI(segment))
        .then(adTimes => sendResponse({adTimes}))
        .catch(error => sendResponse({error: error.message}));
      minutesPassed += 2;
    }, 60000); // Request every minute
  }

function fetchTranscript(videoId, startMinutes) {
  return Promise.resolve([]);

  return fetch(`https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      // Assuming `getTranscriptTextFromData` is a function you define to extract text
      const fullTranscript = getTranscriptTextFromData(data);
      // Extract 2-minute segment based on `startMinutes`
      const segmentStart = startMinutes * 60; // start time in seconds
      const segmentEnd = (startMinutes + 2) * 60; // end time in seconds
      return fullTranscript.slice(segmentStart, segmentEnd);
    });
}

function sendTranscriptToAdAPI(segment) {
  // logix
  return {adTimes: mockAdTimes}
}