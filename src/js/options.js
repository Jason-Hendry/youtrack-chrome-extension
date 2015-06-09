function save_options() {

    var settings = $('#settings').serializeObject();
    chrome.storage.sync.clear(function() {
        chrome.storage.sync.set(settings, function () {
            chrome.runtime.sendMessage({method: "setSettings", settings: settings}, function (response) {
                $('#save-message').text("Saved");
            });
        });
    });
}

function restore_options() {
    chrome.storage.sync.get(null, function(settings) {
        for(i in settings) {
            var $field = $('[name='+i+']');
            if($field.attr('type') == 'checkbox') {
                $field.attr('checked','checked');
            } else {
                $field.val(settings[i]);
            }
        };
    });
}

$(document).ready(function() {
    restore_options();

    $('form').submit(function(){
        save_options();
        event.preventDefault();
        return false;
    });

    $('input[value=Export]').click(function() {
        $('textarea#export').val(JSON.stringify($('#settings').serializeObject()));
    });
    $('input[value=Import]').click(function() {
        var settings = JSON.parse($('textarea#export').val());
        if(settings) {
            chrome.storage.sync.set(settings, function () {
                $('#save-message').text("Imported");
                restore_options();
            });
        }
    });
    $('input').change(function(){
        $('#save-message').text("Unsaved Changes");
    })
});
