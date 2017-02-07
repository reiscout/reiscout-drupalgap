/**
 * Define the form.
 */
function reiscont_buy_letters_points_custom_form(form, form_state) {
  try {
    form.options.attributes['style'] = 'display: none';
    form.elements['submit'] = {
      type: 'submit',
      value: 'Buy Letters Points'
    };
    return form;
  }
  catch (error) { console.log('reiscont_buy_letters_points_custom_form - ' + error); }
}

/**
 * Define the form's submit function.
 */
function reiscont_buy_letters_points_custom_form_submit(form, form_state) {
  try {
    // Get the user's current cart.
    commerce_cart_index(null, {
      success: function(result) {
        if (result.length == 0) {
          // The cart doesn't exist yet, create it, then add the line item to it.
          commerce_cart_create({
            success: function(order) {
              _commerce_line_letters_item_add_to_order({
                order: order,
                success: _commerce_cart_add_to_cart_form_submit_success
              });
            }
          });
        } else {
          // The cart already exists, add the line item to it.
          $.each(result, function(order_id, order) {
            _commerce_line_letters_item_add_to_order({
              order: order,
              success: _commerce_cart_add_to_cart_form_submit_success
            });
            return false; // Process only one cart.
          });
        }
      }
    });
  }
  catch (error) { console.log('commerce_cart_add_to_cart_form_submit - ' + error); }
}

function _commerce_line_letters_item_add_to_order(options) {
  console.log(options);
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
  catch (error) { console.log('_commerce_line_letters_item_add_to_order - ' + error); }
}