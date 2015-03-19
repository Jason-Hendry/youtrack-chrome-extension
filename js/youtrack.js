// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var baseRestUrl = null;

chrome.runtime.sendMessage({method: "getUrl"}, function(response) {
    baseRestUrl = response.url;
    console.log(baseRestUrl);
    findInProgress();
});
//var baseRestUrl = 'http://youtrack.smsglobal.com';

function applyCommand(issue,command) {
    $.ajax(baseRestUrl+'/rest/issue/'+issue+'/execute', {
        method: 'POST',
        crossDomain: true,
        data: {
            'command': command
        },
        success: function(data,arg2,arg3) {
            console.log(data,arg2,arg3);
        }
    });
}

issueDoc = null;

function addTask() {
    var $parent = $(this).closest('.sb-task');
    var parentTask = $parent.attr('id');
    var project = parentTask.split('-')[0];
    var summary = $(this).val();
    $.ajax(baseRestUrl+'/rest/issue',{
        method: 'POST',
        crossDomain: true,
        data: {
            'project': project,
            'summary': summary
        },
        success: function(data,arg2,arg3) {
            addSubtask(parentTask, summary);
            var issue = data.getElementsByTagName('issue')[0].id;
            applyCommand(issue,"subtask of "+parentTask);

        }
    });
}


function findInProgress() {
    $.ajax(baseRestUrl+'/rest/issue',{
        method: 'GET',
        crossDomain: true,
        data: {
            'filter': "#me #{In Progress}"
        },
        success: function(data,arg2,arg3) {
            console.log(data);
            var issues = data.getElementsByTagName("issueCompacts");
            console.log(issues);
            var inProgress = issues[0].getElementsByTagName("issue")[0].id;
            console.log(inProgress);
            $button = $('#'+inProgress+' button');
            if($button) {
                $button.text('✓');
                $button.attr('title', 'Mark Fixed');
                $button.click(markFixed);
            }
            $('#'+inProgress).addClass('sg-in-progress');
        }
    });
}


function addSubtask(parent,summary) {
    var $li = $('<li>');
    $li.text(summary);
    $('#'+parent+' li.sg-new-item').before($li);
}

function markFixed() {
    var issue = $(this).attr('data-src');
    var summary = $(this).closest('li').text();
    var $li = $(this).closest('li');
    $(this).remove();
    var $span = $('<span>');
    $span.addClass('sb-issue-resolved');
    $span.text(summary);
    $li.text('');
    $li.append($span);
    applyCommand(issue,"State Fixed");
}
function markInProgress() {
    var issue = $(this).attr('data-src');
    $(this).text('✓');
    $(this).attr('title','Mark Fixed');
    $(this).click(markFixed);
    $(this).closest('li').addClass('sg-in-progress');
    applyCommand(issue,"State In Progress");
}

if($('.sb-board-name').text().match(/Agile Board/)) {

    $('.sb-task-subtasks').each(function () {
        var $task = $('<input>');
        $task.attr('placeholder', 'New Subtask');
        $task.click(function(event) {
            event.stopPropagation();
        });
        $task.mousedown(function(event) {
            event.stopPropagation();
        });
        $task.keypress(function(e) {
            if(e.which == 13) {
                addTask.apply(this);
            }
        });
        var $li = $('<li>');
        $li.addClass('sg-new-item');
        $li.append($task);

        $(this).append($li);
    });

    $('.sb-task-subtask-item').each(function () {
        if($(this).hasClass('sg-in-progress')) {
            var $start = $('<button>');
            $start.attr('data-src', $(this).attr('id'));
            $start.text('✓');
            $start.attr('title','Mark Fixed');
            $start.addClass('sg-button');
            $start.click(markFixed);
            $(this).prepend($start);
        } else if ($(this).find('.sb-issue-resolved').length) {

        } else {
            var $start = $('<button>');
            $start.attr('data-src', $(this).attr('id'));
            $start.text('▶');
            $start.attr('title','Mark In Progress');
            $start.addClass('sg-button');
            $start.click(markInProgress);
            $(this).prepend($start);
        }
    });

}