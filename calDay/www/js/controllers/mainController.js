app.controller('mainCtrl', function($scope,$rootScope,$ionicSideMenuDelegate,$state, apiService) {
  $rootScope.userData = apiService.getUser();
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
  $scope.logMeout = function(){
    localStorage.clear();
    $state.go('login');
    $ionicSideMenuDelegate.toggleLeft();
  };
  $scope.goToCalender = function(){
    $ionicSideMenuDelegate.toggleLeft();
    $state.go('datePicker');
  };
});
