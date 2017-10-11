/**
 * Implements hook_form_alter().
 */
function reiscout_property_commerce_form_alter(form, form_state, form_id) {
  try {
    if (form_id == 'commerce_drupalgap_stripe_form') {
      form.elements['cvc']['type'] = 'number';

      form.elements['exp_month']['type'] = 'number';
      form.elements['exp_month']['prefix'] = '<label><strong>' + t('Expiration Date') + '</strong>*</label>';
      form.elements['exp_month']['title'] = '';
      form.elements['exp_month']['options']['attributes']['placeholder'] = t('MM');
      form.elements['exp_month']['suffix'] = '/';

      form.elements['exp_year']['type'] = 'number';
      form.elements['exp_year']['title'] = '';
      form.elements['exp_year']['options']['attributes']['placeholder'] = t('YYYY');
    }
    else if (form_id == 'commerce_checkout_view') {
      form.elements['billing_name_line']['title'] = '';
      form.elements['billing_name_line']['options']['attributes']['placeholder'] = t('Full name*');

      form.elements['shipping_name_line']['title'] = '';
      form.elements['shipping_name_line']['options']['attributes']['placeholder'] = t('Full name*');

      form.elements['billing_country']['title'] = '';
      form.elements['shipping_country']['title'] = '';

      form.elements['billing_thoroughfare']['title'] = '';
      form.elements['billing_thoroughfare']['options']['attributes']['placeholder'] = t('Address 1*');

      form.elements['shipping_thoroughfare']['title'] = '';
      form.elements['shipping_thoroughfare']['options']['attributes']['placeholder'] = t('Address 1*');

      form.elements['billing_premise']['title'] = '';
      form.elements['billing_premise']['options']['attributes']['placeholder'] = t('Address 2');

      form.elements['shipping_premise']['title'] = '';
      form.elements['shipping_premise']['options']['attributes']['placeholder'] = t('Address 2');

      form.elements['billing_locality']['title'] = '';
      form.elements['billing_locality']['options']['attributes']['placeholder'] = t('City*');

      form.elements['shipping_locality']['title'] = '';
      form.elements['shipping_locality']['options']['attributes']['placeholder'] = t('City*');

      form.elements['billing_administrative_area']['title'] = '';
      form.elements['billing_administrative_area']['options'] = _reiscout_misc_get_us_states_options();
      form.elements['billing_administrative_area']['default_value'] = 'GA';

      form.elements['shipping_administrative_area']['title'] = '';
      form.elements['shipping_administrative_area']['options'] = _reiscout_misc_get_us_states_options();
      form.elements['shipping_administrative_area']['default_value'] = 'GA';

      form.elements['billing_postal_code']['title'] = '';
      form.elements['billing_postal_code']['options']['attributes']['placeholder'] = t('Zip*');

      form.elements['shipping_postal_code']['title'] = '';
      form.elements['shipping_postal_code']['options']['attributes']['placeholder'] = t('Zip*');
    }
  }
  catch (error) {
    console.log('reiscout_property_commerce_form_alter - ' + error);
  }
}

/**
 * Implements hook_entity_post_render_field().
 */
function reiscout_property_commerce_entity_post_render_field(entity, field_name, field, reference) {
  try {
    if ('node' === field.entity_type && 'property' === field.bundle) {
      if ('field_image' === field_name) {
        if (entity._number_of_property_lead_sales) {
          reference.content += drupalgap_format_plural(
            entity._number_of_property_lead_sales,
            t('This lead has been purchased 1 time'),
            t('This lead has been purchased') + ' ' + entity._number_of_property_lead_sales + ' ' + t('times')
          );
        }
      }
    }
  }
  catch (error) {
    console.log('reiscout_property_commerce_entity_post_render_field - ' + error);
  }
}

/**
 * Checks if a user has purchased a property's address.
 */
function _reiscout_property_commerce_user_purchased_address_access(node) {
  return node._user_purchased_address_access_product;
}

/**
 * Checks if a property's address has been purchased by someone.
 */
function _reiscout_property_commerce_address_access_purchased(node) {
  return node._number_of_property_lead_sales;
}
