var app = angular.module('calDay', ['ionic','flexcalendar','flexcalendar.defaultTranslation','pascalprecht.translate','ngCordova'])

.run(function($ionicPlatform,$rootScope,$ionicLoading) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
});
app.config(function($stateProvider, $urlRouterProvider) {
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
      controller : 'loginCtrl'
  })
    .state('signUp', {
    url: '/signUp',
    templateUrl: 'templates/signUp.html',
    controller : 'singUpCtrl'
  })
    .state('datePicker', {
    url: '/datePicker',
    templateUrl: 'templates/datePicker.html',
    controller : 'datePickerCtrl',
    cache : false
  })
    .state('userItem', {
    url: '/userItem',
    params : {
      date : null,
      canEdit : false
    },
    templateUrl: 'templates/userItem.html',
    controller : 'userItemCtrl',
    cache : false
  })
    .state('userItemByMonth', {
    url: '/userItemByMonth',
    params : {month :null},
    templateUrl: 'templates/userItemByMonth.html',
    controller : 'userItemByMonthCtrl',
    cache : false
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
