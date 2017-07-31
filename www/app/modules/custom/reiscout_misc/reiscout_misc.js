/**
 * Implements hook_form_alter().
 */
function reiscout_misc_form_alter(form, form_state, form_id) {
  try {
    if ('contact_site_form' == form_id) {
      form.elements.copy.access = false;
    }
    else if ('user_register_form' == form_id) {
      form.elements.mail.description = t('The e-mail address is not made public and will only be used if you wish to receive a new password or wish to receive certain news or notifications by e-mail.');

      // Change the type of 'Password' field from 'password' to 'text'
      form.elements.pass.type = 'textfield';

      // Remove 'Confirm e-mail address' and 'Confirm password' fields
      delete form.elements.conf_mail;
      delete form.elements.pass2;

      // Do not use user_register_form_validate() to validate the form
      if ('undefined' !== typeof form.validate) {
        if (1 === form.validate.length && 'user_register_form_validate' === form.validate[0]) {
          delete form.validate;
        }
        else {
          for (var index in form.validate) {
            if ('user_register_form_validate' === form.validate[index]) {
              form.validate.splice(index, 1);
              break;
            }
          }
        }
      }
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

/**
 * Implements hook_services_request_pre_postprocess_alter().
 */
function reiscout_misc_services_request_pre_postprocess_alter(options, result) {
  if (options.service == 'user' && options.resource == 'login' && result.user.uid) {
    ga('set', 'userId', result.user.uid);
  }
}
