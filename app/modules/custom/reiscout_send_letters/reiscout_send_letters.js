/**
 * Define the form.
 * * Add send letters form and check what form we need to show
 */
function reiscout_send_letters_custom_form(form, form_state) {
  try {
    Drupal.services.call({
      method: 'POST',
      path: 'sendletters/checkButtonShow.json',
      service: 'sendletters',
      resource: 'checkButtonShow',
      contentType: 'application/x-www-form-urlencoded',
      bundle: null,
      data: JSON.stringify(form.arguments[0].vid),
      success: function(data) {
        if (data.viewSendLetters == 1) {
          $('#reiscout_send_letters_custom_form').css("display", "block");
        }
        if (data.viewBuyLettersPoints == 1) {
          $('#reiscont_buy_letters_points_custom_form').css("display", "block");
        }
      },
    });

    form.options.attributes['style'] = 'display: none';
    form.elements['submit'] = {
      type: 'submit',
      value: 'Send Owner a Mail'
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
      contentType: 'application/x-www-form-urlencoded',
      //entity_type: 'commerce_order',
      //entity_id: order.order_id,
      bundle: null,
      data: JSON.stringify(form.arguments[0].vid),
      success: function(data) {
        try {
          drupalgap_alert('The letter been sent');
        }
        catch (error) { console.log('reiscout_send_letters_custom_form_submit - success - ' + error); }
      },
      error: function(xhr, status, message) {
        try {
          drupalgap_alert('Something went wrong');
        }
        catch (error) { console.log('reiscout_send_letters_custom_form_submit - error - ' + error); }
      }
    });
  }
  catch (error) { console.log('reiscout_send_letters_custom_form_submit - ' + error); }
}

