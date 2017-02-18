/**
 * Implements hook_install().
 * This hook is used by modules that need to execute custom code when the module
 * is loaded. Note, the Drupal.user object is not initialized at this point, and
 * always appears to be an anonymous user.
 */
function reiscout_address_install() {
  try {
    // Add libs required by address autocomplete feature.
    var google_maps_javascript_api_key = 'AIzaSyBx9gwBnaYdWhHbxOQE9h7I-ZV96YUxrHs';
    var module_path = drupalgap_get_path('module', 'reiscout_address');
    drupalgap_add_js('https://maps.googleapis.com/maps/api/js?libraries=places&key=' + google_maps_javascript_api_key);
    drupalgap_add_js('app/libraries/geocomplete/jquery.geocomplete.min.js');
    drupalgap_add_css(module_path + '/reiscout_address.css');
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
    else if (form_id === 'user_pass_form') {
      form.submit = ['_reiscout_address_user_pass_form_submit'];
    }
    else if (form_id === 'node_edit' && form.bundle === 'property') {
      // Implement address geocomplete for field_address_text
      var address, position, delta;
      var language = language_default();
      var elements = form.elements;

      // @todo: delete this code block
      if (typeof elements.field_address_text !== 'undefined') {
        if (elements.field_address_text.type === 'text') {
          if (in_array(elements.field_address_text.field_info_instance.widget.type, ['text_textfield', 'reiscout_geocomplete'])) {
            address = elements.field_address_text;
            address.field_info_instance.widget.module = 'reiscout_address';
            address.field_info_instance.widget.type = 'reiscout_geocomplete';
          }
          else {
            console.log('WARNING: reiscout_address_form_alter() - field field_address_text has unsupported widget type: ' + elements.field_address_text.field_info_instance.widget.type);
          }
        }
        else {
          console.log('WARNING: reiscout_address_form_alter() - field field_address_text has unsupported field type: ' + elements.field_address_text.type);
        }
      }
      else {
        console.log('WARNING: reiscout_address_form_alter() - field field_address_text is missing');
      }

      if (module_exists('geofield')) {
        if (typeof elements.field_geo_position !== 'undefined') {
          if (elements.field_geo_position.type === 'geofield') {
            if (in_array(elements.field_geo_position.field_info_instance.widget.type, ['geofield_latlon', 'reiscout_geofield_latlon'])) {
              // Update standard 'Get location' button behaviour:
              // after success geo coords retrieving it request the website for address (text) for the coords and
              // put the address to field_address_text.
              position = elements.field_geo_position;
              position.field_info_instance.widget.module = 'reiscout_address';
              position.field_info_instance.widget.type = 'reiscout_geofield_latlon';
              position.reiscout_address_id = '';
              
              if (address && typeof address[language] !== 'undefined') {
                for (delta in address[language]) {
                  if (address[language].hasOwnProperty(delta)) {
                    position.reiscout_address_id = address[language][delta].id;
                    break;
                  }
                }
              }

              if (!position.reiscout_address_id.length) {
                console.log('WARNING: reiscout_address_form_alter() - address id not found');
              }
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

      // Is it a field_address field with addressfield_autocomplete widget enabled on it?
      if (typeof elements.field_address !== 'undefined') {
        if (elements.field_address.type === 'addressfield') {
          if (elements.field_address.field_info_instance.widget.type == 'addressfield_autocomplete') {
            // A value that is stored in field_info_instance.widget.module property defines what
            // module will provide a widget for the field. addressfield_autocomplete module is not
            // exists, so we set it to 'reiscout_address' and now _drupalgap_form_render_element()
            // will call reiscout_address_field_widget_form().
            elements.field_address.field_info_instance.widget.module = 'reiscout_address';

            // A value_callback function will be used for form_state array generation on form submission phase.
            elements.field_address.value_callback = 'addressfield_field_value_callback';

            // We hide the field's title because field_address_autocomplete field's title will be displayed.
            elements.field_address.title = '';

            // We want to display the field at the bottom.
            elements.field_address.field_info_instance.widget.weight = 10;

            var widget_id = drupalgap_form_get_element_id('field-address', form.id, 'und', 0);

            // If this form is for node editing.
            if (typeof elements.field_address.und[0].item !== 'undefined') {
              var data_json = JSON.parse(elements.field_address.und[0].item.data_json);
            }

            // This field will be used for address autocompleting.
            elements['field-address-und-0-value-autocomplete'] = {
              // Search input will have a 'X' icon on the right end of the field.
              // @todo: change field's type to 'search' or add a 'X' icon ourselves
              type: 'textfield',
              title: 'Address*',
              default_value: (typeof data_json !== 'undefined') ? data_json['formatted_address'] : '',
              weight: 7,
              attributes: {
                id: widget_id + '-autocomplete'
              }
            };

            // We use 'pageshow' event to enable an autocomplete feature on the field.
            elements.field_address_autocomplete_markup = {
              markup: drupalgap_jqm_page_event_script_code({
                page_id: drupalgap_get_page_id(),
                jqm_page_event: 'pageshow',
                jqm_page_event_callback: '_reiscout_address_field_autocomplete_enable',
                jqm_page_event_args: JSON.stringify({
                  widget_id: widget_id
                })
              })
            };

            // We create latitude and longitude fields because address_autocomplete widget needs these values.
            elements['field-address-und-0-value-latitude'] = {
              type: 'hidden',
              default_value: (typeof data_json !== 'undefined') ? data_json['latitude'] : '',
              weight: 8,
              attributes: {
                id: widget_id + '-latitude'
              }
            };
            elements['field-address-und-0-value-longitude'] = {
              type: 'hidden',
              default_value: (typeof data_json !== 'undefined') ? data_json['longitude'] : '',
              weight: 9,
              attributes: {
                id: widget_id + '-longitude'
              }
            };
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

    // @todo: delete this code block
    if (instance.widget.type === 'reiscout_geocomplete') {
      text_field_widget_form(form, form_state, field, instance, langcode, items, delta, element);

      items[delta].children.push({
        markup: drupalgap_jqm_page_event_script_code({
          page_id: drupalgap_get_page_id(),
          jqm_page_event: 'pageshow',
          jqm_page_event_callback: '_reiscout_address_clearable_field_pageshow',
          jqm_page_event_args: JSON.stringify({
              clearable_id: items[delta].id
          })
        })
      });

      items[delta].children.push({
        markup: drupalgap_jqm_page_event_script_code({
          page_id: drupalgap_get_page_id(),
          jqm_page_event: 'pageshow',
          jqm_page_event_callback: '_reiscout_address_geocomplete_field_pageshow',
          jqm_page_event_args: JSON.stringify({
              geocomplete_id: items[delta].id
          })
        })
      });
    }
    else if (instance.widget.type === 'reiscout_geofield_latlon') {
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
            onclick: "_reiscout_address_getposition_click('" + items[delta].id + "', '" + element.reiscout_address_id + "')"
          }
        }
      });
    }
    else if (instance.widget.type === 'addressfield_autocomplete') {
      // We use addressfield_standard widget to display this field.
      addressfield_field_widget_form(form, form_state, field, instance, langcode, items, delta, element);
    }
    else {
      console.log('WARNING: reiscout_address_field_widget_form() - unsupported widget type: ' + instance.widget.type);
    }
  }
  catch (error) {
    console.log('reiscout_address_field_widget_form - ' + error);
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
function reiscout_address_entity_post_render_field(entity, field_name, field, reference) {
  try {
    if (Drupal.settings.debug) {
      console.log(['reiscout_address_entity_post_render_field', entity, field_name, field, reference]);
    }

    if (field.entity_type === 'node' && field.bundle === 'property') {
      var hideFields   = (typeof entity._flag_is_user_has_view === 'undefined' || entity._flag_is_user_has_view !== true);
      var hiddenFields = ['field_owner_fname', 'field_owner_lname', 'field_owner_address', 'field_owner_phone'];
      
      if (field_name === 'field_address_text') {
        var label = _reiscout_address_get_entity_field_label(field);
        var value = _reiscout_address_get_entity_field_value(entity, field_name);

        // Author of the node with "edit own content" permission.
        // Function node_access also checks "edit any content" permission and this is why we do not use it here.
        if (entity.uid === Drupal.user.uid && user_access('edit own ' + entity.type + ' content')) {
          reference.content = theme('reiscout_address_editable', {
            bundle: field.bundle,
            nid: entity.nid,
            language: value.language,
            label: label,
            name: field_name,
            value: value.value
          });
        }
        else if (hideFields) {
          reference.content = theme('reiscout_address_hidden', {
            nid: entity.nid,
            label: label,
            name: field_name,
            value: value.value,
            fields: hiddenFields
          });
        }
      }
      else if (hideFields && in_array(field_name, hiddenFields)) {
        var label = _reiscout_address_get_entity_field_label(field);
        var value = _reiscout_address_get_entity_field_value(entity, field_name);
        
        reference.content = theme('reiscout_address_hidden_field', {
          label: label,
          name: field_name,
          value: value.value,
          delta: field.id
        });
      }
    }
  }
  catch (error) {
    console.log('reiscout_address_entity_post_render_field - ' + error);
  }
}

function _reiscout_address_getposition_click(position_id, address_id) {
  try {
    if (Drupal.settings.debug) {
      console.log(['_reiscout_address_getposition_click', position_id, address_id]);
    }
    
    drupalgap_loading_message_show({
      text: t('Getting position and address') + '...',
      textVisible: true,
      theme: 'b'
    });

    var alertMessage = t('Could not detect your position.') + (address_id.length ? ' ' + t('Please, enter address manually.') : '');

    navigator.geolocation.getCurrentPosition(
      function (position) {
        if (Drupal.settings.debug) {
          console.log(['_reiscout_address_getposition_click.getCurrentPosition', position]);
        }

        if (typeof position.coords.latitude !== 'undefined' && typeof position.coords.longitude !== 'undefined') {
          $('#' + position_id).val([position.coords.latitude, position.coords.longitude].join(','));

          if (address_id.length) {
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

                $('#' + address_id).val(result.address);
              },
              error: function(xhr, status, message) {
                if (Drupal.settings.debug) {
                  console.log(['_reiscout_address_getposition_click.geocode_reverse.error', xhr, status, message]);
                }

                drupalgap_alert(alertMessage);
              }
            });
          }
        }
        else {
          drupalgap_alert(alertMessage);
        }
      },
      function (error) {
        drupalgap_loading_message_hide();

        if (Drupal.settings.debug) {
          console.log(['_reiscout_address_getposition_click.getCurrentPosition', error]);
        }

        drupalgap_alert(alertMessage);
      },
      {enableHighAccuracy: true}
    );
  }
  catch (error) {
    console.log('_reiscout_address_getposition_click - ' + error);
  }
}

// @todo: delete this code block
function _reiscout_address_geocomplete_field_pageshow(options) {
  try {
    if (Drupal.settings.debug) {
      console.log(['_reiscout_address_geocomplete_field_pageshow', options]);
    }

    var placeholder = $('#' + options.geocomplete_id).prop('placeholder');
    $('#' + options.geocomplete_id).geocomplete();
    $('#' + options.geocomplete_id).prop('placeholder', placeholder);
  }
  catch (error) {
    console.log('_reiscout_address_geocomplete_field_pageshow - ' + error);
  }
}

/**
 * Enables autocomplete feature on field_address_autocomplete field.
 */
function _reiscout_address_field_autocomplete_enable(data) {
  try {
    // Restrict suggestions to US country.
    var options = {
      country: 'us'
    };

    var widget_id = data.widget_id;

    // Field IDs we will be put result in.
    var fields_mapping = {
      locality: widget_id + '-locality',
      administrative_area_level_1: widget_id + '-administrative_area',
      postal_code: widget_id + '-postal_code'
    };

    $('#' + widget_id + '-autocomplete')
      .geocomplete(options)
      .bind("geocode:result", function(event, result) {
        // Set 'Address 1', 'Latitude' and 'Longitude' fields' values.
        $('#' + widget_id + '-thoroughfare').val(result.name);
        $('#' + widget_id + '-latitude').val(result.geometry.location.lat());
        $('#' + widget_id + '-longitude').val(result.geometry.location.lng());

        // Get each component of the address from the result
        // object and fill the corresponding field on the form.
        for (var i = 0; i < result.address_components.length; i++) {
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

function _reiscout_address_editable_address_form_show(button) {
  try {
    var container = $(button).parent().parent().parent();
    container.find('#editable-form-value').val(container.find('.editable-view .editable-value').text());
    container.find('.editable-view, .editable-form').toggle();
  }
  catch (error) {
    console.log('_reiscout_address_editable_address_form_show - ' + error);
  }
}

function _reiscout_address_editable_address_form_save(button, nid, type, field, language) {
  try {
    if (Drupal.settings.debug) {
      console.log(['_reiscout_address_editable_address_form_save', nid, type, field, language]);
    }
    
    var container = $(button).parent().parent().parent();
    var input     = container.find('#editable-form-value');
    var value     = input.val();

    if (value.length) {
      Drupal.services.call({
        method: 'POST',
        path: 'editableapi/save.json',
        service: 'editableapi',
        resource: 'save',
        data: JSON.stringify({
          nid: nid,
          type: type,
          field: field,
          language: language,
          delta: 0,
          value: value
        }),
        success: function(result) {
          if (Drupal.settings.debug) {
            console.log(['_reiscout_address_editable_address_form_save.success', result]);
          }

          container.find('.editable-view .editable-value').text(result.value);
          container.find('.editable-view, .editable-form').toggle();
          input.val('');
        },
        error: function(xhr, status, message) {
          if (Drupal.settings.debug) {
            console.log(['_reiscout_address_editable_address_form_save.error', xhr, status, message]);
          }

          if (message) {
            try {
              message = JSON.parse(message);
              if (typeof message === 'string') {
                drupalgap_alert(message);
              }
              else if (message instanceof Array) {
                drupalgap_alert(message.join("\n"));
              }
              else {
                drupalgap_alert(t('Unexpected error occurred'));
              }
            }
            catch (error) {
              drupalgap_alert(t('Unexpected error occurred'));
            }
          }
        }
      });
    }
    else {
      container.find('.editable-view, .editable-form').toggle();
      input.val('');
    }
  }
  catch (error) {
    console.log('_reiscout_address_editable_address_form_save - ' + error);
  }
}

function _reiscout_address_editable_address_form_cancel(button) {
  try {
    var container = $(button).parent().parent().parent();
    container.find('.editable-view, .editable-form').toggle();
    container.find('#editable-form-value').val('');
  }
  catch (error) {
    console.log('_reiscout_address_editable_address_form_cancel - ' + error);
  }
}

function _reiscout_address_property_address_pageshow(options) {
  try {
    if (Drupal.settings.debug) {
      console.log(['_reiscout_address_property_address_pageshow', options]);
    }
    
    $(options.selector).data(options);
  }
  catch (error) {
    console.log('_reiscout_address_property_address_pageshow - ' + error);
  }
}

function _reiscout_address_property_hidden_pageshow(options) {
  try {
    if (Drupal.settings.debug) {
      console.log(['_reiscout_address_property_hidden_pageshow', options]);
    }

    $(options.selector).data('value', options.value);
  }
  catch (error) {
    console.log('_reiscout_address_property_hidden_pageshow - ' + error);
  }
}

function _reiscout_address_user_request_address_info(button) {
  try {
    if (Drupal.settings.debug) {
      console.log(['_reiscout_address_user_request_address_info']);
    }

    if (!Drupal.user.uid) {
      _reiscout_address_goto('user/login');
    }
    else {
      var container = $(button).parent().parent();
      var address = container.find('.address-value');
      var fields = address.data('fields');
      address.text(address.data('address'));
      container.find('.address-button').hide();

      for (var i = 0, j = fields.length; i < j; i++) {
        var fieldContainer = $('.' + fields[i]);
        if (fieldContainer.length) {
          var fieldValue = fieldContainer.find('.value');
          fieldValue.text(fieldValue.data('value'));
          fieldContainer.show();
        }
      }

      drupalgap.loading = true;

      Drupal.services.call({
        method: 'POST',
        path: 'addressapi/setview.json',
        service: 'addressapi',
        resource: 'setview',
        data: JSON.stringify({
          nid: address.data('nid')
        }),
        success: function(result) {
          drupalgap.loading = false;

          if (Drupal.settings.debug) {
            console.log(['_reiscout_address_user_request_address_info.success', result]);
          }
        },
        error: function(xhr, status, message) {
          drupalgap.loading = false;
          
          if (Drupal.settings.debug) {
            console.log(['_reiscout_address_user_request_address_info.error', xhr, status, message]);
          }
        }
      });
    }
  }
  catch (error) {
    drupalgap.loading = false;
    
    console.log('_reiscout_address_user_request_address_info - ' + error);
  }
}

// @todo: delete this code block
function _reiscout_address_clearable_field_pageshow(options) {
  try {
    if (Drupal.settings.debug) {
      console.log(['_reiscout_address_clearable_field_pageshow', options]);
    }

    $('#' + options.clearable_id).parent().append([
      '<span style="position: relative; float: right; right: -4px; top: -50px; z-index: 1000;">',
        theme('button_link', {
          text: t('Clear Address'),
          options: {
            attributes: {
              class: 'ui-mini ui-link ui-btn ui-btn-b ui-icon-delete ui-btn-icon-left ui-btn-inline ui-shadow ui-corner-all',
              onclick: 'javascript:_reiscout_address_clear_address(this, \'' + options.clearable_id + '\');'
            }
          }
        }),
      '</span>'
    ].join(''));
  }
  catch (error) {
    console.log('_reiscout_address_clearable_field_pageshow - ' + error);
  }
}

function _reiscout_address_clear_address(button, id) {
  try {
    if (Drupal.settings.debug) {
      console.log(['_reiscout_address_clear_address', button, id]);
    }

    $(button).blur();
    $('#' + id).val('');
  }
  catch (error) {
    console.log('_reiscout_address_clear_address - ' + error);
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

function _reiscout_address_get_entity_field_value(entity, field_name) {
  try {
    // TODO: find a proper way to get a field value and render it
    var value = '';
    var default_lang = language_default();
    var language = entity.language;
    if (entity[field_name]) {
      var items = null;
      if (entity[field_name][default_lang]) {
        items = entity[field_name][default_lang];
        language = default_lang;
      }
      else if (entity[field_name][language]) {
        items = entity[field_name][language];
      }
      else if (entity[field_name]['und']) {
        items = entity[field_name]['und'];
        language = 'und';
      }

      if (items && typeof items[0] !== 'undefined') {
        if (typeof items[0].safe_value !== 'undefined') {
          value = items[0].safe_value;
        }
        else if (typeof items[0].value !== 'undefined') {
          value = items[0].value;
        }
      }
    }

    return {value: value, language: language};
  }
  catch (error) {
    console.log('_reiscout_address_get_entity_field_value - ' + error);
  }
}

function _reiscout_address_get_entity_field_label(field) {
  try {
    var display = field.display['default'];
    if (field.display['drupalgap']) {
      display = field.display['drupalgap'];
    }

    var label = '';
    if (display['label'] !== 'hidden' && typeof field.label === 'string') {
      label = field.label;
    }

    return label;
  }
  catch (error) {
    console.log('_reiscout_address_get_entity_field_label - ' + error);
  }
}