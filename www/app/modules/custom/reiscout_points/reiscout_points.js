/**
 * Implements hook_menu().
 */
function reiscout_points_menu() {
  var items = {};

  items['reiscout-points-balance'] = {
    title: t('My Balance'),
    page_callback: 'reiscout_points_balance_page',
    // See go.inc.js, drupalgap_goto(), line 151
    options: {
      reloadPage: true
    }
  };

  items['reiscout-points/buy'] = {
    title: t('Buy a points package'),
    page_callback: 'reiscout_points_buy_package_page',
    pageshow: 'reiscout_points_buy_package_page_pageshow',
    // See go.inc.js, drupalgap_goto(), line 151
    options: {
      reloadPage: true
    }
  };

  items['reiscout-points/buy/%'] = {
    title: t('Buy Reiscout points'),
    page_callback: 'reiscout_points_buy_page',
    pageshow: 'reiscout_points_buy_page_pageshow',
    page_arguments: [2],
    // See go.inc.js, drupalgap_goto(), line 151
    options: {
      reloadPage: true
    }
  };

  return items;
}

/**
 * Page callback; Displays a user's current balance in Reiscout points.
 */
function reiscout_points_balance_page() {
  try {
    var html = '<div id="reiscout-points-user-balance">';

    html += '<div class="current-state">';
    html += drupalgap_format_plural(Drupal.user._points, t('You have 1 point'), t('You have') + ' ' + Drupal.user._points + ' ' + t('points'));
    html += '</div>';

    html += '<div class="description">';
    html += t('Points may be used for the purchase of any product (service) within our application');
    html += '</div>';

    html += '<div class="buy-points-link">';
    html += l(t('Buy more points'), 'reiscout-points/buy/10?return_to=reiscout-points-balance');
    html += '</div>';

    html += '<div class="buy-points-link">';
    html += l(t('Buy a points package'), 'reiscout-points/buy?return_to=reiscout-points-balance');
    html += '</div>';

    html += '</div>';

    return html;
  }
  catch (error) {
    console.log('reiscout_points_balance_page - ' + error);
  }
}

/**
 * Menu callback; Allows a user to buy a Reiscout points package.
 */
function reiscout_points_buy_package_page(amount) {
  try {
    var content = {};

    // On checkout completion we want to redirect a user to a page he started
    // the buying process from. To do it we need save the value of 'return_to'
    // parameter first.
    if (_GET('return_to')) {
      window.localStorage.setItem('reiscout_points_return_path', _GET('return_to'));
    }

    // An HTML-container for a form
    content['form'] = {
      markup: '<div id="form-buy-points-package"></div>'
    };

    return content;
  }
  catch (error) {
    console.log('reiscout_points_buy_package_page - ' + error);
  }
}

/**
 * A callback that is used during the pageshow event.
 */
function reiscout_points_buy_package_page_pageshow() {
  try {
    Drupal.services.call({
      method: 'POST',
      path: 'reiscout_points/get_package_products_options',
      service: 'reiscout_points',
      resource: 'get_package_products_options',
      success: function(data) {
        if ('undefined' !== typeof data.package_products) {
          var form = drupalgap_get_form('reiscout_points_buy_package_form', data.package_products);
          $('#form-buy-points-package').html(form).trigger('create');
        }
        else {
          var msg = t('Sorry, there are no any points packages available at this time.');
          drupalgap_set_message(msg, 'warning');
          drupalgap_goto(_reiscout_points_get_return_path(), {reloadPage: true});
        }
      },
      error: function(xhr, status, message) {
        var msg = t('An unexpected error happened. Please, try again later or contact technical support for assistance!');
        drupalgap_set_message(msg, 'error');
        drupalgap_goto(_reiscout_points_get_return_path(), {reloadPage: true});
      }
    });
  }
  catch (error) {
    console.log('reiscout_points_buy_page_pageshow - ' + error);
  }
}

/**
 * Form builder; Allows a user to buy a Reiscout points package.
 *
 * @see reiscout_points_buy_package_form_submit()
 */
function reiscout_points_buy_package_form(form, form_state, package_products) {
  try {
    form.elements['product_id'] = {
      title: t('Choose a points package:'),
      type: 'radios',
      options: package_products,
      value: Object.keys(package_products)[0]
    };

    form.elements['submit'] = {
      type: 'submit',
      value: t('Buy Points')
    };

    form.buttons['cancel'] = drupalgap_form_cancel_button();

    return form;
  }
  catch (error) {
    console.log('reiscout_points_buy_package_form - ' + error);
  }
}

/**
 * Form submission handler for reiscout_points_buy_package_form().
 *
 * @see reiscout_points_buy_package_form()
 */
function reiscout_points_buy_package_form_submit(form, form_state) {
  try {
    var data = {
      product_id: form_state.values.product_id,
      amount: 1
    };
    _reiscout_points_add_product_to_cart(data);
  }
  catch (error) {
    console.log('reiscout_points_buy_package_form_submit - ' + error);
  }
}

/**
 * Menu callback; Adds '1 point' product to a user's cart.
 */
function reiscout_points_buy_page(amount) {
  try {
    // On checkout completion we want to redirect a user to a page he started
    // the buying process from. To do it we need save the value of 'return_to'
    // parameter first.
    if (_GET('return_to')) {
      window.localStorage.setItem('reiscout_points_return_path', _GET('return_to'));
    }

    return '';
  }
  catch (error) {
    console.log('reiscout_points_buy_page - ' + error);
  }
}

/**
 * A callback that is used during the pageshow event.
 */
function reiscout_points_buy_page_pageshow(amount) {
  try {
    // If a provided amount is not a positive integer
    if (parseInt(amount) != amount || amount < 0) {
      amount = 10;
    }

    var data = {
      amount: amount
    };

    _reiscout_points_add_product_to_cart(data);
  }
  catch (error) {
    console.log('reiscout_points_buy_page_pageshow - ' + error);
  }
}

/**
 * Form builder; A form to buy a Reiscout product.
 *
 * @see reiscout_points_buy_product_form_submit()
 */
function reiscout_points_buy_product_form(form, form_state, product_id, params, info) {
  form.options.attributes = {
    class: product_id
  };

  if (info.available) {
    form.elements['submit'] = {
      type: 'submit',
      value: info.title,
      description: info.desc
    };
  }
  else {
    form.elements['button'] = {
      type: 'button',
      text: info.title,
      attributes: {class: 'ui-disabled'},
      description: info.desc
    };
  }

  return form;
}

/**
 * Form submission handler for reiscout_points_buy_product_form().
 *
 * @see reiscout_points_buy_product_form()
 */
function reiscout_points_buy_product_form_submit(form, form_state) {
  try {
    Drupal.services.call({
      method: 'POST',
      path: 'reiscout_points_product/sell.json',
      service: 'reiscout_points_product',
      resource: 'sell',
      data: JSON.stringify({
        product_id: form.arguments[0],
        params: form.arguments[1]
      }),
      success: function(data) {
        Drupal.user._points = data.balance;
        var status = data.status ? 'status' : 'error';
        drupalgap_set_message(data.message, status);
        drupalgap_goto(drupalgap_path_get(), {reloadPage: true});
      },
      error: function(xhr, status, message) {
        var msg = t('An unexpected error happened. Please, try again later or contact technical support for assistance!');
        drupalgap_set_message(msg, 'error');
        drupalgap_goto(drupalgap_path_get(), {reloadPage: true});
      }
    });
  }
  catch (error) {
    console.log('reiscout_points_buy_product_form_submit - ' + error);
  }
}

/**
 * Returns a form to buy a Reiscout product.
 */
function reiscout_points_get_buy_product_form(product_id, params, info) {
  return drupalgap_get_form('reiscout_points_buy_product_form', product_id, params, info);
}

/**
 * Implements hook_entity_post_render_field().
 */
function reiscout_points_entity_post_render_field(entity, field_name, field, reference) {
  try {
    if ('node' === field.entity_type && 'property' === field.bundle) {
      if (field_name === 'field_image') {
        if ('undefined' !== typeof entity._reiscout_points_products) {
          // If a user is allowed to buy a 'Buy Property Lead' product
          if ('undefined' !== typeof entity._reiscout_points_products.property_lead) {
            // Attach a form to buy a 'Buy Property Lead' product
            var params = {nid: entity.nid};
            reference.content = reiscout_points_get_buy_product_form('property_lead', params, entity._reiscout_points_products.property_lead)
                              + reference.content;
          }
          // If a user is allowed to buy a 'Pull Property Data' product (service)
          else if ('undefined' !== typeof entity._reiscout_points_products.property_data) {
            // Attach a form to buy a 'Pull Property Data' product (service)
            var params = {nid: entity.nid};
            reference.content = reiscout_points_get_buy_product_form('property_data', params, entity._reiscout_points_products.property_data)
                              + reference.content;
          }
        }
      }
      else if (field_name === 'field_owner_postal_address') {
        // If a user is allowed to buy a 'Send a Postcard' product (service)
        if ('undefined' !== typeof entity._reiscout_points_products
         && 'undefined' !== typeof entity._reiscout_points_products.send_postcard) {
            // Attach a form to buy a 'Send a Postcard' product (service)
            var params = {nid: entity.nid};
            reference.content = reference.content
                              + reiscout_points_get_buy_product_form('send_postcard', params, entity._reiscout_points_products.send_postcard);
        }
      }
    }
  }
  catch (error) {
    console.log('reiscout_points_entity_post_render_field - ' + error);
  }
}

/**
 * Implements hook_services_postprocess().
 * @param {Object} options
 * @param {Object} result
 */
function reiscout_points_services_postprocess(options, result) {
  try {
    if ('checkout_complete' === options.service && 'create' === options.resource) {
      // If checkout has been completed successfully and we have received
      // information about a user's current balance in Reiscout points
      if ('undefined' !== typeof result.balance) {
        Drupal.user._points = result.balance;
        var msg = t('Now you have')
                + ' '
                + drupalgap_format_plural(Drupal.user._points, t('1 point'), Drupal.user._points + ' ' + t('points'));
        drupalgap_set_message(msg);
        drupalgap_goto(_reiscout_points_get_return_path(), {reloadPage: true});
      }
    }
  }
  catch (error) {
    console.log('reiscout_points_services_postprocess - ' + error);
  }
}

/**
 * Adds corresponding amount of Points product to a user's cart.
 *
 * Makes a request to 'add_product_to_cart' resource of 'reiscout_points'
 * Services service that clears a user's cart and adds corresponding amount
 * of Points product to the cart.
 */
function _reiscout_points_add_product_to_cart(data) {
  Drupal.services.call({
    method: 'POST',
    path: 'reiscout_points/add_product_to_cart.json',
    service: 'reiscout_points',
    resource: 'add_product_to_cart',
    data: JSON.stringify(data),
    success: function(data) {
      if (data.status) {
        drupalgap_goto('cart', { reloadPage: true });
      }
      else {
        drupalgap_set_message(data.message, 'error');
        drupalgap_goto(_reiscout_points_get_return_path(), {reloadPage: true});
      }
    },
    error: function(xhr, status, message) {
      var msg = t('An unexpected error happened. Please, try again later or contact technical support for assistance!');
      drupalgap_set_message(msg, 'error');
      drupalgap_goto(_reiscout_points_get_return_path(), {reloadPage: true});
    }
  });
}

/**
 * Returns a path to redirect a user to.
 */
function _reiscout_points_get_return_path() {
  return window.localStorage.getItem('reiscout_points_return_path') || 'reiscout-points-balance';
}
