function theme_reiscout_address_hidden(variables) {
  try {
    if (Drupal.settings.debug) {
      console.log(['theme_reiscout_address_hidden', variables]);
    }
    
    var html = [
      '<div class="' + variables.name + '">',
        (variables.label.length ? '<div><h3>' + variables.label + '</h3></div>' : ''),
        '<span class="address-value"></span>',
        '<span class="address-button">',
          theme('button_link', {
            text: t('Show Address and Owner Info'),
            options: {
              attributes: {
                class: 'ui-link ui-btn ui-btn-b ui-btn-icon-left ui-icon-eye ui-btn-inline ui-shadow ui-corner-all',
                onclick: 'javascript:_reiscout_address_user_request_address_info(this);'
              }
            }
          }),
        '</span>',
      '</div>'
    ].join('');

    html += drupalgap_jqm_page_event_script_code({
        page_id: drupalgap_get_page_id(),
        jqm_page_event: 'pageshow',
        jqm_page_event_callback: '_reiscout_address_property_address_pageshow',
        jqm_page_event_args: JSON.stringify({
            selector: '.' + variables.name + ' .address-value',
            address: variables.value,
            nid: variables.nid,
            fields: variables.fields || []
        })
    });

    return html;
  }
  catch (error) {
    console.log('theme_reiscout_address_hidden - ' + error);
  }
}

function theme_reiscout_address_hidden_field(variables) {
  try {
    if (Drupal.settings.debug) {
      console.log(['theme_reiscout_address_hidden_field', variables]);
    }

    var html = [
      '<div class="' + variables.name + '" style="display:none;">',
        (variables.label.length ? '<div><h3>' + variables.label + '</h3></div>' : ''),
        '<span class="value"></span>',
      '</div>'
    ].join('');

    html += drupalgap_jqm_page_event_script_code({
        page_id: drupalgap_get_page_id(),
        jqm_page_event: 'pageshow',
        jqm_page_event_callback: '_reiscout_address_property_hidden_pageshow',
        jqm_page_event_args: JSON.stringify({
            selector: '.' + variables.name + ' .value',
            value: variables.value
        })
    }, variables.delta);

    return html;
  }
  catch (error) {
    console.log('theme_reiscout_address_hidden_field - ' + error);
  }
}

function theme_reiscout_address_editable(variables) {
  try {
    if (Drupal.settings.debug) {
      console.log(['theme_reiscout_address_editable', variables]);
    }
    
    var html = [
      '<div class="' + variables.name + '">',
        (variables.label.length ? '<div><h3>' + variables.label + '</h3></div>' : ''),
        '<div class="editable-view">',
          '<span class="editable-value">',
            variables.value,
          '</span>',
          '<span class="editable-control" style="margin-left: 10px;">',
            theme('button_link', {
              text: t('Edit'),
              options: {
                attributes: {
                  class: 'ui-link ui-btn ui-btn-b ui-icon-edit ui-btn-icon-notext ui-btn-inline ui-shadow ui-corner-all editable-edit',
                  onclick: 'javascript:_reiscout_address_editable_address_form_show(this);'
                }
              }
            }),
          '</span>',
         '</div>',
        '<div class="editable-form" style="display: none;">',
          theme('textfield', {
            options: {
              attributes: {
                id: 'editable-form-value'
              }
            }
          }),
          '<div class="editable-control" style="position: relative; float: right; right: -4px; top: -50px; z-index: 1000;">',
            theme('button_link', {
              text: t('Save'),
              options: {
                attributes: {
                  class: 'ui-link ui-btn ui-btn-b ui-icon-check ui-btn-icon-notext ui-btn-inline ui-shadow ui-corner-all editable-save',
                  onclick: 'javascript:_reiscout_address_editable_address_form_save(this, ' + variables.nid +', \'' + variables.bundle + '\', \'' + variables.name + '\', \'' + variables.language + '\');'
                }
              }
            }),
            theme('button_link', {
              text: t('Cancel'),
              options: {
                attributes: {
                  class: 'ui-link ui-btn ui-btn-b ui-icon-back ui-btn-icon-notext ui-btn-inline ui-shadow ui-corner-all editable-cancel',
                  onclick: 'javascript:_reiscout_address_editable_address_form_cancel(this);'
                }
              }
            }),
          '</div>',
        '</div>',
      '</div>',
      drupalgap_jqm_page_event_script_code({
        page_id: drupalgap_get_page_id(),
        jqm_page_event: 'pageshow',
        jqm_page_event_callback: '_reiscout_address_geocomplete_field_pageshow',
        jqm_page_event_args: JSON.stringify({
            geocomplete_id: 'editable-form-value'
        })
      })
    ].join('');

    return html;
  }
  catch (error) {
    console.log('theme_reiscout_address_editable - ' + error);
  }
}