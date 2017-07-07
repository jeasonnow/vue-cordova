require('./check-versions')()


const platformConfig = require("../config/build.config.js").defaultConfig,
      pp = require("preprocess");
process.env.NODE_ENV = 'production'

var ora = require('ora')
var rm = require('rimraf')
var path = require('path')
var chalk = require('chalk')
var webpack = require('webpack')
var config = require('../config')
var webpackConfig = require('./webpack.prod.conf')


var spinner = ora('building for production...')
spinner.start()

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, function (err, stats) {
    spinner.stop()

    const kit = require("./kit.js");

    let index = "../dist/index.html",
        cliArgs = kit.getCliArgs();

    kit.log({msg: `cliArgs为：${JSON.stringify(cliArgs)}`});

    if(cliArgs.app){
        platformConfig.project.platform.mode = "app";
    }
    
    kit.log({
      prefix: "*****",
      msg: `构建平台为：${platformConfig.project.platform.mode}`
    });
    pp.preprocessFileSync(path.join(__dirname, index), path.join(__dirname, index), platformConfig, {type: "html"});

    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})
