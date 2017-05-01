/**
 * Implements hook_services_postprocess().
 * @param {Object} options
 * @param {Object} result
 */
function reiscout_property_commerce_services_postprocess(options, result) {
  try {
    if (options.service == 'checkout_complete' && options.resource == 'create') {
      // If we're on the checkout complete page, inject a link to the 'Purchased Addresses' page.
      if ('checkout/complete/%' == drupalgap_router_path_get()) {
        var order_id = arg(2);
        var container = $('#commerce_checkout_complete_' + order_id);
        if (container.length) {
          var html = '<div id="link">' + l('Go to purchased addresses list', 'purchased-addresses') + '<div>';
          $(container).append(html).trigger('create');
        }
      }
    }
  }
  catch (error) { console.log('reiscout_property_commerce_services_postprocess - ' + error); }
}

/**
 * Implements hook_form_alter().
 */
function reiscout_property_commerce_form_alter(form, form_state, form_id) {
  try {
    // form alter for add to cart form
    if (form_id == 'commerce_cart_add_to_cart_form' && typeof form.bundle != undefined && form.bundle == 'property') {
      reiscout_property_commerce_form_commerce_cart_add_to_cart_form_alter(form, form_state);
    }
  }
  catch (error) {
    console.log('reiscout_property_commerce_form_alter - ' + error);
  }
}

function reiscout_property_commerce_form_commerce_cart_add_to_cart_form_alter(form, form_state) {
  try {
    // Hide cart button for anon users and if the product is unknown by this function.
    form.elements.submit.access = false;
    if (Drupal.user.uid == 0) {
      return;
    }

    if (typeof form.arguments[0].nid == undefined) {
      throw new Error('Node entity undefined');
    }
    var node = form.arguments[0];

    // Set global var from commerce.js. This is related to fix/hack in _commerce_product_display_get_current_product_id()
    // this is the easiest and best for us way to make the cart working.
    // This fix working only for a case when we have a single product on the page.
    _commerce_product_display_product_id = node._reiscout_property_commerce_product_id;

    // Update cart submit button in depend of product type
    if (typeof node._reiscout_property_commerce_product_type != undefined) {
      if (node._reiscout_property_commerce_product_type == 'reiscout_property_address_access') {
        form.elements.submit.value = 'Buy Property Address for ' + node._price_title;
        form.elements.submit.access = true;
      }
    }
  }
  catch (error) {
    console.log('reiscout_property_commerce_form_commerce_cart_add_to_cart_form_alter - ' + error);
  }
}