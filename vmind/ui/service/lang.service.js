angular.module('kityminderEditor').service('lang', [
  'config',
  'lang.zh-cn',
  'lang.en',
  function (config, langcn, langen) {
    var defaultLang = config.get('defaultLang');
    var dict;
    if (langen[defaultLang]) {
      dict = langen[defaultLang];
    } else {
      dict = langcn[defaultLang];
    }

    return {
      get: function (keys) {
        var keyarray = keys.split('.');
        var tempobj = dict;
        keyarray.forEach(function (key) {
          tempobj = tempobj[key];
        });
        return tempobj;
      },
    };
  },
]);
