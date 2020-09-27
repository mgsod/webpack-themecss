const crypto = require('crypto');
const fs = require('fs');


class InjectVariableCss {
    /**
     * option 包含 fileName:String,themes:Object,isProduction:Boolean
     * @param options
     */
    constructor(options) {
        this.options = options;
        // 初始化文件名称(包含路径)
        this.fileName = options.fileName || 'css/theme-root-variable.[contenthash:8].css';
        this.cssContent = this.getCssText();
    }

    /**
     * 获取绑定函数
     * @param compiler webpack compiler对象
     * @param event 事件
     * @param tap tap类型(tapAsync:同步,tap:异步)
     * @return {*}
     */
    getBinder(compiler, event, tap = 'tapAsync') {
        return compiler.hooks
            ? compiler.hooks[event][tap].bind(compiler.hooks[event], 'InjectVariableCss')
            : compiler.plugin.bind(compiler, event)
    }

    /**
     * 根据内容变化生成不同hash值的文件名
     * @param compilation
     */
    getHashPath(compilation) {
        let contentHash = crypto.createHash('md4')
            .update(this.cssContent)
            .digest('hex');
        return compilation.getPath(this.fileName, {contentHash})
    }

    /**
     * webpack插件应用时调用的函数
     * @param compiler webpack compiler对象
     */
    apply(compiler) {

        // webpack编译阶段的事件函数
        let compilationBinder = this.getBinder(compiler, 'compilation', 'tap');
        compilationBinder(compilation => {
            // 在htmlWebpackPlugin处理html之前
            compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tap(
                'htmlWebpackPluginBeforeHtmlProcessing',
                (data, cb) => {
                    // 在静态资源assets的css列表中加入之前处理好的文件
                    data.assets.css.push(`/${this.getHashPath(compilation)}`)
                })
        })


        // 获取 emit 事件时的钩子函数
        let emitBinder = this.getBinder(compiler, 'emit');
        emitBinder((compilation, callback) => {
            // 获取文件名
            let outputName = this.getHashPath(compilation);
            // 非生产环境才生产临时css文件
            if (!this.options.isProduction) {
                let tip = `/*此文件由webpack自动生成,仅作为在开发阶段使用css变量时方便IDE检索和输入提示使用*/\n`
                fs.writeFile(`${__dirname}/themeVariable.css`, tip + this.cssContent, (e) => {
                    if (!e) {
                    } else {
                        console.log(e)
                    }
                })
            }

            // 将这个列表作为一个新的文件资源，插入到 webpack 构建中：
            compilation.assets[outputName] = {
                source: () => {
                    return this.cssContent
                },
                size: () => {
                    return this.cssContent.length
                }
            };
            callback()

        });


    }


    getCssText() {
        let themes = this.options.themes
        let cssText = ''
        for (let key in themes) {
            let theme = themes[key];
            let themeCssText = `:root[theme=${theme.id}]`;
            let colors = theme.colors;
            let colorsKey = Object.keys(colors);
            let colorsText = colorsKey.map(color => {
                return `--${color}:${colors[color]};`
            });
            themeCssText += `{${colorsText.join('')}}`
            cssText += `${themeCssText}\n`
        }
        return cssText
    }
}

module.exports = InjectVariableCss;