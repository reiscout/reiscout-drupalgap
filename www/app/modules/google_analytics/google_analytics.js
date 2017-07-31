/**
 * Implements hook_drupalgap_goto_post_process().
 */
function google_analytics_drupalgap_goto_post_process(path) {
  ga('set', 'page', '/' + path);
  ga('send', 'pageview');
}
