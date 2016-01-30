app.controller('singUpCtrl', function($scope,apiService,$rootScope) {
  $scope.userData = {};
  $scope.signUp = function(){
    apiService.showLoader();
    if(!$scope.userData.userId){
      apiService.hideLoader();
      apiService.showToast('user id is required');
    }else if(!$scope.userData.password){
      apiService.hideLoader();
      apiService.showToast('password is required');
    }else if(!$scope.userData.email){
      apiService.hideLoader();
      apiService.showToast('email is required');
    }else {
      if($rootScope.online){
        apiService.signUp($scope.userData)
      }else{
        apiService.hideLoader();
        apiService.showToast('Internet is not available');
      }
    }
  }
});
