(function() {
  var app = angular.module('file-selector', ['file-model']);
  app.directive('fileSelector', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {fsModel: '='},
      templateUrl: 'directives/file_selector.html'
      }
  });
})();
