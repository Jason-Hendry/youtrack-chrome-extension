// Saves options to localStorage.
function save_options() {
    localStorage["url"] = $('[name=url]').val();
    chrome.permissions.request({
        permissions: ['tabs'],
        origins: [localStorage["url"]]
    }, function(granted) {  }
    );
}

// Restores select box state to saved value from localStorage.
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
