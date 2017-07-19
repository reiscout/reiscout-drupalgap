/**
 * Implements hook_form_alter().
 */
function reiscout_misc_form_alter(form, form_state, form_id) {
  try {
    if ('contact_site_form' == form_id) {
      form.elements.copy.access = false;
    }
  }
  catch (error) {
    console.log('reiscout_misc_form_alter - ' + error);
  }
}
