/**
 * initial kityminder-editor
 */
/* jshint esversion: 6 */
angular
  // 初始化angular应用,依赖kityminderEditor模块,kityminderEditor在kityminder.app.js中使用
  .module('kityminderDemo', ['kityminderEditor'])
  // 配置
  .config(function (configProvider) {
    configProvider.set('imageUpload', '../server/imageUpload.php');
  })
  // angular应用对应的控制器
  .controller('MainController', function ($scope) {
    $scope.initEditor = function (editor, minder) {
      //window.editor = editor; 优化去除,在 kityminderEditor 指令中已经将editor、minder给window
      //window.minder = minder;

      /**
       * receive message event from extension
       */
      window.addEventListener('message', function (event) {
        window.message = event.data;
        const { command } = window.message;

        switch (command) {
          case 'import':
            try {
              const importData = JSON.parse(window.message.importData);
              window.minder.importJson(importData);
            } catch (ex) {
              console.error(ex);
            }
            break;
        }
      });

      window.addEventListener('keydown', (e) => {
        const keyCode = e.keyCode || e.which || e.charCode;
        const ctrlKey = e.ctrlKey || e.metaKey;
        if (ctrlKey && keyCode === 83) {
          const btnSave = document.querySelector('.km-export-save');
          btnSave.click();
        }
      });

      window.vscode.postMessage({
        command: 'loaded',
      });
    };
  });
