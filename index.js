const HtmlWebpackPlugin = require('html-webpack-plugin')
function FileListPlugin(options) {}

FileListPlugin.prototype.apply = function(compiler) {
    compiler.plugin('emit', function(compilation, callback) {
        // 在生成文件中，创建一个头部字符串：
        /*var filelist = 'In this build:\n\n';

        console.log(222,compilation.assets)
        // 遍历所有编译过的资源文件，
        // 对于每个文件名称，都添加一行内容。
        for (var filename in compilation.assets) {
            filelist += ('- '+ filename +'\n');
        }*/
        var filelist = `:root{
            --primaryColor:red
        }`

        // 将这个列表作为一个新的文件资源，插入到 webpack 构建中：
        compilation.assets['css/theme.css'] = {
            source: function() {
                return filelist;
            },
            size: function() {
                return filelist.length;
            }
        };


        callback();
    });
    compiler.hooks.compilation.tap('FileListPlugin',(compilation,callback) =>{
        HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync('FileListPlugin',(htmlPluginData,callback) =>{
            // 读取并修改 script 上 src 列表
            let result = `
                <link rel="stylesheet" href="css/theme.css">
            `;
            console.log(htmlPluginData.html)
            /*let resultHTML = htmlPluginData.html.replace(
                "<!--themeColor.css-->", result
            );*/
            // 返回修改后的结果
            htmlPluginData.html+=result
           // console.log(resultHTML)
            callback(null,htmlPluginData)
        });

    })
};


module.exports = FileListPlugin;