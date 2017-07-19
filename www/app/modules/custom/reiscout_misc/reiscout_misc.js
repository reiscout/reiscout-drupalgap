/**
 * Implements hook_form_alter().
 */
function reiscout_misc_form_alter(form, form_state, form_id) {
  try {
    if ('contact_site_form' == form_id) {
      form.elements.copy.access = false;
    }
  }
  catch (error) {
    console.log('reiscout_misc_form_alter - ' + error);
  }
}

/**
 * Implements hook_services_preprocess().
 * @param {Object} options
 */
function reiscout_misc_services_preprocess(options) {
  try {
    // This Services call is initiated by contact_site(). By default, success callback
    // alerts a message to the user and clears all the fields on the contact form.
    // But we want to redirect the user to the home page and show him the message.
    if (options.service == 'contact' && options.resource == 'site') {
      options.success = function(result) {
        if (result[0]) {
          drupalgap_set_message(t('Your message has been sent!'));
        }
        else {
          var msg = t('Your message cannot be sent. Please, try again later or contact technical support for assistance!');
          drupalgap_set_message(msg, 'error');
        }
        drupalgap_form_clear();
        drupalgap_goto('property-listing', {reloadPage: true});
      }
    }
  }
  catch (error) {
    console.log('reiscout_misc_services_preprocess - ' + error);
  }
}
