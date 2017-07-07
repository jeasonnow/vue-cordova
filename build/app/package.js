const 
    kit = require("../kit.js"),
    buildKit = require("./kit.js"),
    shell = require("shelljs"),
    path = require("path"),
    fs = require("fs-extra"),
    pp = require("preprocess"),
    project = require("../../config/build.config.js"),
    cordovaPath = buildKit.getCordovaPath();

let index = "../../dist/index.html";

// 重新构建dist文件夹，以更新代码
function rebuildDist(){
    return new Promise((resolve, reject) => {
        kit.log({msg: "正在重新构建dist目录"});
        shell.exec("cnpm run build --app");
        resolve();
    })
}

// 清空默认www文件夹
function clearCodovaWww(){
    return new Promise((resolve, reject) => {
        let appFolder = path.join(__dirname, "..", "..", cordovaPath, "www");
        kit.log({msg: "清空原www目录，并等待文件录入"});
        shell.rm("-rf", appFolder);
        resolve();
    })
}

// 修正cordova资源
function repairCordovaSource(){
    return new Promise((resolve, reject) => {
        let 
            config = require("./config.js"),
            cordovaConfigPath = path.join(__dirname, "..", "..", `${config.build.build}/app/config.xml`);
            cordovaConfig = path.join(__dirname, "..", "..", "misc/cordova/config.xml");
        
        kit.log({msg: "开始替换config.xml文件"});
        pp.preprocessFileSync(cordovaConfig, cordovaConfigPath, config, {type: "xml"});

        resolve();
    })
}

function pushToCordova(){
    let appFolder = path.join(__dirname, "..", "..", cordovaPath, "www");    
    kit.log({msg: "等待移动文件至指定目录中"});
    fs.ensureDirSync(appFolder);
    kit.pushFolderToAnother(path.join(__dirname, "..", "..", "dist"), appFolder)
        .then(() => {
            let cliArg = kit.getCliArgs(),
                config = require("./config.js");

            if(!buildKit.isCordovaDir()){
                shell.cd(cordovaPath);
            }

            if(cliArg.p){
                kit.log({msg: "正在构建产品级app...."})
                shell.exec("cordova build android --release");
                kit.log({msg: `构建完成，构建目录为: ${config.build}/app/platform/android`})
            }else{
                kit.log({msg: "正在构建调试用应用...."})
                shell.exec("cordova build android");
            }

        });
}

rebuildDist()
    .then(() => {return clearCodovaWww()})
    .then(() => {return repairCordovaSource()})
    .then(() => {pushToCordova()});



