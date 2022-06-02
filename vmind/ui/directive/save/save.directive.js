angular.module('kityminderEditor').directive('save', [
  'commandBinder',
  function () {
    return {
      restrict: 'E',
      templateUrl: 'ui/directive/save/save.html',
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
