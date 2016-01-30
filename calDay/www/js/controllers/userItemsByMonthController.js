app.controller('userItemByMonthCtrl', function($scope,apiService,$state,$stateParams,$http,$ionicPopup,$ionicModal,$cordovaToast,$rootScope) {
    console.log($stateParams.month);
  $scope.monthArray = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  $scope.month = $scope.monthArray.indexOf($stateParams.month)+1;
  $scope.userId = apiService.getUser();
  $scope.productsTotal = [];
  $scope.showError = true;
  $scope.grandTotal = 0;
  function init (){
    apiService.showLoader();
    if($rootScope.online){
      apiService.getProductsTotal($scope.month,function(data){
        console.log(data);
        if(data[0]){
          $scope.productsTotal = data[0].userProductTotal;
          for(var i=0; i<$scope.productsTotal.length;i++){
            $scope.grandTotal = $scope.grandTotal + $scope.productsTotal[i].total;
          }
          $scope.showError = false;
          apiService.hideLoader();
        }else{
          apiService.hideLoader()
        }
      })
    }else{
      apiService.hideLoader();
      apiService.showToast('Internet is not available');
    }
  }
  init();
  $scope.goToItemByDate = function(productTotal){
    console.log(productTotal);
    /*var d = new Date();
    d.setFullYear(productTotal.year, productTotal.month - 1, productTotal.date);*/
    var date = {
        date : productTotal.date,
        month : productTotal.month-1,
        year : productTotal.year
    };
    $state.go('userItem',{
      date : date
    })
  }
});
