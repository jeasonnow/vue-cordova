const
    pathTo = require("path"),
	shell = require("shelljs"),
    fsn = require("fs"),    
    fs = require("fs-extra");


let kit = {};

kit.log = log;
kit.pushFolderToAnother = pushFolderToAnother;
kit.getCliArgs = getCliArgs();

/**
 * 针对node增强的console
 * @param {*} onf
 * @param {any} onf.msg 需要输出的对象或者字符串或者布尔值
 * @param {string} onf.prefix console之前的前缀，默认为'-----'
 * 
 * 提供扩展方法changeHash改变针对不同type的msg而返回的字符串 
 */
function log(onf){
    let msgToStringHash = {
        "string": function(msg){
            return msg;
        },
        "object": function(msg){
            return JSON.stringify(msg);
        },
        "boolean": function(msg){
            return msg ? "true" : "false";
        }
    };

    onf.prefix = onf.prefix || "-----";

    console.log(`${onf.prefix} ${msgToStringHash[typeof onf.msg](onf.msg)}`);
    
}

log.prototype = {
    changeHash: function(type, callback){
        "function" === typeof callback && (this.msgToStringHash[type] = callback)
    }
}

/**
 * 输出源文件目录下的所有文件结构至对应文件目录
 * 默认工作为：输出构建出的文件目录至cordova文件夹下，以求可以正确build出android文件
 * @param {*} sourceFolder 源文件目录
 * @param {*} targetFolder 目标文件目录
 */   
function pushFolderToAnother(sourceFolder, targetFolder){
    sourceFolder = sourceFolder || "../dist";
    targetFolder = targetFolder || "../build_class_card/app/www";

    const directory = sourceFolder;

    kit.log({msg: `资源文件夹为：${directory},输出目录为：${pathTo.normalize(targetFolder)}`});

    return new Promise((resolve, reject) => {
        fs
        .copy(directory, targetFolder, (err) => {
            if(err){
                kit.log({msg: "移动失败"});
            }else{
                kit.log({msg: "输出到指定目录完成"});
                resolve();
            }
        });    
    })  
    
    

    // fs
    //     .readdirSync(directory)
    //     .forEach((file) => {
    //         const 
    //             fullpath = pathTo.join(directory, file),
    //             stat = fs.statSync(fullpath),
    //             extname = pathTo.extname(fullpath);

    //         if(stat.isFile()){
    //             let entryFile = pathTo.join(directory, `${pathTo.basename(file, extname)}${extname}`);

    //             kit.log({msg: `需要移动文件${entryFile}至${targetFolder}`});
    //             fs.outputFileSync(pathTo.join(targetFolder), fs.readFileSync(entryFile));

    //             // fs.move(entryFile, pathTo.join(__dirname ,targetFolder, entryFile));
    //         }else if(stat.isDirectory()){
    //             let subdir = pathTo.join(directory, file);
    //             pushFolderToAnother(subdir, targetFolder);
    //         }   
    //     })
    
}

function _isFile(path){  
    return _exists(path) && fs.statSync(path).isFile();  
}  

function _isDir(path){  
    return _exists(path) && fs.statSync(path).isDirectory();  
}  

function _exists(path){  
     return fs.existsSync(path) || fs.existsSync(path);  
}  


/**
 * 获取命令行参数
 */
function getCliArgs(){
    const
        minimist = require("minimist");

    let cliArgs;
    return (isFore) => {
		if(!cliArgs && !isFore){
            var argv;
            try {
                argv = JSON.parse(process.env.npm_config_argv).original;
            }	catch(ex) {
                argv = process.argv;
            };
			cliArgs = cliArgs || minimist(argv, {
					default: {}
				})
			;
		}
		return cliArgs;
	};
}


module.exports = kit;