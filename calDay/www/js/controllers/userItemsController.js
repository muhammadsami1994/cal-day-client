app.controller('userItemCtrl', function($scope,apiService,$state,$stateParams,$ionicPopup,$ionicModal,$cordovaToast,$timeout,$rootScope) {
  $scope.canEdit = false;
  $scope.showError = true;
  $scope.products = [];
  $scope.productObj = {};
  $scope.productsTotal = 0;
  $scope.myProduct = {};
  $scope.search = '';
  $scope.itemList=[];
  $scope.blisterPackTemplates=[{name:"Kg"},{name:"Liter"},{name:"Unit"},{name:"Dozan"}];

  $scope.changedValue=function(item){
    console.log(item.name);
    $scope.productObj.quantityUnit = item.name;
  };


  /*selected date*/
  $scope.date = $stateParams.date;
  $scope.selectedDate = new Date($scope.date.year, $scope.date.month,$scope.date.date);
  $scope.currentDate = new Date();
  $scope.currentDate.setHours(0,0,0,0);
  function init (){
    apiService.showLoader();
    $scope.productObj.date = $scope.selectedDate.getDate();
    $scope.productObj.month = $scope.selectedDate.getMonth()+1;
    $scope.productObj.year = $scope.selectedDate.getFullYear();
    if($scope.selectedDate<$scope.currentDate){
      $scope.canEdit = false;
    }else{
      $scope.canEdit = true;
    }
    if($rootScope.online){
      apiService.getUserItem($scope.productObj,function(products){
        console.log(products);
        if(products[0]){
          $scope.showError = false;
          $scope.products = products;
          for(var i = 0; i<products.length;i++){
            $scope.productsTotal = $scope.productsTotal + products[i].total;
          }
          apiService.hideLoader()
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
  $scope.saveProduct = function(){
    apiService.showLoader();
    if(!$scope.productObj.productName){
      apiService.hideLoader();
      apiService.showToast('Product name required');
    }else if(!$scope.productObj.quantity){
      apiService.hideLoader();
      apiService.showToast('Quantity required');
    }else if(!$scope.productObj.pricePerUnit){
      apiService.hideLoader();
      apiService.showToast('Price Per Unit required');
    }else{
      console.log($scope.productObj);
      $scope.productObj.dayTotal = $scope.productsTotal + ($scope.productObj.pricePerUnit * $scope.productObj.quantity);
      if($rootScope.online){
        apiService.createUserItem($scope.productObj, function (product) {
          $scope.products.push(product);
          $scope.showError = false;
          $scope.productsTotal = $scope.productsTotal + product.total;
          apiService.hideLoader();
          $scope.showConfirm();
        })
      }else{
        apiService.saveProductToPouchDB($scope.productObj, function (boolean,response) {
          $scope.products.push(response.product);
          $scope.showError = false;
          response.product.total = response.product.quantity * response.product.pricePerUnit;
          $scope.productsTotal = $scope.productsTotal + response.product.total;
          apiService.hideLoader();
          $scope.showConfirm();

        });
      }
    }
  };
  // A confirm dialog
  $scope.showConfirm = function() {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Product Image',
      template: 'Do you want to add image of receipt or product'
    });

    confirmPopup.then(function(res) {
      if(res) {
        console.log('Take Image');
        $scope.takePicture();
      } else {
        console.log('Do not take Image');
        $scope.closeAddProductModal();
      }
    });
  };

  $scope.takePicture = function () {
    var productID = $scope.products[$scope.products.length - 1].productID;
    var options = {
      quality: 45,
      targetWidth: 1000,
      targetHeight: 1000,
      destinationType: Camera.DestinationType.FILE_URI,
      encodingType: Camera.EncodingType.JPEG,
      sourceType: Camera.PictureSourceType.CAMERA
    };
    navigator.camera.getPicture(
      function (imageURI) {
        apiService.showLoader();
        console.log(imageURI);
        if($rootScope.online){
          apiService.sendProductImage(imageURI,productID,function(image){
            $scope.products[$scope.products.length-1].image = image;
            $scope.closeAddProductModal();
          });
        }else{
          apiService.saveProductImgToPouchDb(imageURI,$scope.products[$scope.products.length-1],function(boolean,img){
            if(boolean){
              $scope.products[$scope.products.length-1].image = img;
              $scope.closeAddProductModal();
              apiService.hideLoader();
            }
          })
        }
      },
      function (message) {
       console.log(message)
      }, options);
    return false;
  };

  /*add product modal*/
  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.addProductmodal = modal;
  });
  $scope.openAddProductModal = function() {
    $scope.emptyProduct();
    $scope.addProductmodal.show();
  };
  $scope.closeAddProductModal = function() {
    $scope.addProductmodal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.addProductmodal.remove();
  });
  // Execute action on hide modal
  $scope.$on('addProductmodal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('addProductmodal.removed', function() {
    // Execute action
  });
  /*my product modal*/
  $ionicModal.fromTemplateUrl('my-product.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.myProductmodal = modal;
  });
  $scope.openMyProductModal = function() {
    $scope.myProductmodal.show();
  };
  $scope.closeMyProductModal = function() {
    $scope.myProductmodal.hide();
  };
  //Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.myProductmodal.remove();
  });
  // Execute action on hide modal
  $scope.$on('myProductmodal.hidden', function() {
    // Execute action
  });
  // Execute action on remove modal
  $scope.$on('myProductmodal.removed', function() {
    // Execute action
  });
  $scope.setProductForModal = function (product) {

    $scope.myProduct = product;

    //document.getElementById('myProductModal').innerHTML = '';
    $scope.openMyProductModal();
  };
  /*empty the product object*/
  $scope.emptyProduct = function(){
    $scope.productObj.productName = '';
    $scope.productObj.quantity = null;
    $scope.productObj.pricePerUnit = null;
    $scope.productObj.image = '';

  }
});
