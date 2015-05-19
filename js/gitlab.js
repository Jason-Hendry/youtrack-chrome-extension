var GitLabUrl = null;
var tablink = document.location.href + "";
var youtrackRegex = new RegExp('((MXT|W)[- ]([0-9]+))', 'gi');

chrome.runtime.sendMessage({method: "getGitLabUrl"}, function (response) {
    GitLabUrl = response.url;
    console.log(GitLabUrl);
    if (tablink !== null && tablink.indexOf(GitLabUrl) !== -1) {
        initGitLab();
    }
});


function findYouTrackLinks() {
    if (match = youtrackRegex.exec($('h4.title').text())) {
        $('h4.title').html($('h4.title').html().replace(match[1], '<cite class="you-track">' + match[1] + '</cite>'));
    }
    $('a.commit-row-message, a.row_title').each(function () {
        if (match = youtrackRegex.exec($(this).text())) {
            $(this).html($(this).html().replace(match[1], '<cite class="you-track">' + match[1] + '</cite>'));
        }
    })
    $('cite.you-track').mouseout(function () {
        var issueId = ($(this).text() + "").toUpperCase().trim().replace(/\s+/g, '-');
        $('#_'+issueId+'_content').remove();
    });
    $('cite.you-track').mouseover(function () {
        var hoverElement = this;
        var issueId = ($(this).text() + "").toUpperCase().trim().replace(/\s+/g, '-');
        getIssue(issueId, function (issue) {
            var popover = issuePopover(issue);
            var destination = $(hoverElement).offset();
            popover.css({top: destination.top+$(hoverElement).height(), left: destination.left});
            $('body').append(popover);
        });
    });
}

function initGitLab() {
    findYouTrackLinks();
}