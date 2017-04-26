/**
 * Define the form.
 * Add owner info form and check what form we need to show
 */
function reiscout_get_owner_info_custom_form(form, form_state) {
  try {
    Drupal.services.call({
      method: 'POST',
      path: 'ownerinfo/checkButtonShow.json',
      service: 'ownerinfo',
      resource: 'checkButtonShow',
      data: JSON.stringify({
        nid: form.arguments[0].nid
      }),
      success: function(data) {
        if (data.viewGetOwnerInfo == 1) {
          $('#reiscout_get_owner_info_custom_form').css("display", "block");
        }
        if (data.viewBuyInfoPoints == 1) {
          $('#reiscout_buy_info_points_custom_form').css("display", "block");
        }
      },
    });

    form.options.attributes['style'] = 'display: none';
    form.elements['submit'] = {
      type: 'submit',
      value: 'Get Property Owner'
    };
    return form;
  }
  catch (error) { console.log('reiscout_get_owner_info_custom_form - ' + error); }
}

/**
 * Define the form's submit function.
 * Call getinfo server function
 */
function reiscout_get_owner_info_custom_form_submit(form, form_state) {
  try {
    Drupal.services.call({
      method: 'POST',
      path: 'ownerinfo/getinfo.json',
      service: 'ownerinfo',
      resource: 'getinfo',
      data: JSON.stringify({
        nid: form.arguments[0].nid
      }),
      success: function(data) {
        try {
          if (data.status) {
            drupalgap_set_message("Information about the property's owner has been updated.");
            drupalgap_goto(drupalgap_path_get(), {reloadPage: true});
          }
          else {
            drupalgap_set_message("Information about the property's owner cannot be updated. Please, try again later or contact technical support for assistance!", 'error');
            drupalgap_goto(drupalgap_path_get(), {reloadPage: true});
          }
        }
        catch (error) { console.log('reiscout_get_owner_info_custom_form_submit - success - ' + error); }
      },
      error: function(xhr, status, message) {
        try {
          drupalgap_alert('Something went wrong');
        }
        catch (error) { console.log('reiscout_get_owner_info_custom_form_submit - error - ' + error); }
      }
    });
  }
  catch (error) { console.log('reiscout_get_owner_info_custom_form_submit - ' + error); }
}
