// 优化lang filter支持在config中进行中英文语言切换
angular.module('kityminderEditor').filter('lang', [
  'config',
  'lang.zh-cn',
  'lang.en',
  function (config, langcn, langen) {
    return function (text, block) {
      var defaultLang = config.get('defaultLang');

      if (langcn[defaultLang] == undefined && langen[defaultLang] == undefined) {
        return '未发现对应语言包，请检查 lang.xxx.service.js!';
      } else {
        var dict;
        if(langen[defaultLang])
          dict = langen[defaultLang];
        else
          dict = langcn[defaultLang];

        block.split('/').forEach(function (ele, idx) {
          dict = dict[ele];
        });

        return dict[text] || null;
      }
    };
  },
]);
