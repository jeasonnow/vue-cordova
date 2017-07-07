const 
    shell = require("shelljs"),
	PLATFORM_VERSION = {
		android: "5.2.2"
	},
    path = require("path"),
    buildKit = require("./kit.js"),
    config = require("./config.js"),
    kit = require("../kit.js");
;

/**
 * 初始化cordova环境
 * @param {*} onf 
 */
function initAppEnv(onf){
    let initAppByCordova = new Promise((resolve, reject) => {
        const 
            cordovaPath = buildKit.getCordovaPath();

        let 
            cliArgs = kit.getCliArgs(),
            cordovaInitString,
            initPlatformInCordova = `cordova platform add android@${PLATFORM_VERSION.android}`    
        ;

        onf = onf || {};

        if(!shell.which("cordova")){
            kit.log({msg: "未发现cordova命令，请确认是否安装了cordova"});
            kit.log({msg: "若未安装cordova,请尝试使用npm install cordova -g或者cnpm install cordova -g"});
            shell.exit(1);
        }

        kit.log({msg: `cordova项目目录为：${cordovaPath}`});

        if(shell.test("-d", cordovaPath) && !cliArgs.force){
			kit.log({msg: `检测到已存在该 Cordova 项目目录: ${cordovaPath}`});
			kit.log({msg: `### 请仔细确认! ###`});
			kit.log({msg: `若需强制执行, 请添加参数: "--force"`});
			shell.exit(1);
		}

        shell.rm("-rf", cordovaPath);
		shell.mkdir("-p", cordovaPath);

        cordovaInitString = `cordova create ${cordovaPath} ${config.cordova.packageName} MobileCampus_${config.build.alias}`;

		kit.log({msg: `开始初始化cordova项目目录.....`});

		if(0 !== shell.exec(cordovaInitString).code){
			kit.log({msg: `初始化项目失败！请重试`});
			shell.exit(1);
		}

		if(!buildKit.isCordovaDir()){
			shell.cd(cordovaPath);
		}

        kit.log({msg: `开始初始化安卓平台.....`});

        if(shell.exec(initPlatformInCordova).code !== 0){
            kit.log({msg: `"Error: 初始化android平台失败!"`});
            shell.exit(1);
        }

        setTimeout(() => {
            afterInitAndroidPlatform()
                .then(resolve, reject);
        }, 1000)
    });

    return initAppByCordova;
}

function afterInitAndroidPlatform(){
    
    const
		path = require("path"),
		del = require("del")
	;

	return new Promise((resolve, reject) =>{

		const
			cordovaPath = buildKit.getCordovaPath()
		;

		// 生成 keyStore
		generateKeyStore(distSigning);
		
		// 简单暴力: 清除不必要 图标/启动页
		del(path.normalize(cordovaPath + "/platforms/android/res/drawable-**/icon.png"));
		del(path.normalize(cordovaPath + "/platforms/android/res/drawable-**/screen.png"));
		del(path.normalize(cordovaPath + "/platforms/android/res/drawable-**/splash.png"));

		resolve();

	});
}

/**
 * 安装 Cordova 插件
 * @param cb
 */
function installAppPlugins(cb){

	const
		arrPluginsInfo = require("../../misc/cordova/plugin.json")
	;

	let
		bashArgs = kit.getCliArgs(),
		arrPluginsList = arrPluginsInfo
	;

    arrPluginsInfo.forEach((item) => kit.log({msg: `目前需要安装的插件列表为：${item.path}`}));

	if(!buildKit.isCordovaDir()){
		shell.cd(buildKit.getCordovaPath());
	}

	if(0 !== shell.exec("cordova info", {silent: true}).code){
		kit.log({msg: `没有找到此 Alias: [${config.build.alias}] Cordova 项目`});
		shell.exit(1);
	}

	arrPluginsList.forEach((pluginItem) => {

		pluginItem.path = pluginItem.path.match(/https?:\//) ?
			pluginItem.path :
			path.normalize(pluginItem.path)
		;
        
        if(pluginItem.variables){
            let tempVariable = pluginItem.variables.map((item) => {
                return `--variable ${item}`;
            }).join(" ");
            pluginItem.path = `${pluginItem.path} ${tempVariable}`;      
        }

        // @todo 增加预配置

		let cmd = `cordova plugin add ${pluginItem.path}`;
        
		kit.log({msg: cmd});
		if(0 !== shell.exec(cmd).code){
			kit.log({msg: `Error: cordova plugin add ${pluginItem.path} failed. Maybe you haven't
				download library repertory and put it in the same directory as MC.Super,
				please git clone from 'https://git.oschina.net/lantu/MC.Lib'.Warning! The directory only be called MC.Lib!`});
			shell.exit(1);
		}
	});

	"function" === typeof cb && cb();
}

/**
 * 执行Keystore生成
 * @param {function} cb 生成keystore之后的回调方法
 */
function generateKeyStore(cb){
    let
		keyStoreInfo,
		developerInfo,
		_keystorePath,
		_dname
	;

	kit.log({msg: "执行 keystore 生成 ... "});

	keyStoreInfo = config.keyStore;

	developerInfo = keyStoreInfo.developer;

	_dname =
		"CN=" + developerInfo.fullName + ", " +
		"OU=" + developerInfo.groupUnitName + ", " +
		"O=" + developerInfo.groupGroupName + ", " +
		"L=" + developerInfo.locationCity + ", " +
		"ST=" + developerInfo.locationArea + ", " +
		"C=" + developerInfo.country
	;

	_keystorePath = path.join(__dirname, "../../", keyStoreInfo.keystoreDir) + `/${config.build.alias}.keystore`;

	shell.exec(
		"keytool -genkey -noprompt \
		-keystore " + _keystorePath + " \
			-dname \"" + _dname + "\" \
			-alias " + keyStoreInfo.alias + " \
			-keyalg RSA \
			-keysize 2048 \
			-validity 7300 \
			-keypass " + keyStoreInfo.keypass + " \
			-storepass " + keyStoreInfo.storepass
	);

	kit.log({msg: "执行 keystore_生成_ 完毕! "});

	"function" === typeof cb && cb();
}

/**
 * 输出 release-signing.properties
 * @Todo
 */
function distSigning(){

	let
		releaseString = "",
        androidPath = "platforms/android/"
	;

    if(!buildKit.isCordovaDir()){
		shell.cd(buildKit.getCordovaPath());
	}

	releaseString +=
		`key.store=../../../../misc/cordova/keystore/${config.build.alias}.keystore\nkey.alias=mobilecampus\nkey.store.password=lantu35791\nkey.alias.password=lantu35791\n`;

    _distNewFileToFolder("release-signing.properties", releaseString, androidPath);

}

/**
 *  在指定文件夹下写入文件，写入支持方式可参考fs.writeFile
 * @param fileName 文件名
 * @param fileString 文件字符 或者流
 * @param folder 输出文件夹
 */
function _distNewFileToFolder(fileName, fileString, folder) {
	const
		fs = require("fs"),
        fse = require("fs-extra");

    if(!buildKit.isCordovaDir()){
		shell.cd(buildKit.getCordovaPath());
	}
    

	fs.writeFile(fileName, fileString, (err) => {
		if(!err){
            kit.log({msg: `生成${fileName}成功！等待移动至项目文件夹下`});

            let readStream = fs.createReadStream(fileName),
                createStream = fs.createWriteStream(`${folder}/${fileName}`);

            readStream.pipe(createStream);

            readStream.on("end", () => {
                shell.rm("-rf", fileName);
                kit.log({msg: `已将${fileName}移至${folder}下`});
                });
		}else{
			throw (err);
		}
	});
}

let setup = {
    distNewFileToFolder: _distNewFileToFolder,
    generateKeyStore   : generateKeyStore,
    installAppPlugins  : installAppPlugins,
    initAppEnv         : initAppEnv
};

module.exports = setup;