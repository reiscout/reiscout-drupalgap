/**
 * Implements hook_form_alter().
 */
function reiscout_property_commerce_form_alter(form, form_state, form_id) {
  try {
    if (form_id == 'commerce_drupalgap_stripe_form') {
      form.elements['card_cvc']['type'] = 'number';

      form.elements['exp_month']['type'] = 'number';
      form.elements['exp_month']['prefix'] = '<label><strong>' + t('Expiration Date') + '</strong>*</label>';
      form.elements['exp_month']['title'] = '';
      form.elements['exp_month']['options']['attributes']['placeholder'] = t('MM');
      form.elements['exp_month']['suffix'] = '/';

      form.elements['exp_year']['type'] = 'number';
      form.elements['exp_year']['title'] = '';
      form.elements['exp_year']['options']['attributes']['placeholder'] = t('YYYY');
    }
  }
  catch (error) {
    console.log('reiscout_property_commerce_form_alter - ' + error);
  }
}
