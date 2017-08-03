/**************|
 * Development |
 **************/

// Uncomment to clear the app's local storage cache each time the app loads.
window.localStorage.clear();

// Set to true to see console.log() messages. Set to false when publishing app.
Drupal.settings.debug = false;

/****************************************|
 * Drupal Settings (provided by jDrupal) |
 ****************************************/

/* DRUPAL PATHS */

// Site Path (do not use a trailing slash)
Drupal.settings.site_path = 'https://reiscoutdev.com'; // e.g. http://www.example.com

// Default Services Endpoint Path
Drupal.settings.endpoint = 'drupalgap';

// Files Directory Paths (use one or the other)
Drupal.settings.file_public_path = 'sites/default/files';
//Drupal.settings.file_private_path = 'system/files';

// The Default Language Code
Drupal.settings.language_default = 'und';

/* CACHING AND PERFORMANCE */

// Entity Caching
Drupal.settings.cache.entity = {

  /* Globals (will be used if not overwritten below) */
  enabled: false,
  expiration: 60, // # of seconds to cache, set to 0 to cache forever

  /* Entity types */
  entity_types: {

    /* Comments */
    /*comment: {
     bundles: {}
     },*/

    /* Files */
    /*file: {
     bundles: {}
     },*/

    /* Nodes */
    node: {

      /* Node Globals (will be used if not overwritten below) */
      enabled: false,
      expiration: 120,

      /* Content types (aka bundles) */
      bundles: {

        article: {
          expiration: 3600
        },
        page: {
          enabled: false
        }

      }
    },

    /* Terms */
    /*taxonomy_term: {
     bundles: {}
     },*/

    /* Vocabularies */
    /*taxonomy_vocabulary: {
     bundles: {}
     },*/

    /* Users */
    /*user: {
     bundles: {}
     }*/

  }

};

/* Views Caching */

Drupal.settings.cache.views = {
  enabled: false,
  expiration: 3600
};

/*********************|
 * DrupalGap Settings |
 *********************/

// DrupalGap Mode (defaults to 'web-app')
//  'web-app' - use this mode to build a web application for a browser window
//  'phonegap' - use this mode to build a mobile application with phonegap
drupalgap.settings.mode = 'web-app';

// Language Files - locale/[language-code].json
//drupalgap.settings.locale = {
   /* es: { } */
//};

/*************|
 * Appearance |
 *************/

// App Title
drupalgap.settings.title = 'Reiscout';

// App Front Page
drupalgap.settings.front = 'property-listing';

// Theme
drupalgap.settings.theme = 'reiscout';

// Logo
drupalgap.settings.logo = 'app/themes/reiscout/images/splashscreen-logo.png';

// Offline Warning Message. Set to false to hide message.
drupalgap.settings.offline_message = 'No connection found!';

// Exit app message.
drupalgap.settings.exit_message = 'Exit ' + drupalgap.settings.title + '?';

// Loader Animations - http://demos.jquerymobile.com/1.4.0/loader/
drupalgap.settings.loader = {
  loading: {
    text: 'Loading...',
    textVisible: true,
    theme: 'b'
  },
  saving: {
    text: 'Saving...',
    textVisible: true,
    theme: 'b'
  },
  deleting: {
    text: 'Deleting...',
    textVisible: true,
    theme: 'b'
  }
};

/*****************************************|
 * Modules - http://drupalgap.org/node/74 |
 *****************************************/

/** Contributed Modules - www/app/modules **/
Drupal.modules.contrib['geofield'] = {};
Drupal.modules.contrib['commerce'] = {};
Drupal.modules.contrib['commerce_drupalgap_stripe'] = {};
Drupal.modules.contrib['addressfield'] = {};
Drupal.modules.contrib['date'] = {};
Drupal.modules.contrib['google_analytics'] = {};

//Drupal.modules.contrib['example'] = {};

/** Custom Modules - www/app/modules/custom **/
Drupal.modules.custom['reiscout_property'] = {};
Drupal.modules.custom['reiscout_purchased_addresses'] = {};
Drupal.modules.custom['reiscout_address'] = {
  includes: [
    {name: 'reiscout_address.forms'}
  ]
};
Drupal.modules.custom['reiscout_get_owner_info'] = {};
Drupal.modules.custom['reiscont_buy_info_points'] = {};
Drupal.modules.custom['reiscout_property_commerce'] = {};
Drupal.modules.custom['reiscout_mail'] = {};
Drupal.modules.custom['reiscout_about'] = {};
Drupal.modules.custom['reiscout_misc'] = {};
Drupal.modules.custom['reiscout_tutorial'] = {};

drupalgap.settings.stripe_api_key = 'pk_test_7wSizVWIjs2bsMwY8OwZc5Vi';

/***************************************|
 * Menus - http://drupalgap.org/node/85 |
 ***************************************/
drupalgap.settings.menus = {}; // Do not remove this line.

// Properties Menu
drupalgap.settings.menus['properties_menu'] = {
  options: menu_popup_get_default_options(),
  links: [
    {
      title: 'Add a Property',
      path: 'node/add/property',
      options: {
        attributes: {
          'data-icon': 'plus',
          'class': 'ui-btn ui-btn-icon-right'
        }
      }
    },
    {
      title: 'My Properties',
      path: 'my-properties',
      options: {
        attributes: {
          'data-icon': 'properties-list',
          'class': 'ui-btn ui-btn-icon-right'
        }
      }
    },
    {
      title: 'Purchased Leads',
      path: 'purchased-leads',
      options: {
        attributes: {
          'data-icon': 'properties-list',
          'class': 'ui-btn ui-btn-icon-right'
        }
      }
    },
  ]
};

// User Menu Anonymous
drupalgap.settings.menus['user_menu_anonymous'] = {
  options: menu_popup_get_default_options(),
  links: [
    {
      title: 'Login',
      path: 'user/login',
      options: {
        attributes: {
          'data-icon': 'lock',
          'class': 'ui-btn ui-btn-icon-right'
        }
      }
    },
    {
      title: 'Create new account',
      path: 'user/register',
      options: {
        attributes: {
          'data-icon': 'plus'
        }
      }
    }
  ]
};

// User Menu Authenticated
drupalgap.settings.menus['user_menu_authenticated'] = {
  options: menu_popup_get_default_options(),
  links: [
    {
      title: 'My Account',
      path: 'user',
      options: {
        attributes: {
          'data-icon': 'user-info',
          'class': 'ui-btn ui-btn-icon-right'
        }
      }
    },
    {
      title: 'Logout',
      path: 'user/logout',
      options: {
        attributes: {
          'data-icon': 'delete'
        }
      }
    },
  ]
};

// Help Menu
drupalgap.settings.menus['help_menu'] = {
  options: menu_popup_get_default_options(),
  links: [
    {
      title: 'Contact Us',
      path: 'contact',
      options: {
        attributes: {
          'data-icon': 'mail',
          'class': 'ui-btn ui-btn-icon-right'
        },
        reloadPage: true
      }
    },
    {
      title: 'Tutorials',
      path: 'tutorials',
      options: {
        attributes: {
          'data-icon': 'video',
          'class': 'ui-btn ui-btn-icon-right'
        }
      }
    },
    {
      title: 'About',
      path: 'about',
      options: {
        attributes: {
          'data-icon': 'info',
          'class': 'ui-btn ui-btn-icon-right'
        }
      }
    },
  ]
};

// Main Menu
/*drupalgap.settings.menus['main_menu'] = {
  options: menu_popup_get_default_options(),
  links: [
    {
      title:'Content',
      path:'node',
      options:{
        attributes: {
          'data-icon': 'star',
          'class': 'ui-btn ui-btn-icon-right'
        }
      }
    },
    {
      title:'Taxonomy',
      path:'taxonomy/vocabularies',
      options:{
        attributes:{
          'data-icon':'grid'
        }
      }
    },
    {
      title:'Users',
      path:'user-listing',
      options:{
        attributes:{
          'data-icon':'info'
        }
      }
    }
  ]
};*/

/****************************************|
 * Blocks - http://drupalgap.org/node/83 |
 ****************************************/
drupalgap.settings.blocks = {}; // Do not remove this line.

// Theme Blocks
drupalgap.settings.blocks.reiscout = {
  header: {
    properties_menu: {
      roles: {
        value: ['authenticated user'],
        mode: 'include',
      }
    },
    user_menu_anonymous: {
      roles: {
        value: ['anonymous user'],
        mode: 'include',
      }
    },
    user_menu_authenticated: {
      roles: {
        value: ['authenticated user'],
        mode: 'include',
      }
    },
    help_menu: {},
    //main_menu: { }
  },
  sub_header: {
    title: { }
  },
  navigation: {
    commerce_cart: {
      pages: {
        mode: 'exclude',
        value: ['cart', 'checkout/*', 'checkout/shipping/*']
      }
    },
    primary_local_tasks: { }
  },
  content: {
    messages: { },
    main: { }
  },
  footer: { }
};

/****************************************************|
 * Region Menu Links - http://drupalgap.org/node/173 |
 ****************************************************/
drupalgap.settings.menus.regions = {}; // Do not remove this line.

// Header Region Links
drupalgap.settings.menus.regions['header'] = {
  links:[
    /* Main Menu Popup Menu Button */
    /*{
      options: {
        popup: true,
        popup_delta: 'main_menu',
        attributes: {
          'class': 'ui-btn-left',
          'data-icon': 'bars'
        }
      }
    },*/
    /* Home Button */
    {
      path: '',
      options: {
        attributes: {
          'data-icon': 'home',
          'data-iconpos': 'notext',
          'class': 'ui-btn-left'
        }
      },
      pages: {
        value: [''],
        mode: 'exclude'
      }
    },
    /* Shopping Cart Button */
    {
      path: 'cart',
      options: {
        attributes: {
          'data-icon': 'shopping-cart',
          'data-iconpos': 'notext',
          'class': 'ui-btn-right'
        },
        reloadPage: true
      },
      roles: {
        value: ['authenticated user'],
        mode: 'include'
      }
    },
    /* Properties Popup Menu Button */
    {
      options: {
        popup: true,
        popup_delta: 'properties_menu',
        attributes: {
          'class': 'ui-btn-right',
          'data-icon': 'building-o'
        }
      },
      roles: {
        value: ['authenticated user'],
        mode: 'include'
      }
    },
    /* Anonymous User Popup Menu Button */
    {
      options: {
        popup: true,
        popup_delta: 'user_menu_anonymous',
        attributes: {
          'class': 'ui-btn-right',
          'data-icon': 'user'
        }
      },
      roles: {
        value: ['anonymous user'],
        mode: 'include',
      }
    },
    /* Authenticated User Popup Menu Button */
    {
      options: {
        popup: true,
        popup_delta: 'user_menu_authenticated',
        attributes: {
          'class': 'ui-btn-right',
          'data-icon': 'user'
        }
      },
      roles: {
        value: ['authenticated user'],
        mode: 'include',
      }
    },
    /* Help Popup Menu Button */
    {
      options: {
        popup: true,
        popup_delta: 'help_menu',
        attributes: {
          'class': 'ui-btn-right',
          'data-icon': 'help'
        }
      },
    }
  ]
};

// Footer Region Links
drupalgap.settings.menus.regions['footer'] = {
  links: [
    /* Back Button */
    {
      options: {
        attributes: {
          'data-icon': 'back',
          'data-iconpos': 'notext',
          'class': 'ui-btn-right',
          'onclick': 'javascript:drupalgap_back();'
        },
        reloadPage: true
      },
      pages: {
        value: [''],
        mode: 'exclude'
      }
    }
  ]
};

/**************|
 * Google Maps |
 **************/
drupalgap.settings.google_maps = {
  javascript_api_key: 'AIzaSyBx9gwBnaYdWhHbxOQE9h7I-ZV96YUxrHs'
};

/*********|
 * Camera |
 **********/
drupalgap.settings.camera = {
  quality: 50
};

/***********************|
 * Performance Settings |
 ***********************/
drupalgap.settings.cache = {}; // Do not remove this line.

// Theme Registry - Set to true to load the page.tpl.html contents from cache.
drupalgap.settings.cache.theme_registry = false;

drupalgap.settings.google_analytics = {
  id: 'UA-103664342-1'
};
