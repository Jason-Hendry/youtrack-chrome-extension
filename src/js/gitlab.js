


function findYouTrackLinks() {
    var match = [];
    youtrackRegex.lastIndex = 0; // Reset Regex
    var $title = $('h4.title');
    if (match = youtrackRegex.exec($title.text())) {
        if($title.find('.you-track').length == 0) {
            $title.html($title.html().replace(match[1], match[1] + ' <a target="_blank" class="you-track" data-src="'+textToIssue(match[1])+'" href="' + YouTrackRestUrl + '/issue/' + textToIssue(match[1]) + '"><img class="icon-youtrack" src="' + chrome.extension.getURL("youtrack32-h-57353868.png") + '"></a>'));
        }
    }
    // Commit List on merge request Page
    $('a.commit-row-message, a.row_title').each(function () {
        if($(this).find('.you-track').length == 0) {
            youtrackRegex.lastIndex = 0; // Reset Regex
            match = youtrackRegex.exec($(this).text());
            if (match) {
                $(this).html($(this).html().replace(match[1], match[1]+' <a target="_blank" class="you-track" data-src="'+textToIssue(match[1])+'" href="' + YouTrackRestUrl + '/issue/' + textToIssue(match[1]) + '"><img class="icon-youtrack" src="' + chrome.extension.getURL("youtrack32-h-57353868.png") + '"></a>'));
            }
        }
    });

}

function textToIssue(text) {
    return text.toUpperCase().replace(' ','-');
}

function handleMergeRequest() {
    $('body').on('click','input.accept_merge_request',function() {

        if (match = youtrackRegex.exec($('h4.title').text())) {
            getIssue(textToIssue(match[1]),function(data) {
                if(youTrackMergeCommand) {
                    if (!youTrackCommandPrompt || confirm(data.id + " not in valid state for deployment: " + data.State + ' Apply Anyway')) {
                        alert("Command applied to " + data.id + ": State Awaiting Testing");
                        applyCommand(data.id, youTrackMergeCommand);
                    }
                }
            });
        }
    });
}

function youTrackLinkHover() {
    $('body')
        .on('mouseout', '.you-track', function () {
            var issueId = $(this).attr('data-src');
            $('.popupDiv').remove();
        })
        .on('mouseover', '.you-track', function () {
            $('.popupDiv').remove();
            var hoverElement = this;
            var issueId = $(this).attr('data-src');
            console.log(issueId, this);
            getIssue(issueId, function (issue) {
                var popover = issuePopover(issue);
                var destination = $(hoverElement).offset();
                popover.css({top: destination.top + $(hoverElement).height(), left: destination.left});
                $('body').append(popover);
            });
        })
    ;
}

var observer = null;

function observeBody() {
    // select the target node
    var target = document.body;

// create an observer instance
    observer = new MutationObserver(function(mutations) {
        findYouTrackLinks();
        observer.disconnect();
        observeBody();
    });

// configuration of the observer:
    var config = { attributes: true, childList: true, characterData: true };

// pass in the target node, as well as the observer options
    observer.observe(target, config);
}

function initGitLab() {

    findYouTrackLinks();
    youTrackLinkHover();
    handleMergeRequest();
    observeBody();

}