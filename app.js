function values(my_object) {
  rtrn = []
  for(var key in my_object) {
      rtrn.push(my_object[key]);
  }
  return rtrn
}

function condition_data(tabular_json) {
  headers = Object.keys(tabular_json[0]);
  data = [];
  for (var i = 0; i < tabular_json.length; i++) {
    data.push(values(tabular_json[i]));
  }
  return {headers: headers, data: data};
}

(function() {
  var app = angular.module('tabular_json_edit', ['file-model', 'ui.bootstrap']);

  app.controller('TableController', ['$scope', '$http', function($scope, $http, $digest){
    var table_ctrl = this;
    var status = {header_buttons_open: false};
    table_ctrl.headers = [];
    table_ctrl.data = [];
    table_ctrl.header_active = [];
    $scope.input_file = null;
    $scope.$watch('input_file', function (new_file) {
      if (new_file)
        table_ctrl.load_file(new_file);
    })
    this.load_data = function(data){
      result = condition_data(data);
      table_ctrl.headers = result.headers;
      table_ctrl.data = result.data;
      table_ctrl.header_active = []
      for (var i = 0; i < table_ctrl.headers.length; i++) {
        table_ctrl.header_active.push(false);
      }
    };
    this.load_file = function(the_file){
      reader = new FileReader();
      reader.onload = function() {
        $scope.$apply(function() {
          obj = JSON.parse(reader.result)
          table_ctrl.load_data(obj);
        });
      };
      reader.readAsText(the_file);
    };

    // Functions for modifying headers
    header_modifier_factory = function(map_func){
      return function() {
        table_ctrl.headers = table_ctrl.headers.map(map_func);
      };
    };

    this.lowercase_headers = 
      header_modifier_factory(function(item){
        return item.toLowerCase()
      });

    this.uppercase_headers =
      header_modifier_factory(function(item){
        return item.toUpperCase()
      });

    this.spaces_to_underscores =
      header_modifier_factory(function(item){
        return item.replace(/\s+/g, '_');
      });

    // Functions for modifying data
    this.convert_all_money_values = function() {
      for (var row_idx = 0; row_idx < table_ctrl.data.length; row_idx++) {
        var this_row = table_ctrl.data[row_idx];
        for (var col_idx = 0; col_idx < this_row.length; col_idx++) {
          if (is_money(this_row[col_idx])) {
            this_row[col_idx] = convert_money(this_row[col_idx]);
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

  /*app.directive("productDescription", function() {
    return {
      restrict: 'E',
      templateUrl: "product-description.html"
    };
  });

  app.directive("productReviews", function() {
    return {
      restrict: 'E',
      templateUrl: "product-reviews.html"
    };
  });

  app.directive("productSpecs", function() {
    return {
      restrict:"A",
      templateUrl: "product-specs.html"
    };
  });

  app.directive("productTabs", function() {
    return {
      restrict: "E",
      templateUrl: "product-tabs.html",
      controller: function() {
        this.tab = 1;

        this.isSet = function(checkTab) {
          return this.tab === checkTab;
        };

        this.setTab = function(activeTab) {
          this.tab = activeTab;
        };
      },
      controllerAs: "tab"
    };
  });

  app.directive("productGallery", function() {
    return {
      restrict: "E",
      templateUrl: "product-gallery.html",
      controller: function() {
        this.current = 0;
        this.setCurrent = function(imageNumber){
          this.current = imageNumber || 0;
        };
      },
      controllerAs: "gallery"
    };
  });*/

})();

function is_money(value) {
  if (typeof value != "string") return false;
  return /^\$[\d,\.]+$/.test(value);
}

function convert_money(money_value) {
  return parseFloat(money_value.replace(/[\$,]/g, ''));
}
