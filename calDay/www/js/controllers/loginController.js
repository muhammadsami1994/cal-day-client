app.controller('loginCtrl', function($scope,apiService,$rootScope,$state) {
  $scope.userData = {};
  function init (){
    var userData = apiService.getUser();
    if(userData){
      $state.go('datePicker');
    }
  }
  init();
  /*login function*/
  $scope.login = function(){
    apiService.showLoader();
    if(!$scope.userData.userId){
      apiService.hideLoader();
      apiService.showToast('user id is required');
    }else if(!$scope.userData.password){
      apiService.hideLoader();
      apiService.showToast('password is required');
    }else {
      if($rootScope.online){
        apiService.login(($scope.userData))
      }else{
        apiService.hideLoader();
        apiService.showToast('Internet is not available')
      }
    }
  }
});
