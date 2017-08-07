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
          var html = '<div id="link">' + l('Go to purchased leads list', 'purchased-leads', {reloadPage: true}) + '<div>';
          $(container).append(html).trigger('create');
        }
      }
    }
  }
  catch (error) { console.log('reiscout_property_commerce_services_postprocess - ' + error); }
}

/**
 * Alter the result data of a service call, before its success function.
 * @param {object} options
 * @param {Object} result
 */
function reiscout_property_commerce_services_request_pre_postprocess_alter(options, result) {
  if (options.service === 'cart' && options.resource === 'index') {
    if (Object.keys(result).length) {
      $.each(result, function(order_id, order) {
        // Set the _commerce_order variable, so we will be able to use it
        // in reiscout_property_commerce_services_preprocess()
        _commerce_order[order_id] = order;
        // Process only one cart
        return false;
      });
    }
  }
}

/**
 * Implements hook_services_preprocess().
 * @param {Object} options
 */
function reiscout_property_commerce_services_preprocess(options) {
  try {
    // This Services call is initiated by commerce_line_item_create().
    if (options.service === 'line-item' && options.resource === 'create') {
      var data = options.data.match(/order_id=([\d]+).+commerce_product=([\d]+)/);
      var order_id = data[1];
      var product_id = data[2];
      var order = _commerce_order[order_id];

      // If there is at least one item in the cart
      if (order.commerce_line_items.length) {
        $.each(order.commerce_line_items_entities, function(line_item_id, line_item) {
          // If the product has been already added to the cart
          if (line_item.commerce_product === product_id) {
            var msg = '<div>' + t('You have already added the') + ' <em>' + line_item.line_item_title + '</em> ' +  t('product to the') + ' ' + l('cart', 'cart', {reloadPage: true}) + '.</div>'
                    + '<div>' + t('Add another product or go to') + ' ' + l('checkout', 'cart', {reloadPage: true}) + '!</div>';
            drupalgap_set_message(msg, 'warning');
            drupalgap_goto(drupalgap_path_get(), {reloadPage: true});
            // We don't want a request to the 'create' method of the 'line-item'
            // Services resource to be processed successfully
            // @todo: is there the right way to do it?
            options.data = '';
            return false;
          }
        });
      }

      // By default, _commerce_cart_add_to_cart_form_submit_success() is a function that
      // will be called if the request succeeds. The function will redirect user to the
      // 'Cart' page. But we do not want to redirect user. Instead, we want to reload
      // the current page and show him a message.
      options.success = function(result) {
        var msg = '<em>' + result.line_item_title + '</em> ' + t('has been added to your') + ' ' + l('cart', 'cart', {reloadPage: true});
        drupalgap_set_message(msg);
        drupalgap_goto(drupalgap_path_get(), {reloadPage: true});
      }
    }
  }
  catch (error) {
    console.log('reiscout_property_commerce_services_preprocess - ' + error);
  }
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
    else if (form_id == 'commerce_drupalgap_stripe_form') {
      form.elements['card_cvc']['type'] = 'number';

      form.elements['exp_month']['type'] = 'number';
      form.elements['exp_month']['prefix'] = '<label><strong>' + t('Expiration Date') + '</strong>*</label>';
      form.elements['exp_month']['title'] = '';
      form.elements['exp_month']['options']['attributes']['placeholder'] = t('MM');
      form.elements['exp_month']['suffix'] = '/';

      form.elements['exp_year']['type'] = 'number';
      form.elements['exp_year']['title'] = '';
      form.elements['exp_year']['options']['attributes']['placeholder'] = t('YYYY');
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
        form.elements.submit.value = 'Buy Property Lead for ' + node._price_title;
        form.elements.submit.access = true;
      }
    }
  }
  catch (error) {
    console.log('reiscout_property_commerce_form_commerce_cart_add_to_cart_form_alter - ' + error);
  }
}
