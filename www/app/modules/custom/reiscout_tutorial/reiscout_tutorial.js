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
    var tutorials = [
      {
        id: 'register-account',
        title: 'How to Register an Account',
        src: 'https://www.youtube.com/embed/TYHgQsTrbWY'
      },
      {
        id: 'menu-overview',
        title: 'Menu Items Overview',
        src: 'https://www.youtube.com/embed/rv6Z2YWR6qk'
      },
      {
        id: 'add-property',
        title: 'How to Add a Property',
        src: 'https://www.youtube.com/embed/s8DYiRFRHIw'
      },
      {
        id: 'buy-property',
        title: 'How to Buy a Property Lead',
        src: 'https://www.youtube.com/embed/G6YRk9d2y74'
      }
    ];

    var html = '';

    for (i = 0; i < tutorials.length; ++i) {
      html += '<div class="tutorial">';

      html += '<div id="' + tutorials[i].id + '" class="video">';
      html += '<iframe src="' + tutorials[i].src + '" frameborder="0" allowfullscreen></iframe>';
      html += '</div>';

      html += '<div class="title">';
      html += tutorials[i].title;
      html += '</div>';

      html += '</div>';
    }

    return html;
  }
  catch (error) {
    console.log('reiscout_tutorials_page - ' + error);
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
  }, 1000);
}
