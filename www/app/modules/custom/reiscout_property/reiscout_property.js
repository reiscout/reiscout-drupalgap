/**
 * Implements hook_device_connected().
 */
function reiscout_property_device_connected() {
  if ('undefined' !== typeof drupalgap.menu_links['node/%/edit']) {
    drupalgap.menu_links['node/%/edit'].access_callback = '_reiscout_property_node_edit_access';
  }
}

/**
 * Implements hook_page_build().
 */
function reiscout_property_page_build(output) {
  if ('node/%' == drupalgap_router_path_get()) {
    if ('undefined' !== typeof output.theme && 'node' == output.theme && 'property' == output.node.type) {
      // If the user is not logged in, show a message to him
      if (!Drupal.user.uid) {
        var message = '<div class="messages status">'
                    + l('Log In', 'user/login?destination=node/' + output.node.nid)
                    + ' to be available to get current property address and owner info'
                    + '</div>';
        output.content.markup = message + output.content.markup
      }
    }
  }
}

/**
 * Implements hook_form_alter().
 */
function reiscout_property_form_alter(form, form_state, form_id) {
  try {
    if (form_id == 'node_edit' && form.bundle == 'property') {
      // The title field is hidden using CSS. Here we set its value to some text.
      // The field value will be filled with real value on a server side on save.
      form.elements['title'].default_value = 'value placeholder';

      // Hide some fields fro now
      var fields = [
        // hide owner fields
        'field_owner_postal_address', 'field_owner_phone',
        // hide product field
        'field_address_access_product',
        // hide property info fields
        'field_under_contract', 'field_arv', 'field_repairs_price', 'field_mortgage_company', 'field_assessed_value',
        'field_last_purchase_time', 'field_last_purchase_price', 'field_lot_size', 'field_bathrooms',
        'field_bedrooms', 'field_size', 'field_zillow_mls', 'field_zillow_status', 'field_zillow_zpid',
        // hide equity percentage fields
        'field_ep_calculated', 'field_ep_appraised'
      ];
      for (var i in fields) {
        var fieldname = fields[i];
        if (form.elements[fieldname]) {
          form.elements[fieldname].access = false;
        }
      }

      if ('undefined' !== typeof form.elements['field_data_locked']) {
        if (!drupalgap_user_has_role('administrator')) {
          form.elements['field_data_locked'].access = false;
        }
      }

      if (!Drupal.user.content_types_user_permissions.property.delete_own
       && !Drupal.user.content_types_user_permissions.property.delete_any) {
        if ('undefined' !== typeof form.buttons.delete) {
          delete form.buttons.delete;
        }
      }
    }
  }
  catch (error) {
    console.log('reiscout_property_form_alter - ' + error);
  }
}

/**
 * Implements hook_menu().
 */
function reiscout_property_menu() {
  var items = {};

  items['property-listing'] = {
    title: 'Reiscout',
    page_callback: 'reiscout_property_listing_page'
  };

  items['my-properties'] = {
    title: 'My Properties',
    page_callback: 'reiscout_property_my_properties_view_page',
    // See go.inc.js, drupalgap_goto(), line 151
    options: {
      reloadPage: true
    }
  };

  return items;
}

/**
 * The page callback to display the view.
 */
function reiscout_property_listing_page() {
  try {
    var content = {};

    content['reiscout_property_listing'] = {
      theme: 'view',
      format: 'unformatted_list',
      path: 'drupalgap/views_datasource/property-listing', /* the path to the view in Drupal */
      row_callback: 'reiscout_property_listing_row',
      empty_callback: 'reiscout_property_listing_empty',
      attributes: {
        id: 'reiscout_property_listing_view'
      }
    };

    return content;
  }
  catch (error) {
    console.log('reiscout_property_listing_page - ' + error);
  }
}

/**
 * The row callback to render a single row.
 */
function reiscout_property_listing_row(view, row) {
  try {
    var row_html = '';

    if (row.image.src && typeof row.image.src !== "undefined") {
      var image = theme('image', {
        path: row.image.src,
        alt: row.image.alt
      });
      row_html = '<div class="image">' + image + '</div>';

      if (row.address && row.address.length) {
        row_html += '<div class="address">' + row.address + '</div>';
      }

      row_html = '<div class="view-row">' + l(row_html, 'node/' + row.nid, {reloadPage: true}) + '</div>';
    }

    return row_html;
  }
  catch (error) {
    console.log('reiscout_property_listing_row - ' + error);
  }
}

/**
 * Shows empty view content
 */
function reiscout_property_listing_empty(view) {
  try {
    return t('Sorry, no property objects were found.');
  }
  catch (error) {
    console.log('reiscout_property_listing_empty - ' + error);
  }
}

/**
 * The page callback to display the view.
 */
function reiscout_property_my_properties_view_page() {
  try {
    var content = {};

    content['reiscout_my_properties_listing'] = {
      theme: 'view',
      format: 'unformatted_list',
      path: 'drupalgap/views_datasource/my-properties/' + Drupal.user.uid, /* the path to the view in Drupal */
      row_callback: 'reiscout_property_listing_row',
      empty_callback: 'reiscout_property_my_properties_view_empty',
      attributes: {
        id: 'reiscout_property_my_properties_view'
      }
    };
    return content;
  }
  catch (error) {
    console.log('reiscout_property_my_properties_view_page - ' + error);
  }
}

/**
 * Shows empty view content
 */
function reiscout_property_my_properties_view_empty(view) {
  try {
    return t('You are not added any property objects yet.');
  }
  catch (error) {
    console.log('reiscout_property_my_properties_view_empty - ' + error);
  }
}

/**
 * Implements hook_entity_post_render_field().
 * Called after drupalgap_entity_render_field() assembles the field content
 * string. Use this to make modifications to the HTML output of the entity's
 * field before it is displayed. The field content will be inside of
 * reference.content, so to make modifications, change reference.content. For
 * more info: http://stackoverflow.com/questions/518000/is-javascript-a-pass-by-reference-or-pass-by-value-language
 */
function reiscout_property_entity_post_render_field(entity, field_name, field, reference) {
  try {
    if (field.entity_type === 'node' && field.bundle === 'property') {
      if (field_name === 'field_image') {
        if (Drupal.user.uid != 0 && typeof entity._purchased_counter !== 'undefined') {
          reference.content += 'This lead has been purchased: ' + (entity._purchased_counter == 1 ? '1 time' : entity._purchased_counter + ' times');
        }
      }
    }
  }
  catch (error) {
    console.log('reiscout_property_entity_post_render_field - ' + error);
  }
}

/**
 * Defines if a user has an access to view a property's address.
 *
 * User may see a property's address if:
 * - he is a property's author OR
 * - he has bought a property's address.
 *
 * @param {object} entity
 * @param {int} uid
 * @returns {boolean}
 */
function _reiscout_property_user_can_view_property_address(entity, uid) {
  // If user is an administrator.
  if (drupalgap_user_has_role('administrator')) {
    return true;
  }

  // If user is a property's author.
  if (entity.uid == uid) {
    return true;
  }

  // If user has bought a property's address.
  if (typeof entity._user_bought_address_access_product !== 'undefined'
    && entity._user_bought_address_access_product === true) {
    return true;
  }

  return false;
}

/**
 * Defines if user has an access to view a property's owner info.
 *
 * User may see info about property's owner if:
 * - he is a property's author OR
 * - he has bought a property's address.
 *
 * @param {object} entity
 * @param {int} uid
 * @returns {boolean}
 */
function _reiscout_property_user_can_view_property_owner_info(entity, uid) {
  // If user is an administrator.
  if (drupalgap_user_has_role('administrator')) {
    return true;
  }

  // If user is a property's author.
  if (entity.uid == uid) {
    return true;
  }

  // If user has bought a property's address.
  if (typeof entity._user_bought_address_access_product !== 'undefined'
    && entity._user_bought_address_access_product === true) {
    return true;
  }

  return false;
}

/**
 * Determines if the current user has an access to edit the node given.
 * @param {Object} node
 * @return {Boolean}
 */
function _reiscout_property_node_edit_access(node) {
  try {
    // If the 'Lock data' field of the node is set to true
    if ('undefined' !== typeof node.field_data_locked['und']
     && 1 == node.field_data_locked['und'][0].value) {
      return false;
    }

    if ((node.uid == Drupal.user.uid && user_access('edit own ' + node.type + ' content'))
     || user_access('edit any ' + node.type + ' content')) {
      return true;
    }
    else {
      return false;
    }
  }
  catch (error) {
    console.log('_reiscout_property_node_edit_access - ' + error);
  }
}
