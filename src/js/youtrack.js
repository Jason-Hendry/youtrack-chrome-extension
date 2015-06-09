function isArray(variable) {
    if( Object.prototype.toString.call( variable ) === '[object Array]' ) {
        return true;
    }
    return false;
}

function toJob(obj) {
    var keep = {
        summary: 1,
        description: 1,
        created: 1,
        updated: 1,
        updaterName: 1,
        resolved: 1,
        reporterName: 1,
        commentsCount: 1,
        Priority: 1,
        Type: 1,
        State: 1,
        Subsystem: 1,
        "Spent time": 1
    };
    var job = {
        id: obj.id,
        parent: null,
        subTasks: [],
        related: []
    };
    for(var i=0;i<obj.field.length;i++) {
        var name = obj.field[i].name;
        var value = obj.field[i].value;

        if(keep[name]) {
            if(isArray(value)) {
                job[name] = value[0];
            } else {
                job[name] = value;
            }
        } else if(name == 'links') {
            for(var j=0;j<value.length;j++) {
                if(value[j]['type'] == 'Subtask') {
                    job.subTasks.push(value[j]['value']);
                }
                else if(value[j]['type'] == 'Parent') {
                    job.parent = value[j]['value'];
                } else {
                    job.related.push(value[j]['value']);
                }
            }
//            console.log(JSON.stringify(value,null,2));
        }

    }

    return job;
}


issuePopover = function(issue) {
    if(!issue) {
        $html = $('<div id="_not_found_content" class="popupDiv"><span id="detailedSummary:"><div class="issueDetailsPopup yt">Not Found</span></div>');
        return $html;
    }
    var priorityMap = {
        'Critical': 'p1',
        'Major': 'p2',
        'Normal': 'p3',
        'Minor': 'p4'
    };
    $html = $('<div id="_'+issue.id+'_content" class="popupDiv">' +
    '<span id="detailedSummary:'+(issue.id)+'"><div class="issueDetailsPopup yt">' +
    '<table class="main">' +
    '<tbody><tr class="">' +
    '<td>'+(issue.id)+'</td>' +
    '<td>'+(issue.summary)+'</td>' +
    '</tr>' +
    '</tbody></table>' +
    '<table class="other">' +
    '<tbody><tr>' +
    '<td title="Priority" class="priority '+(priorityMap[issue.Priority])+'"><div>'+(issue.Priority)+'</div></td>' +
    '<td title="Type" class="type  ">'+(issue.Type)+'</td>' +
    '<td title="State" class="state ">'+(issue.State)+'</td>' +
    '</tr> </tbody></table> </div> </span> </div>');
    return $html;
}


// For testing in NodeJS @TODO: Setup Karma or JS Unit Testing
// console.log(JSON.stringify(toJob({"id":"MXT-2733","entityId":"76-6800","jiraId":null,"field":[{"name":"projectShortName","value":"MXT"},{"name":"numberInProject","value":"2733"},{"name":"summary","value":"Missing Outgoing SMS Reports"},{"name":"created","value":"1417479815874"},{"name":"updated","value":"1427689918439"},{"name":"updaterName","value":"min.choi"},{"name":"updaterFullName","value":"Min Choi"},{"name":"reporterName","value":"jason"},{"name":"reporterFullName","value":"Jason Hendry"},{"name":"commentsCount","value":"8"},{"name":"votes","value":"0"},{"name":"links","value":[{"type":"Subtask","role":"parent for","value":"MXT-2719"},{"type":"Subtask","role":"parent for","value":"MXT-2734"},{"type":"Subtask","role":"parent for","value":"W-1197"},{"type":"Subtask","role":"parent for","value":"W-1198"},{"type":"Subtask","role":"parent for","value":"MXT-2747"},{"type":"Subtask","role":"parent for","value":"MXT-2763"},{"type":"Subtask","role":"parent for","value":"MXT-2766"},{"type":"Subtask","role":"parent for","value":"MXT-2789"},{"type":"Subtask","role":"parent for","value":"MXT-2790"},{"type":"Subtask","role":"parent for","value":"MXT-2791"},{"type":"Subtask","role":"parent for","value":"MXT-2792"},{"type":"Subtask","role":"parent for","value":"MXT-2794"},{"type":"Subtask","role":"parent for","value":"MXT-2801"},{"type":"Subtask","role":"parent for","value":"MXT-2802"},{"type":"Subtask","role":"parent for","value":"MXT-2813"},{"type":"Subtask","role":"parent for","value":"MXT-2814"},{"type":"Subtask","role":"parent for","value":"MXT-2835"},{"type":"Subtask","role":"parent for","value":"MXT-2836"},{"type":"Subtask","role":"parent for","value":"MXT-2839"},{"type":"Subtask","role":"parent for","value":"MXT-2840"},{"type":"Subtask","role":"parent for","value":"MXT-2857"},{"type":"Subtask","role":"parent for","value":"MXT-2860"},{"type":"Subtask","role":"parent for","value":"MXT-2861"},{"type":"Subtask","role":"parent for","value":"MXT-2864"},{"type":"Subtask","role":"parent for","value":"MXT-2865"},{"type":"Subtask","role":"parent for","value":"MXT-2866"},{"type":"Subtask","role":"parent for","value":"MXT-2867"},{"type":"Subtask","role":"parent for","value":"MXT-2872"},{"type":"Subtask","role":"parent for","value":"MXT-2875"},{"type":"Subtask","role":"parent for","value":"MXT-2883"},{"type":"Subtask","role":"parent for","value":"MXT-2884"},{"type":"Subtask","role":"parent for","value":"MXT-2886"},{"type":"Subtask","role":"parent for","value":"MXT-2887"},{"type":"Subtask","role":"parent for","value":"MXT-2888"},{"type":"Subtask","role":"parent for","value":"MXT-2890"},{"type":"Subtask","role":"parent for","value":"MXT-2891"},{"type":"Subtask","role":"parent for","value":"MXT-2894"},{"type":"Subtask","role":"parent for","value":"MXT-2896"},{"type":"Subtask","role":"parent for","value":"MXT-2897"},{"type":"Subtask","role":"parent for","value":"MXT-2898"},{"type":"Subtask","role":"parent for","value":"MXT-2908"},{"type":"Subtask","role":"parent for","value":"MXT-2911"},{"type":"Subtask","role":"parent for","value":"MXT-2915"},{"type":"Subtask","role":"parent for","value":"MXT-2916"},{"type":"Subtask","role":"parent for","value":"MXT-2920"},{"type":"Subtask","role":"parent for","value":"MXT-2925"},{"type":"Subtask","role":"parent for","value":"MXT-2927"},{"type":"Subtask","role":"parent for","value":"MXT-2929"},{"type":"Subtask","role":"parent for","value":"MXT-2953"},{"type":"Subtask","role":"parent for","value":"MXT-2961"},{"type":"Subtask","role":"parent for","value":"MXT-2962"},{"type":"Subtask","role":"parent for","value":"MXT-2963"},{"type":"Subtask","role":"parent for","value":"MXT-2964"},{"type":"Subtask","role":"parent for","value":"MXT-2965"},{"type":"Subtask","role":"parent for","value":"MXT-2969"},{"type":"Subtask","role":"parent for","value":"MXT-2977"},{"type":"Subtask","role":"parent for","value":"MXT-2980"},{"type":"Subtask","role":"parent for","value":"MXT-3129"},{"type":"Subtask","role":"parent for","value":"MXT-3137"},{"type":"Subtask","role":"parent for","value":"MXT-3138"},{"type":"Subtask","role":"parent for","value":"MXT-3155"},{"type":"Subtask","role":"parent for","value":"MXT-3189"},{"type":"Subtask","role":"parent for","value":"MXT-3190"},{"type":"Subtask","role":"parent for","value":"MXT-3229"},{"type":"Subtask","role":"parent for","value":"MXT-3233"},{"type":"Subtask","role":"parent for","value":"MXT-3240"},{"type":"Subtask","role":"parent for","value":"W-1505"},{"type":"Subtask","role":"parent for","value":"W-1506"},{"type":"Subtask","role":"parent for","value":"W-1979"},{"type":"Subtask","role":"parent for","value":"W-1984"},{"type":"Subtask","role":"parent for","value":"W-1993"},{"type":"Subtask","role":"parent for","value":"W-1997"},{"type":"Subtask","role":"parent for","value":"W-2031"},{"type":"Subtask","role":"parent for","value":"W-2033"},{"type":"Subtask","role":"parent for","value":"W-2036"},{"type":"Subtask","role":"parent for","value":"W-2121"},{"type":"Subtask","role":"parent for","value":"W-2127"},{"type":"Subtask","role":"parent for","value":"W-2139"},{"type":"Subtask","role":"parent for","value":"W-2151"},{"type":"Subtask","role":"parent for","value":"W-2194"},{"type":"Subtask","role":"parent for","value":"W-2235"},{"type":"Subtask","role":"parent for","value":"W-2239"},{"type":"Subtask","role":"parent for","value":"W-2250"},{"type":"Subtask","role":"parent for","value":"W-2264"},{"type":"Subtask","role":"parent for","value":"W-2457"},{"type":"Subtask","role":"parent for","value":"W-2459"},{"type":"Subtask","role":"parent for","value":"W-2462"},{"type":"Subtask","role":"parent for","value":"W-2473"},{"type":"Subtask","role":"parent for","value":"W-2474"},{"type":"Subtask","role":"parent for","value":"W-2478"},{"type":"Subtask","role":"parent for","value":"W-2479"},{"type":"Subtask","role":"parent for","value":"W-2480"},{"type":"Subtask","role":"parent for","value":"W-2485"}]},{"name":"Priority","value":["Normal"],"valueId":["Normal"],"color":{"bg":"#ebf4dd","fg":"#64992C"}},{"name":"Type","value":["Task"],"valueId":["Task"]},{"name":"State","value":["Submitted"],"valueId":["Submitted"]},{"name":"Subsystem","value":["Reporting"],"valueId":[],"color":{"bg":"#339933","fg":"white"}},{"name":"Fix versions","value":["1.32"],"valueId":[]},{"name":"Spent time","value":["16332"],"valueId":[]}],"comment":[{"id":"81-4172","author":"rohit.thadhani","authorFullName":"Rohit Thadhani","issueId":"MXT-2733","parentId":null,"deleted":false,"jiraId":null,"text":"http://whugho.smsglobal.com/user_view.php?user_id=28559611\ndunc01v1\nno data available","shownForIssueAuthor":false,"created":1418861405509,"updated":null,"permittedGroup":null,"replies":[]},{"id":"81-4206","author":"christian","authorFullName":"Christian Mueller","issueId":"MXT-2733","parentId":null,"deleted":false,"jiraId":null,"text":"\nInformation\nID\t126296\nUsername\tburtonpd\n\nno data ","shownForIssueAuthor":false,"created":1419201639495,"updated":null,"permittedGroup":null,"replies":[]},{"id":"81-4214","author":"christian","authorFullName":"Christian Mueller","issueId":"MXT-2733","parentId":null,"deleted":false,"jiraId":null,"text":"ID\t28568471\nUsername\t1xh5wwml\nno data ","shownForIssueAuthor":false,"created":1419213268186,"updated":1419201639485,"permittedGroup":null,"replies":[]},{"id":"81-4327","author":"christian","authorFullName":"Christian Mueller","issueId":"MXT-2733","parentId":null,"deleted":false,"jiraId":null,"text":"\nInformation\nID\t33109\nUsername\tAIFS\n\nNot all messages are available in the outgoing reports.","shownForIssueAuthor":false,"created":1419824444620,"updated":1419213268175,"permittedGroup":null,"replies":[]},{"id":"81-4405","author":"christian","authorFullName":"Christian Mueller","issueId":"MXT-2733","parentId":null,"deleted":false,"jiraId":null,"text":"ID\t28443272\nUsername\thbcpqd10","shownForIssueAuthor":false,"created":1419992863952,"updated":1419824444609,"permittedGroup":null,"replies":[]},{"id":"81-4447","author":"christian","authorFullName":"Christian Mueller","issueId":"MXT-2733","parentId":null,"deleted":false,"jiraId":null,"text":"\nInformation\nID\t28596792\nUsername\tscv2jfjq","shownForIssueAuthor":false,"created":1420169911447,"updated":1419992863944,"permittedGroup":null,"replies":[]},{"id":"81-5088","author":"abdur","authorFullName":"Abdur Rehman Kureshi","issueId":"MXT-2733","parentId":null,"deleted":false,"jiraId":null,"text":"Another account. ID # 29411651 and Username # 2botv44y","shownForIssueAuthor":false,"created":1421753345738,"updated":null,"permittedGroup":null,"replies":[]},{"id":"81-6717","author":"micslon","authorFullName":"Michael Sloan","issueId":"MXT-2733","parentId":null,"deleted":false,"jiraId":null,"text":"Also User ID: 73998/Southern \n","shownForIssueAuthor":false,"created":1426721597478,"updated":null,"permittedGroup":null,"replies":[]}],"tag":[]}),null,2));
// process.exit(1);


var YouTrackRestUrl = null;
var tablink = document.location.href+"";

chrome.runtime.sendMessage({method: "getYouTrackUrl"}, function(response) {
    YouTrackRestUrl = response.url;
    YouTrackRestUrl = YouTrackRestUrl.replace(/\/$/, ''); // Trim trailing slash
    if(tablink !== null && tablink.indexOf(YouTrackRestUrl) !== -1) {
        initYouTrack();
    }
});

function applyCommand(issue,command) {
    $.ajax(YouTrackRestUrl+'/rest/issue/'+issue+'/execute', {
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
    $.ajax(YouTrackRestUrl+'/rest/issue',{
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


var jobCache = {};

function getIssue(issue,callback) {
    if(jobCache[issue] !== undefined) {
        callback(jobCache[issue]);
        return;
    }
    $.ajax(YouTrackRestUrl+'/rest/issue/'+issue, {
        method: 'GET',
        crossDomain: true,
        headers: { Accept: "application/json" },
        success: function(data) {
            if(data.value == 'Issue no found.') {
                jobCache[issue] = false;
                callback(false);
            } else {
                var job = toJob(data);
                jobCache[issue] = job;
                callback(job);
            }
        }
    });
}


function findInProgress() {
    $.ajax(YouTrackRestUrl+'/rest/issue',{
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

function initYouTrack() {

}