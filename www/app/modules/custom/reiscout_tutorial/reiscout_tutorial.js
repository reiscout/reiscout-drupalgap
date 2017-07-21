/**
 * Implements hook_menu().
 * @return {Object}
 */
function reiscout_tutorial_menu() {
  var items = {};

  items['tutorials'] = {
    title: 'Tutorials',
    page_callback: 'reiscout_tutorials_page'
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
        title: 'How to Register an Account',
        href: '#',
        src: drupalgap_get_path('module', 'reiscout_tutorial') + '/screenshots/how_to_register_an_account.jpg'
      },
      {
        title: 'How to Add a Property',
        href: '#',
        src: drupalgap_get_path('module', 'reiscout_tutorial') + '/screenshots/how_to_add_a_property.jpg'
      }
    ];

    var html = '';

    for (i = 0; i < tutorials.length; ++i) {
      html += '<div class="tutorial">';

      html += '<div class="screenshot">';
      html += theme('image', {path: tutorials[i].src});
      html += '</div>';

      html += '<div class="title">';
      html += l(tutorials[i].title, tutorials[i].href);
      html += '</div>';

      html += '</div>';
    }

    return html;
  }
  catch (error) {
    console.log('reiscout_tutorials_page - ' + error);
  }
}
