var smsglobal = smsglobal || {};
smsglobal.youtrack = smsglobal.youtrack || {};

(function(y) {
    y.baseRestUrl = localStorage['url'].replace(/\/$/,'');
    y.stateBreak = localStorage['break_state'];
    y.stateInProgress = 'In Progress';
    y.stateFixed = 'Fixed';
    y.parent = null;
    y.currentJobs = [];
    y.currentStories = {};
    y.currentSprint = '';
    y.init = function() {
        if(y.baseRestUrl == '' || y.stateBreak == '') {
            chrome.tabs.create({url: "options.html"});
            return false;
        }
        //y.loadJobs();
        $('#issues').on('mouseenter','td',null, y.cellHover);
        $('#issues').popover({
            'selector':'[data=job]',
            'placement':'bottom',
            'content': y.jobDetailsPopover,
            'title': y.jobTitle,
            'container':'body',
            'html':true});
        y.getCurrentSprint(function(sprint){
            y.currentSprint = sprint.version;
            $('#sprint').text(sprint.version);
            y.getCompletedInSprint(sprint.version, function(complete){
                $('#sprintComplete').text(complete);
            });
        });
        $('#active-taskboard').click(function(e) {
            var stories = y.getCurrentStories();
            e.preventDefault();
            false;
            var subTasksOf = stories.join(', ');
            var storyTasks = stories.join(' OR #');
            var q = encodeURIComponent('Subtask of: '+subTasksOf+' OR #'+storyTasks);

            window.open('http://youtrack.smsglobal.local/rest/agile/Tasks%20Board-20/sprint/'+ y.currentSprint+'?q='+q);
        });
        y.getJobs('State: {'+ y.stateInProgress+'}',function(jobs){
            for(var i in jobs) {
                y.getLinks(jobs[i].getId(), function(links){
                    if(links.parent) {
                        y.currentStories[links.parent] = 1;
                    }
                })
                $('#issues').append(jobs[i].renderTableRow())
            }
        });
    };
    /**
     * @param search string|array
     * @param callback
     */
    y.getJobs = function(search, callback) {
        var query = '';
        var filter = '';
        if(typeof search == 'object') {
            var params = [];
            for(var i in search) {
                filter = encodeURIComponent(search[i]);
                params.push('filter='+filter)
            }
            query = params.join('&');
        } else {
            filter = encodeURIComponent(search);
            query = 'filter='+filter;
        }
        $.getJSON(y.baseRestUrl+'/rest/issue?max=100&'+query,{},function(data) {
            if(data.searchResult !== undefined) {
                var groups = [];
                for(var j in data.searchResult) {
                    var jobs = [];
                    for(var i=0;i<data.searchResult[j].issues.length;i++) {
                        jobs.push(new y.job(data.searchResult[j].issues[i]));
                    }
                    groups.push(jobs);
                }
                callback(groups);
            } else {
                var jobs = [];
                for(var i=0;i<data.issue.length;i++) {
                    jobs.push(new y.job(data.issue[i]));
                }
                callback(jobs);
            }
        });
    }
    y.log = function(msg) {
        var $pre = $('<pre>',{text:msg});
        $('body').append($pre);
    }
    y.totalSprints = 0;
    y.sprints = [];
    y.getSprints = function(callback) {
        $.getJSON(y.baseRestUrl+'/rest/admin/agile/Agile+Board-21',function(data) {
            if(!data.sprints) {
                return false;
            }
            y.totalSprints = data.sprints.length;
            for(var i = 0; i< y.totalSprints; i++) {
                $.getJSON(y.baseRestUrl+'/rest/admin/agile/Agile+Board-21/sprint/'+data.sprints[i].id,function(sprint) {
                    y.sprints.push(sprint);
                    if(y.sprints.length == y.totalSprints) {
                        callback(y.sprints);
                    }
                });
            }
        });
    };
    y.getCurrentSprint = function(callback) {
        var now = new Date();
        y.getSprints(function(sprints){
            for(var i = 0; i< sprints.length;i++) {
                if(sprints[i].start < now && sprints[i].finish > now) {
                    callback(sprints[i]);
                }
            }
        })
    };
    y.getCurrentStories = function() {
        var stories = [];
       for(var i in y.currentStories) {
           stories.push(i);
       }
        return stories;
    };
    y.getCompletedInSprint = function(sprint, callback) {
        y.getJobs(['#'+sprint+' #Story #unresolved','#'+sprint+' #Story #resolved'], function(jobs) {
            callback(Math.round(jobs[1].length/(jobs[0].length+jobs[1].length)*100, 1));
        });
    }
    y.loadJobs = function() {
        if(y.parent == null) {
            var currentTask = encodeURIComponent('#me State: {'+ y.stateInProgress+'}');
            var breakTask = encodeURIComponent('#me State: {'+ y.stateBreak+'}');
            $.getJSON(y.baseRestUrl+'/rest/issue?filter='+currentTask+'&filter='+breakTask,{},function(data) {
                if(data.searchResult[0].issues.length == 0 && data.searchResult[1].issues.length == 0) {
                    y.parent = localStorage['parent'] ? localStorage['parent'] : 'None';
                    y.loadJobs();
                } else {
                    var job = data.searchResult[0].issues.length ? data.searchResult[0].issues[0] : data.searchResult[1].issues[0];
                    y.getLinks(job.id, function(links) {
                        y.parent = links.parent ? links.parent : 'None';
                        y.loadJobs();
                    })
                }
            });
            return;
        }
        localStorage['parent'] = y.parent;
        var breakFilter = encodeURIComponent('#me #{'+y.stateBreak+'}');
        var currentFilter = encodeURIComponent('#{'+y.stateInProgress+'}');
        if(y.parent !== 'None') {
            var subtaskFilter = '&filter='+encodeURIComponent('Subtask of: '+ y.parent+' State: -{'+ y.stateInProgress+'} -{'+ y.stateBreak+'} #Unresolved');
        } else {
            var subtaskFilter = '';
        }
        $.getJSON(y.baseRestUrl+'/rest/issue?filter='+breakFilter+'&filter='+currentFilter+subtaskFilter+'&max=100',{},y.drawSearchResults);
    };
    y.drawSearchResults = function(data) {
        $(data.searchResult).each(function(i, v) {
            y.drawIssues(v);
        });
    }
    y.drawIssues = function(data) {
        $(data.issues).each(function(i, v) {


        });
    };

    y.job = function(data) {
        this.data = data;
        this.getId = function() {
            return this.data.id;
        }
        this.state = function() {
            return y.getField(this.data, 'state');
        }
        this.time = function() {
            var v = this.data;
            var timer = parseInt(y.getField(v, 'Timer time'));
            var minutes = 0;
            var spent = 0;
            var state = y.getField(v, 'state');
            if(timer > 0 && this.state() == 'In Progress') {
                var now = new Date().getTime();
                minutes = Math.round((now - timer) / 1000 / 60);
            }
            if(parseInt(y.getField(v, 'spent time'))) {
                spent = parseInt(y.getField(v, 'spent time'));
            }
            return minutes + spent;
        }
        this.renderTableRow = function() {
            var v = this.data;
            var $row = $('<tr></tr>');
            $row.data(y.issueToData(v));
            var total = this.time();
            if(total > 30) {
                $row.addClass('danger');
            }
            $row.attr('id', v.id);
            $row.append($('<td></td>').attr('data','assignee').text(y.getField(v, 'assignee', 'fullName')));
            $row.append($('<td></td>')
                .attr('data','job')
                .attr('title',v.id+' '+ y.getField(v, 'summary'))
                .append(y.issueLink(v.id))
                .append(' '+ y.getField(v, 'summary').substr(0,20)));
            $row.append($('<td></td>').attr('data','state').text(this.state()));
            $row.append($('<td></td>').attr('data','time').text(total));


            // Action Links
            var $actions = $('<div class="btn-group"></div>');

            if(this.state() == 'In Progress') {
                $actions.append(y.action('ok','Fixed', y.fixed, 'success'));
                $actions.append(y.action('cutlery','Take Break', y.break));
            } else {
                $actions.append(y.action('play',(this.state() == y.stateBreak ? 'Resume' : 'Start'), y.progress, 'success'));
            }
            if(this.state() == y.stateInProgress || this.state() == y.stateBreak) {
                $actions.append(y.action('chevron-left','Mark Open', y.open));
            }
            if(total > 1000) {
                $actions.append(y.action('time','Clean timer and Re-Open', y.clearTimerReopen, 'danger'));
            }
            $actions.append(y.action('plus','Create New Task under Parent', y.split));

            $row.append($('<td></td>').append($actions));
            return $row;
        }
    }

    y.issueLink = function(issue) {
        $a = $('<a></a>');
        $a.text(issue);
        $a.attr('href', y.baseRestUrl+'/issue/'+issue);
        $a.attr('target','_blank');
        return $a;
    }
    y.issueToData = function(issue, propertyMap) {
        var data = {};
        $(issue.field).each(function(i, f){
            if(f.name == 'undefined') { return true; } // continue;
            var name = f.name.toLowerCase();
            var value = 0;
            if(f.value instanceof Array) {
                if(f.value.length == 0) {
                    value = '';
                    return false;
                }
                if(f.value[0] instanceof Object) {
                    if(propertyMap != undefined && propertyMap[name] != undefined) {
                        value = f.value[0][propertyMap[name]];
                    } else {
                        value = f.value[0].value;
                    }
                } else {
                    value = f.value[0];
                }
            } else {
                value = f.value;
            }
            data[name] = value;
        });
        return data;
    }
    y.hoverBoxTimeout = null;
    y.hoverBoxElement = null;
    y.cellHover = function() {
        if($(this).attr('data') != undefined) {
            switch($(this).attr('data')) {
                default:
                    return false;
            }
        }
    }
    y.clear = function() {
        $('#issues tr').remove();
    }
    y.refresh = function() {
        y.clear();
        y.loadJobs();
    }
    y.fixed = function() {
        y.runCommand(y.fetchJobNumber(this),'state Fixed');
    }
    y.open = function() {
        y.runCommand(y.fetchJobNumber(this),'state Open');
    }
    y.break = function() {
        y.runCommand(y.fetchJobNumber(this),'state '+ y.stateBreak);
    }
    y.split = function() {
        var data = y.fetchJobData(this);
        var oldJobSummary = prompt("Rename Current Issue", data.summary);
        var newJobSummary = prompt("New Issue: ");
        if(newJobSummary == '') {
            return false;
        }
        var job = y.fetchJobNumber(this);
        if(oldJobSummary != data.summary) {
            y.updateIssue(job, oldJobSummary);
        }
        y.getLinks(job, function(links, params){
            y.createNewIssue(params.project, newJobSummary, function(job, params) {
                y.runCommand(job, 'Subtask of '+params.parent+' open for me fix version '+params.fixVersion);
            }, {"parent":links.parent, "fixVersion":params.version})
        }, {"project":data.projectshortname,"version":data['fix versions']});
    }

    y.progress = function() {
        y.runCommand(y.fetchJobNumber(this),'for me state In Progress')
    }
    y.clearTimerReopen = function() {
        y.runCommand(y.fetchJobNumber(this),'Timer time No timer time state open', 'Clear unclosed job timer')
    }
    y.createNewIssue = function(project, summary, callback, params) {
        $.ajax({
            'url': y.baseRestUrl+'/rest/issue',
            'type': 'PUT',
            'data':{'project':project,'summary':summary},
            'success':function(data, status, xhr) { callback(xhr.getResponseHeader('Location').replace(/.*\/([^\/]*)$/, '$1'), params) }
        })
    }
    y.runCommand = function(job, command, comment, callback) {
        var data = {
            'command': command
        };
        if(comment != undefined) {
            data['comment'] = comment;
        }
        $.post(y.baseRestUrl+'/rest/issue/#/execute'.replace('#', job),data, callback ? callback : y.refresh);
    }
    y.updateIssue = function(job, summary, description, callback) {
        var data = {
            'summary': summary
        };
        if(description != undefined) {
            data['description'] = description;
        }
        $.post(y.baseRestUrl+'/rest/issue/#'.replace('#', job),data, callback ? callback : y.refresh);
    }
    y.action = function(icon,title,callback,button) {
        var $a = $('<a></a>');
        $a.attr('title', title);
        $a.attr('type', 'button');
        $a.addClass('btn btn-xs btn-'+(button ? button : 'default'))
        $a.click(callback);
        $a.append(y.icon(icon));
        return $a;
    }
    y.icon = function(icon) {
        var $icon = $('<span class="glyphicon glyphicon-'+icon+'"></span>');
        return $icon;
    }
    y.getField = function(issue, fieldName, property) {
        if(fieldName == 'undefined') { return 'Invalid fieldName'; }
        var value = '';
        $(issue.field).each(function(i, f){
            if(f.name == 'undefined') { return true; } // continue;
            if(fieldName.toLowerCase()
                == f.name.toLowerCase()) {
                if(f.value instanceof Array) {
                    if(f.value.length == 0) {
                        value = '';
                        return false;
                    }
                    if(f.value[0] instanceof Object) {
                        if(property != undefined) {
                            value = f.value[0][property];
                        } else {
                            value = f.value[0].value;
                        }
                    } else {
                        value = f.value[0];
                    }
                } else {
                    value = f.value;
                }
                return false; // break
            }
        });
        return value;
    }
    y.jobDetailsPopover = function() {
        $('#popover').closest('.popover').remove();
        y.getLinks(y.fetchJobNumber(this),function(links){
            $('#popover-links').append(
                $('<div class="parent">Parent: '+links.parent+'</div>')
            );
            links.children.each(function(i, v) {
                $('#popover-links').append($('<div class="child">Child: '+v+'</div>'));
            })
            links.related.each(function(i, v) {
                $('#popover-links').append($('<div class="related">Related: '+v+'</div>'));
            })
        })
        $.getJSON(y.baseRestUrl+'/rest/issue/#/link'.replace('#',y.fetchJobNumber(this)),{},function(data) {
            text(JSON.stringify(data));
        });

        return '<div id="popover-links"></div><div id="popover-desc">'+y.fetchJobData(this).description.substr(0,150)+'</div>';

    }
    y.jobTitle = function() {
        var job = y.fetchJobNumber(this);
        var data = y.fetchJobData(this);
        return job+' '+data.summary;
    }
    y.getLinks = function(job, callback, params) {
        $.getJSON(y.baseRestUrl+'/rest/issue/#/link'.replace('#',job),{},function(data) {
            var links = {
                'parent': null,
                'children': [],
                'related': []
            };
            $(data).each(function(i, v) {
                var linkedJob = null;
                var type = null;
                if(job == v.source) {
                    linkedJob = v.target;
                    type = v.typeOutward;
                }
                if(job == v.target) {
                    linkedJob = v.source;
                    type = v.typeInward;
                }
                switch(type) {
                    case 'subtask of':
                        links.parent = linkedJob;
                        break;
                    case 'parent for':
                        links.children.push(linkedJob);
                        break;
                    default:
                        links.related.push(linkedJob);
                }
            });
            callback(links, params);
        });
    }
    y.fetchJobNumber = function(elem) {
        return $(elem).closest('tr').attr('id');
    }
    y.fetchJobData = function(elem) {
        return $(elem).closest('tr').data();
    }

})(smsglobal.youtrack);



$(document).ready(smsglobal.youtrack.init);
