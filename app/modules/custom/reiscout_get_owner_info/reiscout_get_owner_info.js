/**
 * Define the form.
 */
function reiscout_get_owner_info_custom_form(form, form_state) {
  try {
    Drupal.services.call({
      method: 'POST',
      path: 'ownerinfo/checkButtonShow.json',
      service: 'ownerinfo',
      resource: 'checkButtonShow',
      contentType: 'application/x-www-form-urlencoded',
      bundle: null,
      data: JSON.stringify(form.arguments[0].vid),
      success: function(data) {
        //console.log(data);
        if (data.viewGetOwnerInfo == 1) {
          document.getElementById('reiscout_get_owner_info_custom_form').style.display = 'block';
        }
        if (data.viewBuyInfoPoints == 1) {
          document.getElementById('reiscout_buy_info_points_custom_form').style.display = 'block';
        }
      },
    });

    form.options.attributes['style'] = 'display: none';
    form.elements['submit'] = {
      type: 'submit',
      value: 'Get Owner Info'
    };
    return form;
  }
  catch (error) { console.log('reiscout_get_owner_info_custom_form - ' + error); }
}

/**
 * Define the form's submit function.
 */
function reiscout_get_owner_info_custom_form_submit(form, form_state) {
  try {
    Drupal.services.call({
      method: 'POST',
      path: 'ownerinfo/getinfo.json',
      service: 'ownerinfo',
      resource: 'getinfo',
      contentType: 'application/x-www-form-urlencoded',
      //entity_type: 'commerce_order',
      //entity_id: order.order_id,
      bundle: null,
      data: JSON.stringify(form.arguments[0].vid),
      success: function(data) {
        try {
          console.log(data);
        }
        catch (error) { console.log('reiscout_get_owner_info_custom_form_submit - success - ' + error); }
      },
      error: function(xhr, status, message) {
        try {
          console.log(status);
        }
        catch (error) { console.log('reiscout_get_owner_info_custom_form_submit - error - ' + error); }
      }
    });
  }
  catch (error) { console.log('reiscout_get_owner_info_custom_form_submit - ' + error); }
}

