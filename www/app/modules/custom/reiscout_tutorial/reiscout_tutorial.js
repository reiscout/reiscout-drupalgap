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
    var content = {};

    content['video_tutorials_list'] = {
      theme: 'view',
      format: 'unformatted-list',
      path: 'drupalgap/views_datasource/video_tutorials',
      row_callback: 'reiscout_tutorials_listing_row',
      empty_callback: 'reiscout_tutorials_listing_empty',
      attributes: {
        id: 'video_tutorials_list_view'
      }
    };

    return content;
  }
  catch (error) {
    console.log('reiscout_tutorials_page - ' + error);
  }
}

/**
 * The callback to render a single video tutorial.
 */
function reiscout_tutorials_listing_row(view, row) {
  try {
    var row_html = '<div id="' + row.id +  '" class="tutorial">';

    row_html += '<div class="video">';
    row_html += '<video src="' + row.video_src + '" poster="' + row.poster.src + '" preload="metadata" controls data-title="' + row.title + '"></video>';
    row_html += '</div>';

    row_html += '<div class="title">' + row.title + '</div>';

    row_html += '</div>';

    return row_html;
  }
  catch (error) {
    console.log('reiscout_tutorials_listing_row - ' + error);
  }
}

/**
 * Displays a message if the view is empty.
 */
function reiscout_tutorials_listing_empty(view) {
  try {
    return t('Sorry, there are no any tutorials yet.');
  }
  catch (error) {
    console.log('reiscout_tutorials_listing_empty - ' + error);
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

    // When a video is started playing
    $('#video_tutorials_list_view video').on('play', function() {
      var video_is_played = this;

      // pause all the other videos
      $('#video_tutorials_list_view video').each(function(i) {
        if (video_is_played != this) {
          this.pause();
        }
      });

      // and send GA the current video tutorial's play event
      ga('send', {
        hitType: 'event',
        eventCategory: 'Video tutorial',
        eventAction: 'play',
        eventLabel: this.dataset.title
      });
    });

    // When the 'Back' button is clicked, stop all the videos
    $('.region_footer a.ui-icon-back').on('click', function() {
      $('#video_tutorials_list_view video').each(function(i) {
        this.pause();
      });
    });
  }, 1000);
}

/**
 * Implements hook_drupalgap_goto_preprocess().
 */
function reiscout_tutorial_drupalgap_goto_preprocess(path) {
  // We don't want to process a redirect from the system _reload page
  if ('_reload' === drupalgap_path_get()) {
    return;
  }

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
    var message = '<div>' + 'Please, ' + l('log in', 'user/login') + ' for access to all of the features of our app.' + '</div>'
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

  // If the current page is 'Tutorials' and some another page
  // is going to be opened, stop all the videos
  if ('tutorials' === drupalgap_path_get()) {
    $('#video_tutorials_list_view video').each(function(i) {
      this.pause();
    });
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
     && !_reiscout_property_is_data_quality_tag_attached(output.node, 'Full info')) {
      // If the user does not have points
      // and he has not closed the 'buy-points-property-data' hint
      if (0 >= Drupal.user._points
       && !in_array('buy-points-property-data', closed_hints)) {
        var message = '<div class="messages status">'
                    + '<div>' + 'Hi ' + Drupal.user.name + ',' + '</div>'
                    + '<div>We provide property data for all 50 states.</div>'
                    + '<div>To autofill your property listing you must <strong>purchase points</strong>.</div>'
                    + '<div>' + l('Watch our video tutorial', 'tutorials?vid=pull-property-data') + ' on How to Buy Points.' + '</div>'
                    + '<div class="close"><a href="#" onclick="javascript:_reiscout_tutorial_close_hint(\'buy-points-property-data\')">Do not show this message again</a></div>'
                    + '</div>';
        output.content.markup = message + output.content.markup
      }

      // If the user has points
      // and he has not closed the 'pull-property-data' hint
      if (0 < Drupal.user._points
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
     || _reiscout_property_commerce_user_purchased_address_access(output.node))
     && _reiscout_property_is_data_quality_tag_attached(output.node, 'Owner info')) {
      // If the user does not have points
      // and he has not closed the 'buy-points-send-postcard' hint
      if (0 >= Drupal.user._points
       && !in_array('buy-points-send-postcard', closed_hints)) {
        var message = '<div class="messages status">'
                    + '<div>' + 'Hi ' + Drupal.user.name + ',' + '</div>'
                    + '<div>Send a physical postcard to the property owner!</div>'
                    + '<div>To start sending mail you must <strong>purchase points</strong>.</div>'
                    + '<div>' + l('Watch our video tutorial', 'tutorials?vid=send-postcard') + ' on How to Buy Points.' + '</div>'
                    + '<div class="close"><a href="#" onclick="javascript:_reiscout_tutorial_close_hint(\'buy-points-send-postcard\')">Do not show this message again</a></div>'
                    + '</div>';
        output.content.markup = message + output.content.markup
      }

      // If the user has points
      // and he has not closed the 'send-postcard' hint
      if (0 < Drupal.user._points
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
