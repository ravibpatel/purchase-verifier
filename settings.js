// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var $ = require("jquery");
var toastr = require('toastr');
const settings = require("electron-settings");
var shell = require('electron').shell;
const { remote } = require('electron')

if(settings.has('token')) {
  $('#personal-token').val(settings.get('token'));
}

//Open links externally by default
$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});

$('#back').click(function() {
  remote.getCurrentWindow().loadFile('index.html')
});

$('#save').click(function() {
    let token = $('#personal-token').val();
    if(token) {
      settings.set('token', token);
      toastr.success("Settings saved successfully");
    }
});