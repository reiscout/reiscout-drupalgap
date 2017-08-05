/**
 * Implements hook_menu().
 * @return {Object}
 */
function reiscout_tutorial_menu() {
  var items = {};

  items['tutorials'] = {
    title: 'Tutorials',
    page_callback: 'reiscout_tutorials_page',
    pageshow: 'reiscout_tutorials_page_pageshow',
    // See go.inc.js, drupalgap_goto(), line 151
    options: {
      reloadPage: true
    }
  };

  return items;
}

/**
 * The callback to render the 'Tutorials' page.
 */
function reiscout_tutorials_page() {
  try {
    var tutorials = [
      {
        id: 'register-account',
        title: 'How to Register an Account',
        src: 'https://www.youtube.com/embed/TYHgQsTrbWY'
      },
      {
        id: 'menu-overview',
        title: 'Menu Items Overview',
        src: 'https://www.youtube.com/embed/rv6Z2YWR6qk'
      },
      {
        id: 'add-property',
        title: 'How to Add a Property',
        src: 'https://www.youtube.com/embed/s8DYiRFRHIw'
      },
      {
        id: 'buy-property',
        title: 'How to Buy a Property Lead',
        src: 'https://www.youtube.com/embed/G6YRk9d2y74'
      }
    ];

    var html = '';

    for (i = 0; i < tutorials.length; ++i) {
      html += '<div class="tutorial">';

      html += '<div id="' + tutorials[i].id + '" class="video">';
      html += '<iframe src="' + tutorials[i].src + '" frameborder="0" allowfullscreen></iframe>';
      html += '</div>';

      html += '<div class="title">';
      html += tutorials[i].title;
      html += '</div>';

      html += '</div>';
    }

    return html;
  }
  catch (error) {
    console.log('reiscout_tutorials_page - ' + error);
  }
}

/**
 * A callback that is used during the pageshow event.
 */
function reiscout_tutorials_page_pageshow() {
  setTimeout(function() {
    // Scroll page to a video if ID of the video is provided in URL
    if (_GET('vid')) {
      var id = '#' + _GET('vid');
      $(window).scrollTop($(id).offset().top - jQuery('#tutorials .region_header').height() - 10);
    }
  }, 1000);
}

/**
 * Implements hook_drupalgap_goto_preprocess().
 */
function reiscout_tutorial_drupalgap_goto_preprocess(path) {
  var menu_link_router_path = drupalgap_get_menu_link_router_path(path);
  var closed_hints = JSON.parse(window.localStorage.getItem('closed_hints')) || [];

  // If menu link router path for the current URL is one of:
  // - 'property-listing'
  // - 'node/%'
  // and the current user is not logged in
  // and the user has not closed the 'register-account' hint
  if (in_array(menu_link_router_path, ['property-listing', 'node/%'])
   && !Drupal.user.uid
   && !in_array('register-account', closed_hints)) {
    var message = '<div>' + 'Please, ' + l('log in', 'user/login') + ' to get access to all the features of our app.' + '</div>'
                + '<div>' + 'If you have not created your personal account yet, please ' + l('do it', 'user/register') + ' now!' + '</div>'
                + '<div>' + l('Watch our video tutorial', 'tutorials') + ' on How to Register Your Account.' + '</div>'
                + '<div class="close"><a href="#" onclick="javascript:_reiscout_tutorial_close_hint(\'register-account\')">Do not show this message again</a></div>';
    drupalgap_set_message(message);
  }

  // If menu link router path for the current URL is 'node/%'
  // and the current user is not logged in
  // and the user has closed the 'register-account' hint
  if ('node/%' === menu_link_router_path
   && !Drupal.user.uid
   && in_array('register-account', closed_hints)) {
    var nid = arg(1, path);
    var message = 'Please, ' + l('log in', 'user/login?destination=node/' + nid)
                + ' to be able to see the property address and owner info!';
    drupalgap_set_message(message);
  }

  // If menu link router path for the current URL is one of:
  // - 'property-listing'
  // - 'node/%'
  // - 'my-properties'
  // and the current user is logged in
  // and the user has not created any properties yet
  // and the user has not closed the 'add-property' hint
  if (in_array(menu_link_router_path, ['property-listing', 'node/%', 'my-properties'])
   && Drupal.user.uid
   && !Drupal.user._amount_of_added_properties
   && !in_array('add-property', closed_hints)) {
    var message = '<div>' + 'Hi ' + Drupal.user.name + ',' + '</div>'
                + '<div>' + 'You have not added any properties yet. You can ' + l('do it', 'node/add/property') + ' now.' + '</div>'
                + '<div>' + l('Watch our video tutorial', 'tutorials?vid=add-property') + ' on How to Add a Property.' + '</div>'
                + '<div class="close"><a href="#" onclick="javascript:_reiscout_tutorial_close_hint(\'add-property\')">Do not show this message again</a></div>';
    drupalgap_set_message(message);
  }
}

/**
 * Implements hook_page_build().
 */
function reiscout_tutorial_page_build(output) {
  var closed_hints = JSON.parse(window.localStorage.getItem('closed_hints')) || [];

  // If menu link router path for the current URL is 'node/%'
  if ('node/%' === drupalgap_router_path_get()
   && 'undefined' !== typeof output.theme && 'node' === output.theme && 'property' === output.node.type) {
    // If the current user is the author of the current property
    // and the 'Full info' tag has not been attached to the property
    if (Drupal.user.uid === output.node.uid
     && !_reiscout_tutorial_is_tag_attached_to_property(output.node, 'Full info')) {
      // If the user does not have Property Data points
      // and he has not closed the 'buy-property-data-points' hint
      if (0 >= Drupal.user._amount_of_property_data_points
       && !in_array('buy-property-data-points', closed_hints)) {
        var message = '<div class="messages status">'
                    + '<div>' + 'Hi ' + Drupal.user.name + ',' + '</div>'
                    + '<div>We provide property data for all 50 states.</div>'
                    + '<div>To autofill your property listing you must <strong>purchase Property Data points<strong>.</div>'
                    + '<div>' + l('Watch our video tutorial', 'tutorials?vid=buy-property-data-points') + ' on How to Buy Property Data Points.' + '</div>'
                    + '<div class="close"><a href="#" onclick="javascript:_reiscout_tutorial_close_hint(\'buy-property-data-points\')">Do not show this message again</a></div>'
                    + '</div>';
        output.content.markup = message + output.content.markup
      }

      // If the user has Property Data points
      // and he has not closed the 'pull-property-data' hint
      if (0 < Drupal.user._amount_of_property_data_points
       && !in_array('pull-property-data', closed_hints)) {
        var message = '<div class="messages status">'
                    + '<div>' + 'Hi ' + Drupal.user.name + ',' + '</div>'
                    + '<div>We provide property data for all 50 states.</div>'
                    + '<div>Click the <strong>Pull Property Data</strong> button to autofill your property listing!</div>'
                    + '<div>' + l('Watch our video tutorial', 'tutorials?vid=pull-property-data') + ' on How to Pull a Property Data.' + '</div>'
                    + '<div class="close"><a href="#" onclick="javascript:_reiscout_tutorial_close_hint(\'pull-property-data\')">Do not show this message again</a></div>'
                    + '</div>';
        output.content.markup = message + output.content.markup
      }
    }

    // If the current user is the author of the current property
    // or the user bought the property lead
    // and the 'Owner info' tag has been attached to the property
    if ((Drupal.user.uid === output.node.uid
     || output.node._user_bought_address_access_product)
     && _reiscout_tutorial_is_tag_attached_to_property(output.node, 'Owner info')) {
      // If the user does not have Mail points
      // and he has not closed the 'buy-mail-points' hint
      if (0 >= Drupal.user._amount_of_mail_points
       && !in_array('buy-mail-points', closed_hints)) {
        var message = '<div class="messages status">'
                    + '<div>' + 'Hi ' + Drupal.user.name + ',' + '</div>'
                    + '<div>Send a physical postcard to the property owner!</div>'
                    + '<div>To be able to do it you must <strong>purchase Mail points<strong>.</div>'
                    + '<div>' + l('Watch our video tutorial', 'tutorials?vid=buy-mail-points') + ' on How to Buy Mail Points.' + '</div>'
                    + '<div class="close"><a href="#" onclick="javascript:_reiscout_tutorial_close_hint(\'buy-mail-points\')">Do not show this message again</a></div>'
                    + '</div>';
        output.content.markup = message + output.content.markup
      }

      // If the user has Mail points
      // and he has not closed the 'send-postcard' hint
      if (0 < Drupal.user._amount_of_mail_points
       && !in_array('send-postcard', closed_hints)) {
        var message = '<div class="messages status">'
                    + '<div>' + 'Hi ' + Drupal.user.name + ',' + '</div>'
                    + '<div>Click the <strong>Send a Postcard</strong> button to send a physical postcard to the property owner!</div>'
                    + '<div>' + l('Watch our video tutorial', 'tutorials?vid=send-postcard') + ' on How to Send a Postcard.' + '</div>'
                    + '<div class="close"><a href="#" onclick="javascript:_reiscout_tutorial_close_hint(\'send-postcard\')">Do not show this message again</a></div>'
                    + '</div>';
        output.content.markup = message + output.content.markup
      }
    }
  }
}

/**
 * Implements hook_services_request_pre_postprocess_alter().
 */
function reiscout_tutorial_services_request_pre_postprocess_alter(options, result) {
  try {
    // If a postcard has been sent successfully, decrease a value of _amount_of_mail_points
    if ('reiscout_mail_postcard' === options.service && 'send' === options.resource) {
      if (result.status) {
        --Drupal.user._amount_of_mail_points;
      }
    }
    // If property data have been pulled successfully, decrease a value of _amount_of_property_data_points
    else if ('ownerinfo' === options.service && 'getinfo' === options.resource) {
      if (result.status) {
        --Drupal.user._amount_of_property_data_points;
      }
    }
  }
  catch (error) {
    console.log('reiscout_tutorial_services_request_pre_postprocess_alter - ' + error);
  }
}

/**
 * Implements hook_services_postprocess().
 */
function reiscout_tutorial_services_postprocess(options, result) {
  try {
    // If checkout has been completed successfully, check which products have been purchased
    if ('checkout_complete' === options.service && 'create' === options.resource) {
      if (result[0]) {
        var order_id = arg(2);
        var order = _commerce_order[order_id];

        $.each(order.commerce_line_items_entities, function(line_item_id, line_item) {
          // If the 'Property Data points' product has been purchased,
          // increase a value of _amount_of_property_data_points
          if ('596' === line_item.commerce_product) {
            Drupal.user._amount_of_property_data_points += line_item.product_points_amount;
          }
          // If the 'Mail points' product has been purchased,
          // increase a value of _amount_of_mail_points
          else if ('597' === line_item.commerce_product) {
            Drupal.user._amount_of_mail_points += line_item.product_points_amount;
          }
        });
      }
    }
  }
  catch (error) {
    console.log('reiscout_tutorial_services_postprocess - ' + error);
  }
}

/**
 * Adds a hint ID into an array of hints that were closed
 * and hides messages.
 */
function _reiscout_tutorial_close_hint(id) {
  var closed_hints = JSON.parse(window.localStorage.getItem('closed_hints')) || [];

  if (!in_array(id, closed_hints)) {
    closed_hints.push(id);
    window.localStorage.setItem('closed_hints', JSON.stringify(closed_hints));
  }

  $('.messages').hide();
}

/**
 * Given a tag name, checks if the tag has been attached to a property.
 */
function _reiscout_tutorial_is_tag_attached_to_property(node, tag_name) {
  if ('undefined' !== typeof node.field_data_quality_tags['und']) {
    var tags = node.field_data_quality_tags['und'];
    for (var tag in tags) {
      if (tag_name === tags[tag].name) {
        return true;
      }
    }
  }

  return false;
}
