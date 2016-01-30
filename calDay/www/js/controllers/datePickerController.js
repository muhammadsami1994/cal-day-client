app.controller('datePickerCtrl', function($scope,$state,apiService,$cordovaToast,$rootScope,$window) {

  $scope.options = {
    defaultDate: new Date(),
    minDate: "2015-01-01",
    maxDate: "2055-12-31",
    disabledDates: [],
    dayNamesLength: 3,
    mondayIsFirstDay: false,
    eventClick: function(date) {
      console.log(date);
    },
    dateClick: function(date) {
      $scope.date = new Date();
      var SelectDate = new Date(date.date);
      if(SelectDate > $scope.date){
        apiService.showToast('You cannot select this date');
      }else if(SelectDate < $scope.date){
        $state.go('userItem',{
          date : {
            date : date.day,
            month : date.month,
            year : date.year
          }
        })
      }
    },
    changeMonth: function(month, year) {
      console.log(month, year);
    }
  };

  $scope.events = [
    {foo: 'bar', date: "2015-08-18"},
    {foo: 'bar', date: "2015-08-20"}
  ];

  function expand() {
    var rect = this.textContent;
    var res = rect.split(" ");
    console.log(rect);
    var month = res[0].slice(0,3);
    $state.go('userItemByMonth',{
      month : month
    })
  }

  function nodeListOn(list, type, handler, useCapture) {
    var i, t;
    type = type.split(/s+/);
    for (i = 0; i < list.length; ++i) {
      for (t = 0; t < type.length; ++t) {
        list[i].addEventListener(type[t], handler, useCapture);
      }
    }
  }

  var nodes = document.querySelectorAll('.month .label');
  nodeListOn(nodes, 'click', expand);
});
