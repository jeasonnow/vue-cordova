const
    config = require("./config.js"),
    shell = require("shelljs"),
    pathTo = require("path");

function getCordovaPath(){
	return `${config.build["build"]}/app`;
}

function getAllCordovaWorkPath() {
    var baseDir = shell.pwd(),
        cmaDirReg = /^build_\w*$/;

    // 过滤有效学校
    var camDirName  = shell.ls().filter(function (item) {
        return cmaDirReg.test(item) && fs.existsSync(path.resolve(baseDir, item, "app", "plugins"));
    });

    return camDirName;
}

/**
 * 检测当前是否在 Cordova 目录
 * @returns {boolean}
 */
function isCordovaDir(){
	const
		path = require("path"),
		currentPath = shell.pwd()
	;

	let _raw;

	_raw = currentPath.split(pathTo.sep).join("*");

	return -1 !== _raw.lastIndexOf("*" + pathTo.normalize(config.build.build) + "*app");

}

let appKit = {
    isCordovaDir: isCordovaDir,
    getCordovaPath: getCordovaPath
}

module.exports = appKit;