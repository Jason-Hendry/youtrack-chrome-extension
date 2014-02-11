var smsglobal = smsglobal || {};
smsglobal.youtrack = smsglobal.youtrack || {};

(function(y) {
    y.baseRestUrl = localStorage['url'].replace(/\/$/,'');
    y.stateBreak = localStorage['break_state'];
    y.stateInProgress = 'In Progress';
    y.stateFixed = 'Fixed';
    y.parent = null;
    y.init = function() {
        y.loadJobs();
        $('#issues').on('mouseenter','td',null, y.cellHover);
        $('#issues').popover({
            'selector':'[data=job]',
            'placement':'bottom',
            'content': y.jobDetailsPopover,
            'title': y.jobTitle,
            'container':'body',
            'html':true})
    };
    y.loadJobs = function() {
        if(y.parent == null) {
            var currentTask = encodeURIComponent('#me State: {'+ y.stateInProgress+'} OR {'+ y.stateBreak+'}');
            $.getJSON(y.baseRestUrl+'/rest/issue?filter='+currentTask,{},function(data) {
                if(data.issue.length == 0) {
                    y.parent = localStorage['parent'] ? localStorage['parent'] : 'None';
                    y.loadJobs();
                } else {
                    y.getLinks(data.issue[0].id, function(links) {
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

            var subtaskFilter = '&filter='+encodeURIComponent('Subtask of: '+ y.parent+' State: -{'+ y.stateInProgress+'} -{'+ y.stateBreak+'}');
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
           var timer = parseInt(y.getField(v, 'Timer time'));
           var minutes = 0;
           var spent = 0;
           var state = y.getField(v, 'state');
           if(timer > 0 && state == 'In Progress') {
               var now = new Date().getTime();
               minutes = Math.round((now - timer) / 1000 / 60);
           }
            if(parseInt(y.getField(v, 'spent time'))) {
                spent = parseInt(y.getField(v, 'spent time'));
            }
           var total = minutes + spent;
           var $row = $('<tr></tr>');
            $row.data(y.issueToData(v));
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
            $row.append($('<td></td>').attr('data','state').text(state));
            $row.append($('<td></td>').attr('data','time').text(spent + minutes));


            // Action Links
            var $actions = $('<div class="btn-group"></div>');
            //    .append(y.action('resize-full','Split Task', y.split));

            if(state == 'In Progress') {
                $actions.append(y.action('ok','Fixed', y.fixed, 'success'));
                $actions.append(y.action('cutlery','Take Break', y.break));
            } else {
                $actions.append(y.action('play',(state == y.stateBreak ? 'Resume' : 'Start'), y.progress, 'success'));
            }
            if(state == y.stateInProgress || state == y.stateBreak) {
                $actions.append(y.action('chevron-left','Mark Open', y.open));
            }
            if(total > 1000) {
                $actions.append(y.action('time','Clean timer and Re-Open', y.clearTimerReopen, 'danger'));
            }

            $row.append($('<td></td>').append($actions));
            $('#issues').append($row);
        });
    };
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
        var oldJobSummary = prompt("Rename current job", data.summary);
        var job = y.fetchJobNumber(this);
        y.getLinks(job, alert)
    }
    y.progress = function() {
        y.runCommand(y.fetchJobNumber(this),'for me state In Progress')
    }
    y.clearTimerReopen = function() {
        y.runCommand(y.fetchJobNumber(this),'Timer time No timer time state open', 'Clear unclosed job timer')
    }
    y.createNewTask = function(project,summary, callback) {
        $.ajax({
            'url': y.baseRestUrl+'/rest/issue',
            'data':{'project':project,'summary':summary},
            'success':function(data, status, xhr) { callback(xhr.getResponseHeader('Location').replace(/.*\/([^\/]*)$/, '$1')) }
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
    y.getLinks = function(job, callback) {
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
            callback(links);
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