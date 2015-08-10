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
        controller: 'TableController'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

  app.factory('JSONTableFactory', function() {
    var factory = {};

    factory.load_data = function(tabular_json){
      headers = Object.keys(tabular_json[0]);
      data = [];
      for (var i = 0; i < tabular_json.length; i++) {
        data.push(values(tabular_json[i]));
      }
      return {headers: headers, data: data};
    };

    factory.load_file = function(the_file, callback){
      reader = new FileReader();
      reader.onload = function() {
          obj = JSON.parse(reader.result)
          callback(factory.load_data(obj));
      };
      reader.readAsText(the_file);
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

  app.controller('TableController', ['$scope', '$http', 'JSONTableFactory', 'MoneyFactory', function($scope, $http, JSONTableFactory, MoneyFactory){
    var table_ctrl = this;
    var status = {header_buttons_open: false};
    table_ctrl.headers = [];
    table_ctrl.data = [];
    table_ctrl.header_active = [];
    $scope.input_file = null;
    $scope.$watch('input_file', function (new_file) {
      if (new_file)
      {
        JSONTableFactory.load_file(new_file, function(result) {
          $scope.$apply(function() {
            table_ctrl.headers = result.headers;
            table_ctrl.data = result.data;
            table_ctrl.header_active = []
            for (var i = 0; i < table_ctrl.headers.length; i++) {
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
        table_ctrl.headers = table_ctrl.headers.map(map_func);
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
      for (var row_idx = 0; row_idx < table_ctrl.data.length; row_idx++) {
        var this_row = table_ctrl.data[row_idx];
        for (var col_idx = 0; col_idx < this_row.length; col_idx++) {
          if (MoneyFactory.is_money(this_row[col_idx])) {
            this_row[col_idx] = MoneyFactory.convert_money(this_row[col_idx]);
          }
        }
      }
    }

    this.delete_field = function(idx){
      table_ctrl.headers.splice(idx, 1);
      for (var i = 0; i < table_ctrl.data.length; i++) {
        table_ctrl.data[i].splice(idx, 1);
      };
    };
  }]);
})();
