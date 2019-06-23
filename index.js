// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var $ = require("jquery");
var toastr = require('toastr');
const settings = require('electron-settings');
const { remote } = require('electron');

const table_info = $('#info');
const button_verify = $('#verify');
const _MS_PER_DAY = 1000 * 60 * 60 * 24;

table_info.hide();
  
// a and b are javascript Date objects
function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    let utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    let utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}

$('#settings').click(function() {
  remote.getCurrentWindow().loadFile('settings.html')
});

button_verify.click(function () {
    table_info.hide();
    if(settings.has("token")) {
        const purchase_code = $('#purchase-code').val();
        if (purchase_code) {
            $.ajax({
            type: "GET",
            url: "https://api.envato.com/v3/market/author/sale",
            dataType: 'json',
            headers: {
                'Authorization': 'Bearer ' + settings.get("token")
            },
            data: "code=" + purchase_code,
            success: function (data) {
                $('#item').html(data.item.name);
                $('#buyer').html(data.buyer);
                $('#sold-at').html(new Date(data.sold_at).toLocaleDateString());
                let a = new Date(),
                b = new Date(data.supported_until),
                difference = dateDiffInDays(a, b);
                if(difference > 0) {
                    $('#support-entitlement').html(difference + " Days Remaining");
                } else {
                    $('#support-entitlement').html("Expired");
                }

                table_info.show();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                    if (errorThrown) {
                        toastr.error(errorThrown);
                    } else if (jqXHR.responseText) {
                        let response = JSON.parse(jqXHR.responseText);
                        if(response.description) {
                            toastr.error(response.description, response.error);
                        } else if(response.error) {
                            toastr.error(response.error, response.reason);
                        }
                    }
                }   
            });
        }
    } else {
        toastr.error("Add your Personal Token in Settings before continuing.");
    }
});