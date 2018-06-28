$(() => {
  const settings = require('electron-settings');

  const _MS_PER_DAY = 1000 * 60 * 60 * 24;

  // a and b are javascript Date objects
  function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    let utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    let utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  if(settings.has("token")) {
    $('#input-personal-token').val(settings.get("token"));
  }

  $('#button-save').click(function () {
    let token = $('#input-personal-token').val();
    if(token) {
      settings.set('token', token);
      alert("Token successfully saved.");
    }
  });

  const button_verify = $('#button-verify');
  button_verify.click(function () {
    if(settings.has("token")) {
      const purchase_code = $('#input-purchase-code').val();
      if (purchase_code) {
        button_verify.prop("disabled", true);
        $.ajax({
          type: "GET",
          url: "https://api.envato.com/v3/market/author/sale",
          dataType: 'json',
          headers: {
            'Authorization': 'Bearer ' + settings.get("token")
          },
          data: "code=" + purchase_code,
          success: function (data) {
            $('#output-item').text(data.item.name);
            $('#output-buyer').text(data.buyer);
            $('#output-date-purchased').text(new Date(data.sold_at).toLocaleDateString());
            let a = new Date(),
              b = new Date(data.supported_until),
              difference = dateDiffInDays(a, b);
            if(difference > 0) {
              $('#output-support-entitlement').text(difference + " Days Remaining");
            } else {
              $('#output-support-entitlement').text("Expired");
            }
            button_verify.removeAttr('disabled');
          },
          error: function (jqXHR, textStatus, errorThrown) {
            button_verify.removeAttr('disabled');
            if (errorThrown) {
              alert(errorThrown);
            } else if (jqXHR.responseText) {
              let error = JSON.parse(jqXHR.responseText);
              if(error.description) {
                alert(error.description);
              } else if(error.message) {
                alert(error.message)
              }
            }
          }
        });
      }
    } else {
      alert("Get your personal token from https://build.envato.com and save it before continuing.");
    }
  });
  
  $('#text-input').focus()
})