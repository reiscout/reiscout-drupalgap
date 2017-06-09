/**
 * A form that allows user to send a postcard to an owner of a property.
 */
function reiscout_mail_send_postcard_form(form, form_state, nid) {
  try {
    Drupal.services.call({
      method: 'POST',
      path: 'reiscout_mail_postcard/get_available_actions.json',
      service: 'reiscout_mail_postcard',
      resource: 'get_available_actions',
      data: JSON.stringify({
        nid: nid
      }),
      success: function(data) {
        if (data.send_postcard) {
          $('#edit-reiscout-mail-send-postcard-form-submit').html(data.btn_send_postcard_title);
          $('#reiscout_mail_send_postcard_form').show();
        }
        if (data.buy_mail_sending_points) {
          $('#reiscout_mail_buy_sending_points_form').show();
        }
      }
    });

    form.options.attributes['style'] = 'display: none';
    form.elements['submit'] = {
      type: 'submit',
      value: 'Send a Postcard',
      description: "Send a postcard to the property's owner using a template that is selected in your user profile."
    };
    return form;
  }
  catch (error) {
    console.log('reiscout_mail_send_postcard_form - ' + error);
  }
}

/**
 * Form submission handler for reiscout_mail_send_postcard_form().
 */
function reiscout_mail_send_postcard_form_submit(form, form_state) {
  try {
    Drupal.services.call({
      method: 'POST',
      path: 'reiscout_mail_postcard/send.json',
      service: 'reiscout_mail_postcard',
      resource: 'send',
      data: JSON.stringify({
        nid: form.arguments[0]
      }),
      success: function(data) {
        if (data.status) {
          drupalgap_set_message(data.message);
          drupalgap_goto(drupalgap_path_get(), {reloadPage: true});
        }
        else {
          drupalgap_set_message(data.message, 'error');
          drupalgap_goto(drupalgap_path_get(), {reloadPage: true});
        }
      },
      error: function(xhr, status, message) {
        var msg = t("Letter to the property's owner cannot be sent. Please, try again later or contact technical support for assistance!");
        drupalgap_alert(msg, {
          title: t('Error')
        });
      }
    });
  }
  catch (error) {
    console.log('reiscout_mail_send_postcard_form_submit - ' + error);
  }
}

/**
 * A form that allows user to buy mail sending userpoints.
 */
function reiscout_mail_buy_sending_points_form(form, form_state) {
  try {
    form.options.attributes['style'] = 'display: none';
    form.elements['submit'] = {
      type: 'submit',
      value: 'Buy Ability to Send Mail'
    };
    return form;
  }
  catch (error) {
    console.log('reiscout_mail_buy_sending_points_form - ' + error);
  }
}

/**
 * Form submission handler for reiscout_mail_buy_sending_points_form().
 */
function reiscout_mail_buy_sending_points_form_submit(form, form_state) {
  try {
    // Get the user's current cart.
    commerce_cart_index(null, {
      success: function(result) {
        if (result.length == 0) {
          // The cart doesn't exist yet, create it, then add the line item to it.
          commerce_cart_create({
            success: function(order) {
              _reiscout_mail_commerce_line_item_add_to_order({
                order: order,
                success: _commerce_cart_add_to_cart_form_submit_success
              });
            }
          });
        }
        else {
          // The cart already exists, add the line item to it.
          $.each(result, function(order_id, order) {
            _reiscout_mail_commerce_line_item_add_to_order({
              order: order,
              success: _commerce_cart_add_to_cart_form_submit_success
            });
            return false; // Process only one cart.
          });
        }
      }
    });
  }
  catch (error) {
    console.log('reiscout_mail_buy_sending_points_form_submit - ' + error);
  }
}

function _reiscout_mail_commerce_line_item_add_to_order(options) {
  try {
    var product_id = 597; //  /admin/commerce/products/list?sku=point
    commerce_line_item_create({
      data: {
        order_id: options.order.order_id,
        type: 'product',
        commerce_product: product_id
      },
      success: function(result) {
        if (options.success) { options.success(result); }
      }
    });
  }
  catch (error) { console.log('_reiscout_mail_commerce_line_item_add_to_order - ' + error); }
}
