function save_options() {
    localStorage["url"] = $('[name=url]').val();
    $('input[value=Save]').text('Saved');
}

function restore_options() {
    $('[name=url]').val(localStorage["url"]);
}

$('form').submit(function(){
    save_options();
    event.preventDefault();
    return false;
})
$(document).ready(function() {
    restore_options()
});
