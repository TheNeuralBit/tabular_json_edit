function values(my_object) {
  rtrn = []
  for(var key in my_object) {
      rtrn.push(my_object[key]);
  }
  return rtrn
}


(function() {
  var app = angular.module('tabular_json_edit', ['file-selector', 'ui.bootstrap', 'ngRoute']);

  app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'partials/table_editor.html',
        controller: 'TableController',
        controllerAs: 'table_ctrl'
      }).
      when('/output', {
        templateUrl: 'partials/json_viewer.html',
        controller: 'TableController',
        controllerAs: 'table_ctrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);


  app.factory('JSONTableService', function() {
    factory = {};
    factory.data = {
      headers: [],
      data: []
    };

    factory.load_data = function(tabular_json){
      headers = Object.keys(tabular_json[0]);
      data = [];
      for (var i = 0; i < tabular_json.length; i++) {
        data.push(values(tabular_json[i]));
      }
      factory.data.headers = headers;
      factory.data.data = data;
    };

    factory.load_file = function(the_file, callback){
      reader = new FileReader();
      reader.onload = function() {
          obj = JSON.parse(reader.result)
          callback(factory.load_data(obj));
      };
      reader.readAsText(the_file);
    };

    factory.convert_to_json = function() {
      rtrn = [];
      for (var row = 0; row < factory.data.data.length; row++) {
        curr_obj = {};
        for (var col = 0; col < factory.data.headers.length; col++) {
          curr_obj[factory.data.headers[col]] = factory.data.data[row][col];
        }
        rtrn.push(curr_obj)
      }
      return rtrn;
    };

    return factory;
  });

  app.factory('MoneyFactory', function(){
    var factory = {};
    factory.is_money = function(value) {
      if (typeof value != "string") return false;
      return /^\$[\d,\.]+$/.test(value);
    }

    factory.convert_money = function(money_value) {
      return parseFloat(money_value.replace(/[\$,]/g, ''));
    }
    return factory
  });

  app.controller('TableController', ['$scope', '$http', 'JSONTableService', 'MoneyFactory', function($scope, $http, JSONTableService, MoneyFactory){
    var table_ctrl = this;
    var status = {header_buttons_open: false};
    $scope.data = JSONTableService.data;
    table_ctrl.header_active = [];
    $scope.input_file = null;
    $scope.$watch('input_file', function (new_file) {
      if (new_file)
      {
        JSONTableService.load_file(new_file, function(result) {
          $scope.$apply(function() {
            table_ctrl.header_active = []
            for (var i = 0; i < JSONTableService.data.headers.length; i++) {
              table_ctrl.header_active.push(false);
            }
          });
        });
      }
    })

    $scope.$watch('output_file', function (new_file) {
      if (new_file)
        table_ctrl.write_file(new_file);
    })

    this.write_file = function(the_file){
      write = new FileWriter();
    };

    // Functions for modifying headers
    header_modifier_factory = function(map_func){
      return function() {
        JSONTableService.data.headers = JSONTableService.data.headers.map(map_func);
      };
    };

    this.lowercase_headers = 
      header_modifier_factory(function(item){ return item.toLowerCase() });

    this.uppercase_headers =
      header_modifier_factory(function(item){ return item.toUpperCase() });

    this.spaces_to_underscores =
      header_modifier_factory(function(item){ return item.replace(/\s+/g, '_'); });

    // Functions for modifying data
    this.convert_all_money_values = function() {
      for (var row_idx = 0; row_idx < JSONTableService.data.data.length; row_idx++) {
        var this_row = JSONTableService.data.data[row_idx];
        for (var col_idx = 0; col_idx < this_row.length; col_idx++) {
          if (MoneyFactory.is_money(this_row[col_idx])) {
            this_row[col_idx] = MoneyFactory.convert_money(this_row[col_idx]);
          }
        }
      }
    }

    this.delete_field = function(idx){
      JSONTableService.data.headers.splice(idx, 1);
      for (var i = 0; i < table_ctrl.data.length; i++) {
        JSONTableService.data.data[i].splice(idx, 1);
      };
    };
    this.data_as_json = function() { return JSONTableService.convert_to_json(); };
  }]);
})();
