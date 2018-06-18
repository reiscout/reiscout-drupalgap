/**
 * Implements hook_install().
 * This hook is used by modules that need to execute custom code when the module
 * is loaded. Note, the Drupal.user object is not initialized at this point, and
 * always appears to be an anonymous user.
 */
function reiscout_address_install() {
  try {
    // Add libs required by address autocomplete feature.
    drupalgap_add_js('https://maps.googleapis.com/maps/api/js?libraries=places&key=' + drupalgap.settings.google_maps.javascript_api_key);
    drupalgap_add_js('app/libraries/geocomplete/jquery.geocomplete.min.js');
    drupalgap_add_css(drupalgap_get_path('module', 'reiscout_address') + '/reiscout_address.css');
  }
  catch (error) {
    console.log('reiscout_address_install - ' + error);
  }
}

/**
 * Implements hook_form_alter().
 * This hook is used to make alterations to existing forms.
 */
function reiscout_address_form_alter(form, form_state, form_id) {
  try {
    if (Drupal.settings.debug) {
      console.log(['reiscout_address_form_alter', form, form_state, form_id]);
    }

    if (form_id === 'user_login_form') {
      form.submit = ['_reiscout_address_user_login_form_submit'];

      if (typeof form.buttons.create_new_account !== 'undefined') {
        form.buttons.create_new_account.attributes.onclick = "drupalgap_goto('" + _reiscout_address_path_destination('user/register') + "')";
      }

      if (typeof form.buttons.forgot_password !== 'undefined') {
        form.buttons.forgot_password.attributes.onclick = "drupalgap_goto('" + _reiscout_address_path_destination('user/password') + "')";
      }
    }
    else if (form_id === 'user_register_form') {
      form.submit = ['_reiscout_address_user_register_form_submit'];
    }
    else if (form_id === 'user_profile_form') {
      var elements = form.elements;

      if ('undefined' !== typeof elements.field_default_template_nid) {
        elements.field_default_template_nid.access = false;
      }

      // If the form contains field_user_postal_address field
      if ('undefined' !== typeof elements.field_user_postal_address) {
        // of 'Postal address' type
        if ('addressfield' === elements.field_user_postal_address.type) {
          // that displayed by 'Dynamic address form' widget
          if ('addressfield_standard' === elements.field_user_postal_address.field_info_instance.widget.type) {
            if ('undefined' === typeof field_user_postal_address_weight) {
              field_user_postal_address_weight = elements.field_user_postal_address.field_info_instance.widget.weight;
              elements.field_user_postal_address.field_info_instance.widget.weight = 0;
            }
            _reiscout_address_enable_addressfield_autocomplete_widget_on_addressfield(form.id, elements, 'field_user_postal_address', field_user_postal_address_weight);
          }
        }
      }
    }
    else if (form_id === 'user_pass_form') {
      form.submit = ['_reiscout_address_user_pass_form_submit'];
    }
    else if (form_id === 'node_edit' && form.bundle === 'property') {
      var elements = form.elements;

      if (module_exists('geofield')) {
        if (typeof elements.field_geo_position !== 'undefined') {
          if (elements.field_geo_position.type === 'geofield') {
            if (in_array(elements.field_geo_position.field_info_instance.widget.type, ['geofield_latlon', 'reiscout_geofield_latlon'])) {
              // Update standard 'Get location' button behaviour:
              // - get the current position of the device;
              // - make a request to a Services 'geocoderapi/geocode_reverse.json' resource
              // for reverse geocoding the current position to a formatted address;
              // - put the formatted address in an address field.
              elements.field_geo_position.field_info_instance.widget.module = 'reiscout_address';
              elements.field_geo_position.field_info_instance.widget.type = 'reiscout_geofield_latlon';

              // The ID of the address field to put a reverse geocoded formatted address in
              elements.field_geo_position.address_autocomplete_field_id = drupalgap_form_get_element_id('field-address', form_id, 'und', 0) + '-autocomplete';
            }
            else {
              console.log('WARNING: reiscout_address_form_alter() - field field_geo_position has unsupported widget type: ' + elements.field_geo_position.field_info_instance.widget.type);
            }
          }
          else {
            console.log('WARNING: reiscout_address_form_alter() - field field_geo_position has unsupported field type: ' + elements.field_geo_position.type);
          }
        }
        else {
          console.log('WARNING: reiscout_address_form_alter() - field field_geo_position is missing');
        }
      }
      else {
        console.log('WARNING: reiscout_address_form_alter() - module geofield is not installed');
      }

      // If the form contains field_address field
      if ('undefined' !== typeof elements.field_address) {
        // of 'Postal address' type
        if ('addressfield' === elements.field_address.type) {
          // that displayed by 'Dynamic address form' widget
          if ('addressfield_standard' === elements.field_address.field_info_instance.widget.type) {
            if ('undefined' === typeof field_address_weight) {
              field_address_weight = elements.field_address.field_info_instance.widget.weight;
              elements.field_address.field_info_instance.widget.weight = 0;
            }
            _reiscout_address_enable_addressfield_autocomplete_widget_on_addressfield(form.id, elements, 'field_address', field_address_weight);

            // If this form is used for a node creation, clear localStorage that was set by addressfield.js module.
            if ('undefined' === typeof form.arguments[0].nid) {
              window.localStorage.removeItem('addressfield_get_address_format_and_administrative_areas_US');
            }
          }
        }
      }
    }
  }
  catch (error) {
    console.log('reiscout_address_form_alter - ' + error);
  }
}

/**
 * Provides the address autocomplete feature for a field of 'Postal address' type.
 */
function _reiscout_address_enable_addressfield_autocomplete_widget_on_addressfield(form_id, elements, field_name, weight) {
  var field_name_class = field_name.replace(/_/g, '-');
  var widget_id = drupalgap_form_get_element_id(field_name_class, form_id, 'und', 0);

  if ('undefined' !== typeof elements[field_name].und[0].item) {
    var address = elements[field_name].und[0].item.thoroughfare
                + ', '
                + elements[field_name].und[0].item.locality
                + ', '
                + elements[field_name].und[0].item.administrative_area
                + ', '
                + elements[field_name].und[0].item.postal_code;
  }

  // Address autocomplete feature will be attached to this field.
  elements[field_name_class + '-und-0-value-autocomplete'] = {
    type: 'textfield',
    title: 'Address',
    description: elements[field_name].description,
    default_value: ('undefined' !== typeof address) ? address : '',
    required: true,
    weight: weight,
    attributes: {
      id: widget_id + '-autocomplete',
      'data-clear-btn': true
    }
  };

  // We use 'pageshow' event to attach the autocomplete feature to the field.
  elements[field_name_class + '-autocomplete-markup'] = {
    markup: drupalgap_jqm_page_event_script_code({
      page_id: drupalgap_get_page_id(),
      jqm_page_event: 'pageshow',
      jqm_page_event_callback: '_reiscout_address_field_autocomplete_enable',
      jqm_page_event_args: JSON.stringify({
        widget_id: widget_id
      })
    })
  };
}

/**
 * Implements hook_field_widget_form().
 * @param {Object} form
 * @param {Object} form_state
 * @param {Object} field
 * @param {Object} instance
 * @param {String} langcode
 * @param {Object} items
 * @param {Number} delta
 * @param {Object} element
 */
function reiscout_address_field_widget_form(form, form_state, field, instance, langcode, items, delta, element) {
  try {
    if (Drupal.settings.debug) {
      console.log(['reiscout_address_field_widget_form', form, form_state, field, instance, langcode, items, delta, element]);
    }

    if (instance.widget.type === 'reiscout_geofield_latlon') {
      items[delta].type = 'hidden';

      if (items[delta].item) {
        items[delta].value = items[delta].item.lat + ',' + items[delta].item.lon;
      }

      items[delta].children.push({
        id: items[delta].id + '-btn',
        text: t('Get GPS Address'),
        type: 'button',
        options: {
          attributes: {
            onclick: "_reiscout_address_getposition_click('" + items[delta].id + "', '" + element.address_autocomplete_field_id + "')"
          }
        }
      });
    }
    else {
      console.log('WARNING: reiscout_address_field_widget_form() - unsupported widget type: ' + instance.widget.type);
    }
  }
  catch (error) {
    console.log('reiscout_address_field_widget_form - ' + error);
  }
}

function _reiscout_address_getposition_click(position_id, address_autocomplete_field_id) {
  try {
    if (Drupal.settings.debug) {
      console.log(['_reiscout_address_getposition_click', position_id, address_autocomplete_field_id]);
    }

    if (!navigator.geolocation) {
      drupalgap_alert(t('Geolocation is not supported by your device.'));
      return;
    }

    drupalgap_loading_message_show({
      text: t('Getting position and address') + '...',
      textVisible: true,
      theme: 'b'
    });

    var alertMessage = t('Could not detect your position. Please, enter address manually.');

    navigator.geolocation.getCurrentPosition(
      function (position) {
        if (Drupal.settings.debug) {
          console.log(['_reiscout_address_getposition_click.getCurrentPosition', position]);
        }

        if (typeof position.coords.latitude !== 'undefined' && typeof position.coords.longitude !== 'undefined') {
          $('#' + position_id).val([position.coords.latitude, position.coords.longitude].join(','));

          Drupal.services.call({
            method: 'POST',
            path: 'geocoderapi/geocode_reverse.json',
            service: 'geocoderapi',
            resource: 'geocode_reverse',
            data: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }),
            success: function(result) {
              if (Drupal.settings.debug) {
                console.log(['_reiscout_address_getposition_click.geocode_reverse.success', result]);
              }

              if ($('#' + address_autocomplete_field_id).length) {
                $('#' + address_autocomplete_field_id).val(result.formatted_address).trigger('geocode');
              }
              else {
                console.log('WARNING: _reiscout_address_getposition_click - address field to put a reverse geocoded formatted address in is not found');
              }

              drupalgap_loading_message_hide();
            },
            error: function(xhr, status, message) {
              if (Drupal.settings.debug) {
                console.log(['_reiscout_address_getposition_click.geocode_reverse.error', xhr, status, message]);
              }

              drupalgap_loading_message_hide();
              drupalgap_alert(alertMessage);
            }
          });
        }
        else {
          drupalgap_loading_message_hide();
          drupalgap_alert(alertMessage);
        }
      },
      function (error) {
        if (Drupal.settings.debug) {
          console.log(['_reiscout_address_getposition_click.getCurrentPosition', error]);
        }

        drupalgap_loading_message_hide();
        drupalgap_alert(alertMessage);
      },
      {
        enableHighAccuracy: true
      }
    );
  }
  catch (error) {
    console.log('_reiscout_address_getposition_click - ' + error);
  }
}

/**
 * Attaches address autocomplete feature to a field.
 */
function _reiscout_address_field_autocomplete_enable(data) {
  try {
    // Restrict suggestions to US country.
    var options = {
      country: 'us'
    };

    var widget_id = data.widget_id;

    // IDs of fields result address will be put in.
    var fields_mapping = {
      locality: widget_id + '-locality',
      administrative_area_level_1: widget_id + '-administrative_area',
      postal_code: widget_id + '-postal_code'
    };

    $('#' + widget_id + '-autocomplete')
      .geocomplete(options)
      .bind("geocode:result", function(event, result) {
        // Fill 'Address 1' field.
        $('#' + widget_id + '-thoroughfare').val(result.formatted_address.split(',')[0]);

        // Iterate over all components of result address and
        // fill the corresponding fields of the address widget.
        for (var i = 0; i < result.address_components.length; ++i) {
          var address_type = result.address_components[i].types[0];
          var field_id = fields_mapping[address_type];
          if (typeof field_id !== 'undefined') {
            $('#' + field_id).val(result.address_components[i].short_name).change();
          }
        }
      });
  }
  catch (error) {
    console.log('_reiscout_address_field_autocomplete_enable - ' + error);
  }
}

function _reiscout_address_goto(path, destination) {
  try {
    if (Drupal.settings.debug) {
      console.log(['_reiscout_address_goto', path, destination]);
    }

    path = _reiscout_address_path_destination(path, destination ? destination : drupalgap_path_get());

    drupalgap_goto(path);
  }
  catch (error) {
    console.log('_reiscout_address_goto - ' + error);
  }
}

function _reiscout_address_goto_destination(path, forward) {
  try {
    if (Drupal.settings.debug) {
      console.log(['_reiscout_address_goto_destination', path, forward]);
    }

    var destination = _GET('destination');
    
    if (destination) {
      path = (forward ? _reiscout_address_path_destination(path, destination) : destination);
    }
    else if (typeof path === 'undefined' || !path.length) {
      path = drupalgap.settings.front;
    }

    drupalgap_goto(path, {reloadPage: true});
  }
  catch (error) {
    console.log('_reiscout_address_goto_destination - ' + error);
  }
}

function _reiscout_address_path_destination(path, destination) {
  try {
    if (Drupal.settings.debug) {
      console.log(['_reiscout_address_path_destination', path, destination]);
    }
    
    if (typeof path === 'undefined' || !path.length) {
      path = drupalgap.settings.front;
    }

    if (!destination) {
      destination = _GET('destination');
    }

    if (destination) {
      path += '?destination=' + destination;
    }

    return path;
  }
  catch (error) {
    console.log('_reiscout_address_path_destination - ' + error);
  }
}