var settings = {};

chrome.storage.sync.get(null, function(data) {
    settings = data;
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method == "getSettings") {
        sendResponse(settings);
    } else if (request.method == "setSettings") {
        settings = request.settings;
        sendResponse('Done');
    } else {
        sendResponse({}); // snub them.
    }
});