define(function (require, exports, module) {
  var defaultLang = 'en';
  var dict = {
    en: {
      ArrangeUp: 'Up',
      AppendChildNode: 'AddChild',
      AppendSiblingNode: 'AddSibling',
      ArrangeDown: 'Down',
      RemoveNode: 'Remove',
      AppendParentNode: 'AddParent',
      ImportNode: 'ImportNode',
      ExportNode: 'ExportNode',
      Edit: 'Edit',
      Priority: 'Priority',
      Progress: 'Progress',
      Undo: 'Undo',
      Redo: 'Redo',
      Del: 'Del',
      Esc: 'Esc',
    },
    'zh-cn': {
      ArrangeUp: '前移',
      AppendChildNode: '下级',
      AppendSiblingNode: '同级',
      ArrangeDown: '后移',
      RemoveNode: '删除',
      AppendParentNode: '上级',
      ImportNode: '导入节点',
      ExportNode: '导出节点',
      Edit: '编辑',
      Priority: '优先级',
      Progress: '进度',
      Undo: '撤销',
      Redo: '重做',
      Del: '移除',
      Esc: '返回',
    },
  };
  var lang = {
    get: function (keys) {
      var keyarray = keys.split('.');
      var tempobj = dict[defaultLang];
      keyarray.forEach(function (key) {
        tempobj = tempobj[key];
      });
      return tempobj;
    },
  };

  return (module.exports = lang);
});
