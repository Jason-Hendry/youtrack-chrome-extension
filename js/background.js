chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getUrl")
        sendResponse({url: localStorage['url']});
    else
        sendResponse({}); // snub them.
});