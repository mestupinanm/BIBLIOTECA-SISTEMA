/* ============================================
   HELP / EMAIL SERVICE CONFIGURATION
   Fill these values with your real provider data.
   ============================================ */
(function () {
  'use strict';

  window.PepperLib = window.PepperLib || {};

  PepperLib.HelpConfig = {
    provider: 'formsubmit',
    recipient: 'm.estupinanm@uniandes.edu.co',
    senderName: 'Nova',
    locationFallback: 'la biblioteca',
    formsubmit: {
      endpointBase: 'https://formsubmit.co/ajax/',
      subject: 'Nova necesita ayuda',
      captcha: false,
      template: 'table'
    },
    emailjs: {
      endpoint: 'https://api.emailjs.com/api/v1.0/email/send',
      serviceId: 'YOUR_EMAILJS_SERVICE_ID',
      templateId: 'YOUR_EMAILJS_TEMPLATE_ID',
      publicKey: 'YOUR_EMAILJS_PUBLIC_KEY'
    }
  };
})();
