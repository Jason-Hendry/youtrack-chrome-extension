


function findYouTrackLinks() {
    var match = [];
    youtrackRegex.lastIndex = 0; // Reset Regex
    // Commit List on merge request Page
    $('div.commit-row-title, a.row_title, h4.title, div.event-note').each(function () {
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

function handleAcceptMergeRequest() {
    $('body').on('click','input.accept_merge_request',function() {
        youtrackRegex.lastIndex = 0;
        if (match = youtrackRegex.exec($('h4.title').text())) {
            getIssue(textToIssue(match[1]),function(data) {
                if(youTrackMergeCommand) {
                    if (!youTrackCommandPrompt || confirm(data.id + ' apply command: ' + youTrackMergeCommand)) {
                        applyCommand(data.id, youTrackMergeCommand);
                    }
                }
            });
        }
    });
}

function handleCreateMergeRequest() {
    $('.flash-notice').each(function() {
        if($(this).text().indexOf('Merge request was successfully created.') == -1) {
            return;
        }
        youtrackRegex.lastIndex = 0;
        if (match = youtrackRegex.exec($('h4.title').text())) {
            getIssue(textToIssue(match[1]),function(data) {
                if(youTrackCreateMergeCommand) {
                    if (!youTrackCommandPrompt || confirm(data.id + ' apply command: ' + youTrackCreateMergeCommand)) {
                        applyCommand(data.id, youTrackCreateMergeCommand, document.location.href);
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
    handleAcceptMergeRequest();
    handleCreateMergeRequest();
    observeBody();

}