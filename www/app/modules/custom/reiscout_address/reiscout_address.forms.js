/**
 * The user login form submit handler.
 * @param {Object} form
 * @param {Object} form_state
 */
function _reiscout_address_user_login_form_submit(form, form_state) {
  try {
    user_login(form_state.values.name, form_state.values.pass, {
      success: function(result) {
        _reiscout_address_goto_destination();
      }
    });
  }
  catch (error) {
    console.log('_reiscout_address_user_login_form_submit - ' + error);
  }
}

/**
 * The user registration form submit handler.
 * @param {Object} form
 * @param {Object} form_state
 */
function _reiscout_address_user_register_form_submit(form, form_state) {
  try {
    var account = drupalgap_entity_build_from_form_state(form, form_state);
    user_register(account, {
      success: function(data) {
        var config = form.user_register;
        var options = {
          title: t('Registered')
        };
        // Check if e-mail verification is required or not..
        if (!drupalgap.site_settings.user_email_verification) {
          // E-mail verification not needed, if administrator approval is
          // needed, notify the user, otherwise log them in.
          if (drupalgap.site_settings.user_register == '2') {
            drupalgap_alert(
              config.user_mail_register_pending_approval_required_body,
              options
            );
            _reiscout_address_goto_destination();
          }
          else {
            drupalgap_alert(
              config.user_mail_register_no_approval_required_body,
              options
            );
            // If we're automatically logging in do it, otherwise just go to
            // the front page.
            if (form.auto_user_login) {
              user_login(account.name, account.pass, {
                  success: function(result) {
                    _reiscout_address_goto_destination();
                  }
              });
            }
            else { _reiscout_address_goto_destination(); }
          }
        }
        else {
          // E-mail verification needed... notify the user.
          drupalgap_alert(
            config.user_mail_register_email_verification_body,
            options
          );
          _reiscout_address_goto_destination();
        }
      },
      error: function(xhr, status, message) {
        // If there were any form errors, display them.
        var msg = _drupalgap_form_submit_response_errors(form, form_state, xhr,
          status, message);
        if (msg) { drupalgap_alert(msg); }
      }
    });
  }
  catch (error) {
    console.log('_reiscout_address_user_register_form_submit - ' + error);
  }
}

/**
 * The request new password form submission handler.
 * @param {Object} form
 * @param {Object} form_state
 */
function _reiscout_address_user_pass_form_submit(form, form_state) {
  try {
    user_request_new_password(form_state.values['name'], {
        success: function(result) {
          if (result[0]) {
            var msg =
              t('Further instructions have been sent to your e-mail address.');
            drupalgap_set_message(msg);
          }
          else {
            var msg =
              t('There was a problem sending an e-mail to your address.');
            drupalgap_set_message(msg, 'warning');
          }
          _reiscout_address_goto_destination('user/login', true);
        }
    });
  }
  catch (error) {
    console.log('_reiscout_address_user_pass_form_submit - ' + error);
  }
}
