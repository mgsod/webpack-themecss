var c = require('./index');
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    entry:'./entry.js',
    plugins:[

        new HtmlWebpackPlugin({
            title: 'My App',
            template: './index.html', // 源模板文件
            filename: './index.html', // 输出文件【注意：这里的根路径是module.exports.output.path】
        }),
        new c(),
    ]
}