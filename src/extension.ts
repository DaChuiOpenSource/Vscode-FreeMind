'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { resourceSchema } from './constant';
import { Xmind, Img } from './services';

/**
 * Extension激活时触发
 * @param context Extension上下文
 */
export function activate(context: vscode.ExtensionContext) {
  //console.log('command activate...');

  const openedPanelMap = new Map<string, boolean | undefined | null>();
  let isFirstActivate: boolean = true;
  let timer: any = null;
  let vmindPath: string = 'vmind';

  // 注册命令registerTextEditorCommand
  let disposable = vscode.commands.registerTextEditorCommand(
    'extension.mindmap',
    () => {
      // 获取当前激活的编辑器
      const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
      // 获取当前激活编辑器打开的文件名称
      const fileName = (<vscode.TextEditor>editor).document.fileName;
      const basename = path.basename(fileName);
      const extName = path.extname(fileName);
      if(extName != '.vmind' && extName != '.xmind') {
        return;
      }
      // 拼接mindmap的入口文件mindmap.html
      const onDiskPath = vscode.Uri.file(
        path.join(context.extensionPath, vmindPath, 'mindmap.html')
      );
      // 获取入口文件的URI
      const resourcePath = vscode.Uri.file(
        path.join(context.extensionPath, vmindPath)
      );
      // 使用vscode的资源协议
      const resourceRealPath = resourcePath.with({ scheme: resourceSchema });
      // 读取文件的内容到fileContent
      const fileContent =
        process.platform === 'win32'
          ? fs.readFileSync(onDiskPath.path.slice(1)).toString()
          : fs.readFileSync(onDiskPath.path).toString();
      // 替换文件中使用到的资源路径
      const html = fileContent.replace(
        /\$\{vscode\}/g,
        resourceRealPath.toString()
      );

      const xmindService = new Xmind(fileName); // 创建Xmind
      const imgService = new Img(); // 创建Img

      // create WebviewPanel
      const panel = createWebviewPanel(basename);
      // 从脑图文件中读取数据
      const importData = getImportData(fileName, extName, xmindService) || '{}';

      // 打开脑图同时关闭.vmind文件
      vscode.commands.executeCommand('workbench.action.closeActiveEditor');
      //console.log('加载的文件内容：\n' + html);
      // 设置webview的展示内容
      panel.webview.html = html;

      // 接收webview发送的message
      panel.webview.onDidReceiveMessage(
        message => {
          let destFileName = '';
          switch (message.command) {
            case 'loaded':
              // 向webview发送message
              panel.webview.postMessage({
                command: 'import',
                importData,
                extName,
              });
              return;

            case 'save':
              try {
                const retData = JSON.parse(message.exportData);
                destFileName =
                  extName === '.xmind'
                    ? fileName.replace(/(\.xmind)/, '.vmind')
                    : fileName;

                writeFileToDisk(destFileName, JSON.stringify(retData, null, 4));
              } catch (ex) {
                console.error(ex);
              }
              return;

            case 'exportToImage':
              const buffer = imgService.base64ToPng(message.exportData);
              destFileName = fileName.replace(/(\.xmind|\.kme|\.vmind)/, '.png');
              writeFileToDisk(destFileName, buffer);
              return;
          }
        },
        undefined,
        context.subscriptions
      );

      panel.onDidDispose(
        () => {
          // emit event to webview
        },
        null,
        context.subscriptions
      );
    }
  );

  const executeFirstCommand = (originFileName: string) => {
    if (isFirstActivate) {
      isFirstActivate = false;
      openedPanelMap.set(originFileName, true);
      timer = setTimeout(() => {
        vscode.commands.executeCommand('extension.mindmap');
      }, 300);
    }
  };

  context.subscriptions.push(disposable);
  executeFirstCommand(
    (vscode.window.activeTextEditor as vscode.TextEditor).document.fileName
  );
  vscode.workspace.onDidOpenTextDocument(e => {
    const originFileName = e.fileName.replace('.git', '');
    if (isFirstActivate) {
      executeFirstCommand(originFileName);
      return;
    }

    if (!openedPanelMap.get(originFileName)) {
      openedPanelMap.set(originFileName, true);
      timer = setTimeout(() => {
        vscode.commands.executeCommand('extension.mindmap', originFileName);
      }, 300);
    }
  });
  vscode.workspace.onDidCloseTextDocument(e => {
    if (e.fileName.endsWith('.git')) {
      return;
    }

    if (openedPanelMap.get(e.fileName)) {
      clearTimeout(timer);
      openedPanelMap.set(e.fileName, false);
    }
  });
}

/**
 * Extension消亡时触发
 */
export function deactivate() {}

/**
 * create webview
 * @param fileName
 */
function createWebviewPanel(fileName: string) {
  return vscode.window.createWebviewPanel(
    'mindMap',
    `${fileName}-mindmap`,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
    }
  );
}

/**
 * processing source data
 * 如果是.xmind则特殊处理, 其他的直接读取
 * @param fileName
 * @param extName
 */
function getImportData(fileName: string, extName: string, xmind: Xmind) {
  if (extName === '.xmind') {
    return JSON.stringify(xmind.process());
  }

  return fs.readFileSync(fileName).toString();
}

function writeFileToDisk(fileName: string, data: any) {
  fs.writeFile(fileName, data, (err: any) => {
    if (err) {
      vscode.window.showErrorMessage(`write ${fileName} failed`);
      console.log(err);
      throw err;
    }
    vscode.window.showInformationMessage(`write ${fileName} successed`);
  });
}
