/**
 * Define the form.
 * Add send letters form and check what form we need to show.
 */
function reiscout_send_letters_custom_form(form, form_state, product_display) {
  try {
    Drupal.services.call({
      method: 'POST',
      path: 'sendletters/checkButtonShow.json',
      service: 'sendletters',
      resource: 'checkButtonShow',
      data: JSON.stringify({
        nid: product_display.nid
      }),
      success: function(data) {
        if (data.viewSendLetters) {
          $('#edit-reiscout-send-letters-custom-form-submit').html(data.btnSendLetterTitle);
          $('#reiscout_send_letters_custom_form').show();
        }
        if (data.viewBuyLettersPoints) {
          $('#reiscont_buy_letters_points_custom_form').show();
        }
      }
    });

    form.options.attributes['style'] = 'display: none';
    form.elements['submit'] = {
      type: 'submit',
      value: 'Send a letter to Property Owner',
      description: "Send a letter to the property's owner using a template that is selected in your user profile."
    };
    return form;
  }
  catch (error) { console.log('reiscout_send_letters_custom_form - ' + error); }
}

/**
 * Define the form's submit function.
 * Call sendLetter server function
 */
function reiscout_send_letters_custom_form_submit(form, form_state) {
  try {
    Drupal.services.call({
      method: 'POST',
      path: 'sendletters/sendLetter.json',
      service: 'sendletters',
      resource: 'sendLetter',
      data: JSON.stringify({
        nid: form.arguments[0].nid
      }),
      success: function(data) {
        try {
          if (data.status) {
            drupalgap_set_message(data.message);
            drupalgap_goto(drupalgap_path_get(), {reloadPage: true});
          }
          else {
            drupalgap_set_message(data.message, 'error');
            drupalgap_goto(drupalgap_path_get(), {reloadPage: true});
          }
        }
        catch (error) { console.log('reiscout_send_letters_custom_form_submit - success - ' + error); }
      },
      error: function(xhr, status, message) {
        try {
          drupalgap_alert('Something went wrong.');
        }
        catch (error) { console.log('reiscout_send_letters_custom_form_submit - error - ' + error); }
      }
    });
  }
  catch (error) { console.log('reiscout_send_letters_custom_form_submit - ' + error); }
}
