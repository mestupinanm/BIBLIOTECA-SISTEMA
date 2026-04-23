(function () {
  'use strict';

  window.LibraryStaticStructure = window.LibraryStaticStructure || {};

  window.LibraryStaticStructure.App = {
    rootId: 'app',
    shellFile: 'index.html',
    styleFile: 'css/styles.css',
    screens: [
      'IdleScreen',
      'GreetingScreen',
      'MenuScreen',
      'NavigationScreen',
      'NavigationGuideScreen',
      'ShelvesScreen',
      'BooksScreen',
      'InfoScreen',
      'EventsScreen',
      'FeedbackScreen'
    ],
    components: [
      'TopBar',
      'HelpModal'
    ]
  };
})();
