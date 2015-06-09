var GitLabUrl = null;
var youtrackRegex = new RegExp('((MXT|W|D|DW|BI|WEB)[- ]([0-9]+))', 'gi');
var youTrackMergeCommand = '';
var youTrackCommandPrompt = false;

var YouTrackRestUrl = null;
var tabLink = document.location.href+"";

chrome.runtime.sendMessage({method: "getSettings"}, function (response) {

    console.log('response', response);

    YouTrackRestUrl = response.url;
    YouTrackRestUrl = YouTrackRestUrl.replace(/\/$/, ''); // Trim trailing slash

    GitLabUrl = response.gitlab_url;
    GitLabUrl = GitLabUrl.replace(/\/$/, ''); // Trim trailing slash

    youTrackMergeCommand = response.you_track_merge_command;
    youTrackCommandPrompt = response.command_prompt == 1;

    if (tabLink !== null && tabLink.indexOf(GitLabUrl) !== -1) {
        initGitLab();
    }
    if(tabLink !== null && tabLink.indexOf(YouTrackRestUrl) !== -1) {
        initYouTrack();
    }
});

