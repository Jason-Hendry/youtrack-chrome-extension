function save_options() {
    localStorage["url"] = $('[name=url]').val();
    localStorage["gitlab-url"] = $('[name=gitlab-url]').val();
    localStorage["break_state"] = $('[name=break_state]').val();
    localStorage["authorColors"] = $('[name=author_colours]').val();
    $('input[value=Save]').text('Saved');
}

function restore_options() {
    $('[name=url]').val(localStorage["url"]);
    $('[name=gitlab-url]').val(localStorage["gitlab-url"]);
    $('[name=author_colours]').val(localStorage["authorColors"]);
    var break_state = localStorage["break_state"];
    $('[name=break_state]').val(break_state ? break_state : 'In Progress - On Break');
}

$('form').submit(function(){
    save_options();
    event.preventDefault();
    $('#save-message').text("Saved");
    return false;
})
$(document).ready(function() {
    restore_options();
    $('input').change(function(){
        $('#save-message').text("Unsaved Changes");
    })
});
