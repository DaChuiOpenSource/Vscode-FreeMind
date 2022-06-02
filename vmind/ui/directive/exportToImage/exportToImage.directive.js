angular.module('kityminderEditor').directive('exportToImage', [
  'commandBinder',
  function () {
    return {
      restrict: 'E',
      templateUrl: 'ui/directive/exportToImage/exportToImage.html',
      scope: {
        minder: '=',
      },
      replace: true,
      link: function ($scope) {
        var minder = $scope.minder;

        $scope.save = function () {
          window.vscode.postMessage({
            command: 'save',
            exportData: JSON.stringify(minder.exportJson(), null, 4),
          });
        };
        $scope.exportToImage = function () {
          minder.exportData('png').then(function (res) {
            window.vscode.postMessage({
              command: 'exportToImage',
              exportData: res,
            });
          });
        };
      },
    };
  },
]);
