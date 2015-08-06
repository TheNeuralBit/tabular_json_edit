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
  var app = angular.module('tabular_json_edit', ['file-model']);

  app.controller('TableController', ['$scope', '$http', function($scope, $http, $digest){
    var table_ctrl = this;
    table_ctrl.headers = [];
    table_ctrl.data = [];
    $scope.input_file = null;
    $scope.$watch('input_file', function (new_file) {
      if (new_file)
        table_ctrl.load_file(new_file);
    })
    this.load_data = function(data){
      result = condition_data(data);
      table_ctrl.headers = result.headers;
      table_ctrl.data = result.data;
    };
    this.load_file = function(the_file){
      reader = new FileReader();
      reader.onload = function() {
        $scope.$apply(function() {
	  obj = JSON.parse(reader.result)
          console.log(reader.result);
          console.log(obj);
          table_ctrl.load_data(obj);
        });
      };
      reader.readAsText(the_file);
    };

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
