/**
 * Implements hook_install().
 */
function reiscout_purchased_addresses_install() {
    try {
        var css_file = drupalgap_get_path('module', 'reiscout_purchased_addresses') + '/reiscout_purchased_addresses.css';
        drupalgap_add_css(css_file);
    }
    catch (error) {
      console.log('reiscout_purchased_addresses_install - ' + error);
    }
}

/**
 * Implements hook_menu().
 * @return {Object}
 */
function reiscout_purchased_addresses_menu() {
    var items = {};

    items['purchased-addresses'] = {
        title: 'Purchased Addresses',
        page_callback: 'reiscout_purchased_addresses_list_page'
    };

    return items;
}

/**
 * The page callback to display the view.
 */
function reiscout_purchased_addresses_list_page() {
    try {
        var content = {};

        content['address_list'] = {
            theme: 'view',
            format: 'ul',
            path: 'drupalgap/views_datasource/purchased_address_list/' + Drupal.user.uid,
            row_callback: 'reiscout_purchased_addresses_list_row',
            empty_callback: 'reiscout_purchased_addresses_list_empty',
            attributes: {
                id: 'reiscout_purchased_addresses_list_view'
            }
        };

        return content;
    }
    catch (error) {
      console.log('reiscout_purchased_addresses_list_page - ' + error);
    }
}

/**
 * The row callback to render a single row.
 */
function reiscout_purchased_addresses_list_row(view, row) {
    try {
        image = theme('image', {
          path: row.image.src,
          alt: row.image.alt
        });

        title = l(t(row.address), 'node/' + row.nid);

        return '<div class="image">' + image + '</div>'
             + '<div class="title">' + title + '</div>';
    }
    catch (error) { console.log('reiscout_purchased_addresses_list_row - ' + error); }
}

/**
 * The callback to display info if there are no items to display.
 */
function reiscout_purchased_addresses_list_empty(view) {
  return t('You have not purchased address access to any property yet.');
}