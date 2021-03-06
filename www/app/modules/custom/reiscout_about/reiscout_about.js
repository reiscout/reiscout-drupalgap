/**
 * Implements hook_menu().
 * @return {Object}
 */
function reiscout_about_menu() {
  var items = {};

  items['about'] = {
    title: 'About',
    page_callback: 'reiscout_about_page'
  };

  return items;
}

/**
 * The callback to render the 'About' page.
 */
function reiscout_about_page() {
  try {
    var current_year = new Date().getFullYear();
    var html = '<div id="title">' + drupalgap.settings.app.name + ' ' + drupalgap.settings.app.version + '</div>';

    html += '<div id="copyright">Copyright © 2017-' + current_year + ' Three Oaks Technology Group, LLC</div>';
    html += '<div id="url"><a href="#" onclick="javascript:window.open(\'https://reiscout.com\', \'_system\');">www.reiscout.com</a></div>';
    html += '<div id="url_privacy"><a href="#" onclick="javascript:window.open(\'https://reiscout.com/privacy-policy\', \'_system\');">Privacy Policy</a></div>';
    html += '<div id="url_terms"><a href="#" onclick="javascript:window.open(\'https://reiscout.com/terms-of-use\', \'_system\');">Terms of Use</a></div>';

    return html;
  }
  catch (error) {
    console.log('reiscout_about_page - ' + error);
  }
}
