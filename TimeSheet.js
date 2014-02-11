var http = require('http');

function postRequest(host, url, payload, cookie, callback) {
    var payload = payload;
    var options = {
        hostname: host,
        port: 80,
        path: url,
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': payload.length,
            'Cookie': cookie
        }
    };

    var c = http.request(options, function(res) {
        var body = '';
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function() {
            callback(body, res);
        });
    });

    c.write(payload);
    c.end();
}

function getRequest(host, url, cookie, callback, params) {
    var options = {
        hostname: host,
        port: 80,
        path: url,
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookie
        }
    };

    var c = http.request(options, function(res) {
        var body = '';
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function (chunk) {
            body += chunk;
        });
        res.on('end', function() {
            callback(body, res, params);
        });
    });
    c.end();
}

getField = function(issue, fieldName, property) {
    if(fieldName == 'undefined') { return 'Invalid fieldName'; }
    var value = '';
    for(i in issue.field) {
        f = issue.field[i];
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
            break;
        }
    };
    return value;
}

var host = 'youtrack.smsglobal.local';
var Y = process.argv[2];
var m = process.argv[3];
var d = process.argv[4];
//Login
postRequest(host, '/rest/user/login', 'login=jason&password=monlet23','', function(body, response) {
    //console.log(['Login', body]);
    if(response.statusCode == 200) {
        getRequest(host, '/rest/issue?max=100&filter='+encodeURIComponent('updated: '+[Y,m,d].join('-')),response.headers['set-cookie'], function(body,res) {
            var issues = JSON.parse(body);
            for(i in issues.issue) {
                var issue = issues.issue[i];
                getRequest(host, '/rest/issue/#/timetracking/workitem/'.replace('#',issue.id),response.headers['set-cookie'], function(body,res, params) {
                    //console.log(params.id);
                    var times = JSON.parse(body);
                    for(i in times) {
                        var time = times[i];
                        var workDate = new Date(time.date);
                        if(time.duration > 0 &&
                            workDate.getDate() == parseInt(d) &&
                            workDate.getMonth()+1 == parseInt(m) &&
                            workDate.getFullYear() == parseInt(Y)) {
                            //console.log([params.id, getField(params, 'summary'), workDate, time.duration, time.author.login]);
                            console.log([params.id, time.duration, time.author.login].join('|'));
                        }
                    }
                    //console.log(times);
                }, issue);

            }
        });
    } else {
        console.log(body);
    }
})