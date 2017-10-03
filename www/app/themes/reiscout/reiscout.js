/**
 * Implements DrupalGap's template_info() hook.
 */
function reiscout_info() {
  try {
    var theme = {
      name: 'reiscout',
      regions: {
        header: {
          attributes: {
            'data-role': 'header',
            'data-theme': 'b',
            'data-position': 'fixed'
          }
        },
        sub_header: {
          attributes: {
            'data-role': 'header'
          }
        },
        navigation: {
          attributes: {
            'data-role': 'navbar'
          }
        },
        content: {
          attributes: {
            'class': 'ui-content',
            'role': 'main'
          }
        },
        footer: {
          attributes: {
            'data-role': 'footer',
            'data-theme': 'b',
            'data-position': 'fixed'
          }
        }
      }
    };
    return theme;
  }
  catch (error) { drupalgap_error(error); }
}

/**
 * Themes a commerce cart line item.
 */
function reiscout_commerce_cart_line_item_review(variables) {
  try {
    var quantity = Math.floor(variables.line_item.quantity);
    var label = variables.line_item.line_item_title;
    var html = '<h2>' + quantity + ' x ' + label  + '</h2>' +
      '<p><strong>Price</strong>: ' + variables.line_item.commerce_unit_price_formatted + '</p>';
    html += '<p class="ui-li-aside"><strong>Total</strong>: ' +
      variables.line_item.commerce_total_formatted +
      '</p>';
    return html;
  }
  catch (error) {
    console.log('reiscout_commerce_cart_line_item_review - ' + error);
  }
}
