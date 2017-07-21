google_analytics
================

The Google Analytics module for DrupalGap.

# Setup

Enable the module in your `settings.js` file:

```
Drupal.modules.contrib['google_analytics'] = {};
```

Get a Google Analytics Tracking ID for your app's environment, see below.

Add this snippet to your settings.js file, using your tracking id instead:

```
/**
 * Google Analytics Settings
 */
drupalgap.settings.google_analytics = {
  id: 'UA-123456789-0'
};
```

## Web App Analytics Setup

Get an Google Analytics Tracking ID for a website, preferably a unique ID, i.e. not the same one you use for Drupal, unless you want to.

Then add this to your `index.html` file right before the closing `</body>` tag:

```
<!-- Google Analytics -->
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', drupalgap.settings.google_analytics.id, 'auto');
  ga('send', 'pageview');
</script>
<!-- End Google Analytics -->
```

If you are compiling your app, be sure to replace the `//www.google-analytics.com/analytics.js` with `https://www.google-analytics.com/analytics.js` instead.

## Compiled App Analytics

Get a Google Analytics Tracking ID for your app:
- https://support.google.com/analytics/answer/2614741?hl=en&ref_topic=2587085

Set up the Google Analytics SDK for your desired platform, e.g. Android:
- https://developers.google.com/analytics/devguides/collection/android/v4/
