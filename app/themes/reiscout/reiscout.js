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
function reiscout_commerce_cart_line_item(variables) {
  try {
    var html = '<h2>' + variables.line_item.line_item_title + '</h2>' +
        '<p><strong>Price</strong>: ' + variables.line_item.commerce_unit_price_formatted + '</p>';
    if (variables.line_item.type != 'shipping') {
      /*
       html += theme('commerce_cart_line_item_quantity', {
       line_item: variables.line_item,
       order: variables.order
       }) +
       */
      html += theme('commerce_cart_line_item_remove', {
        line_item: variables.line_item,
        order: variables.order
      });
    }
    html += '<p class="ui-li-aside"><strong>Total</strong>: ' +
        variables.line_item.commerce_total_formatted +
        '</p>';
    return html;
  }
  catch (error) { console.log('theme_commerce_cart_line_item - ' + error); }
}

/**
 * Theme the commerce cart buttons.
 */
function reiscout_commerce_cart_buttons(variables) {
  try {
    var html =
        theme('button_link', {
          text: 'Checkout',
          path: 'checkout/' + variables.order.order_id,
          options: {
            attributes: {
              'data-icon': 'check',
              'data-theme': 'b'
            }
          }
        });
    return html;
  }
  catch (error) { console.log('theme_commerce_cart_buttons - ' + error); }
}
