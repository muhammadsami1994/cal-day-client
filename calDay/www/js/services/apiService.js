app.factory('apiService', function($http,$state,$cordovaFileTransfer,$cordovaToast,$rootScope,$ionicLoading,$window,$timeout) {

  $timeout(function(){
    //if(navigator.connection.type == 'none'){
    if(!navigator.onLine){
      console.log("nocon");
      $rootScope.online = false;
    }else {
      console.log("yescon");
      $rootScope.online = true;
    }
    checkOnce();
  },3000);

  var db = new PouchDB('calday_products');
  db.changes({
    since: 'now',
    live: true
  });
 var savedProductArray = [];
  console.log($rootScope.online);
  var checkOnce = function(){
    /*if($rootScope.online){
      db.allDocs({include_docs: true, descending: true}).then(function(doc) {
        console.log(doc);
        savedProductArray = doc.rows;
        sendPouchDBToServer()
      }).catch(function(err) {
        console.log(err);
      });
    }*/
  };
  $window.addEventListener('offline', function () {
    $rootScope.$apply(function () {
      $rootScope.online = false;
      console.log('offline')
    })
  },false);
  localStorage.setItem('callValue',1);
  $window.addEventListener('online', function () {
    if(localStorage.getItem('callValue') == 1){
      $rootScope.$apply(function () {
        $rootScope.online = true;
        console.log('online');
        db.allDocs({include_docs: true, descending: true})
          .then(function(doc) {
            console.log(doc);
            savedProductArray = doc.rows;
            localStorage.setItem('callValue',2);
            sendPouchDBToServer()
          }).catch(function(err) {
            console.log(err);
          });
      })
    }
  },false);
  var port = 'http://localhost:3000';
  //var port = 'https://calday.herokuapp.com';
  //var port = 'http://192.168.1.4:3000';
  var userData = localStorage.getItem('userId');
  var login = function (userObj) {
    $http.post(port+'/login',userObj)
      .then(function(data){
        if(data.data.code == 200){
          hideLoader();
          var saveToLocalStorage = userObj.userId;

          localStorage.setItem('userId',saveToLocalStorage);
          userData = localStorage.getItem('userId');
          $rootScope.userData = localStorage.getItem('userId');
          $state.go('datePicker');
        }else{
          console.log(data);
          hideLoader();
          showToast('Invalid User id or password');
        }
      },function(error){
        console.log(error);
        hideLoader();
        showToast('Having problem in login please try again later');
      })
  };
  var signUp = function (userObj) {
   if($rootScope.online){
     $http.post(port+'/signUp',userObj)
       .then(function(data){
         if(data.data.msg.email){
           hideLoader();
           showToast('Email already exist')
         }else if(data.data.msg.userId){
           hideLoader();
           showToast('User id already exist');
         }else if(data.data.code == 200){
           var saveToLocalStorage = userObj.userId;

           localStorage.setItem('userId',saveToLocalStorage);
           userData = localStorage.getItem('userId');
           $rootScope.userData = localStorage.getItem('userId');
           hideLoader();
           $state.go('datePicker');
         }
       },function(error){
         console.log(error);
         hideLoader();
         showToast('Having problem in sign up please try again later');
       })
   }else{
     hideLoader();
     showToast('No internet access');
   }
  };
  var createUserItem = function (item,callback) {
    item.userId = userData;
    $http.post(port+'/userItems',item)
      .then(function(data){
        if(data.data.code == 200){
          console.log(data.data.product);
          callback(data.data.product);
        }
        else{
          console.log(data);
          hideLoader();
          showToast('Having some problem in saving your product please try again later');
        }
      },function(error){
        console.log(error);
      })
  };
  var getUserItem = function (item,callback) {
    item.userId = userData;
    $http.get(port+'/userItems',{
      params: {
        userId: item.userId,
        date : item.date,
        month : item.month,
        year : item.year
      }
    }).then(function(data){
        if(data.data.code == 200){
          callback(data.data.products[0].userProduct);
        }
        else if(data.data.code == 404){
          console.log(data);
          hideLoader();
          showToast('No Products Found');
        }else{
          console.log(data);
          hideLoader();
          showToast('Having problem in getting product list');
        }
      },function(error){
        console.log(error);
        hideLoader();
        showToast('Cannot connect to server please try again later');
      })
  };
  var sendProductImage = function (image,productID, callback) {
    function win(r) {
      console.log(r);
      console.log("Code = " + r.responseCode);
      console.log("Response = " + r.response);
      console.log("Sent = " + r.bytesSent);
    }

    function fail(error) {
      console.log(error);
      console.log("An error has occurred: Code = " + error.code);
      console.log("upload error source " + error.source);
      console.log("upload error target " + error.target);
    }

    var uri = encodeURI(port + '/uploadProductImage/?userId='+userData+'&productID='+productID);
    var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = productID+'image.jpg'; // We will use the name auto-generated by Node at the server side.
    options.mimeType = "image/jpeg";
    options.chunkedMode = false;
    options.httpMethod = "POST";
    options.params = { // Whatever you populate options.params with, will be available in req.body at the server-side.
      "description": "Uploaded from my phone",
      userId: userData,
      _id: productID
    };
    /*var ft = new FileTransfer();
     ft.upload(imageURI, uri, win, fail, options,true);*/
    $cordovaFileTransfer.upload(uri, image, options)
      .then(function(result) {
        hideLoader();
        console.log(result);
        var reponse = JSON.parse(result.response);
        var imageURL = reponse.imageURL;
        callback(imageURL);
        // Success!
      }, function(err) {
        hideLoader();
        console.log(err);
        // Error
      }, function (progress) {
        console.log(progress);
        // constant progress updates
      });
  };
  var showLoader = function(){
    $ionicLoading.show({
      template: 'Loading...'
    });
  };
  var showPouchDbLoader = function(){
    $ionicLoading.show({
      template: 'Wait while are sending your offline data'
    });
  };
  var hideLoader = function(){
    $ionicLoading.hide();
  };
  var hidePouchDbLoader = function(){
    $ionicLoading.hide();
  };
  var getUser = function () {
    return userData
  };
  var getProductsTotal = function(month,callback){
    $http.get(port+'/userItemsByMonth',{
      params: {
        userId: userData,
        month : month
      }
    }).then(function(data){
      if(data.data.code == 200){
        console.log(data);
        function sortByKey(array, key) {
         return array.sort(function(a, b) {
         var x = a[key]; var y = b[key];
         return ((x < y) ? -1 : ((x > y) ? 1 : 0));
         });
         }
         var sortedData = sortByKey(data.data.products,'date');
        callback(sortedData)
      }
      else{
        console.log(data);
        hideLoader();
        showToast('Having problem in getting product list');
      }
    },function(error){
      console.log(error);
      hideLoader();
      showToast('Cannot connect to server please try again later');
    })
  };
  var showToast = function(msg){
    $cordovaToast.showShortBottom(msg).then(function(success) {
      // success
    }, function (error){
      // error
    });
  };
  var saveProductToPouchDB = function(productObj,callback){
    console.log(productObj);
    var product = {
      _id: new Date().toISOString(),
      product: productObj,
      completed: false
    };
    db.put(product).then(function(response){
        console.log('Successfully posted a todo! ' + response);
        console.log(response);
        db.get(response.id).then(function(doc){
          doc.product._id = doc._id;
          callback(true,doc)
        }).catch(function(err){
          console.log(err);
          hideLoader();
          showToast('Having problem in saving product offline');
        })
    }).catch(function(error){
      console.log(error);
      hideLoader();
      showToast('Having problem in saving product offline');
    });
    console.log('not internet');
  };
  var saveProductImgToPouchDb = function(imageURI,product,callback){
    console.log(imageURI);
    db.get(product._id).then(function(doc) {
      return db.put({
        _id: product._id,
        _rev: doc._rev,
        image: imageURI,
        product : product
      });
    }).then(function(response) {
      console.log(response);
      callback(true,imageURI)
    }).catch(function (err) {
      console.log(err);
    });
  };
  var sendPouchDBToServer = function () {
    showPouchDbLoader();
    if(savedProductArray[0]){
      function callMe (i){
        if(i<savedProductArray.length){
          createUserItem(savedProductArray[i].doc.product,function(product){
            if(savedProductArray[i].doc.image){
              sendProductImage(savedProductArray[i].doc.image,product.productID,function(imageURL){
                console.log(imageURL);
                db.remove(savedProductArray[i].doc, function(err, response) {
                  if (err) { return console.log(err); }
                  else{callMe(++i)}
                });
              })
            }else{
              db.remove(savedProductArray[i].doc, function(err, response) {
                if (err) { return console.log(err); }
                else{callMe(++i)}
              });
            }
          })
        }else{
          hidePouchDbLoader()
        }
      }
      callMe(0)
    }
    else{
      hidePouchDbLoader()
    }
  };
    return {
      login : login,
      signUp : signUp,
      createUserItem : createUserItem,
      getUserItem : getUserItem,
      sendProductImage : sendProductImage,
      showLoader : showLoader,
      hideLoader : hideLoader,
      getUser : getUser,
      getProductsTotal : getProductsTotal,
      showToast : showToast,
      saveProductToPouchDB : saveProductToPouchDB,
      saveProductImgToPouchDb : saveProductImgToPouchDb
      }
});

var obj = {
  _id:{
    objid:'0000000000000'
  },
  userId:'abc',
  userItems:[
    {
      itemName:'mango',
      date:24,
      month:1,
      year:2016
    },{
      itemName:'apple',
      date:24,
      month:1,
      year:2016
    }
  ]
}
