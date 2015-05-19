chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getYouTrackUrl")
        sendResponse({url: localStorage['url']});
    else if (request.method == "getGitLabUrl")
        sendResponse({url: localStorage['gitlab-url']});
    else
        sendResponse({}); // snub them.
});