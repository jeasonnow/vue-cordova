module.exports = {
    build: {
        dest: "smart_class_card/app/www",
        version: "0.0.1",
        alias: "class_card",
        build: "smart_class_card",
        appName: "智慧班牌",
        description: "created by lantu™",
        email: "",
        copyright: "成都兰途网络科技有限公司"
    },
    cordova: {
        packageName: "com.lantunet.classCard",
        preference : {
            Orientation: "user"
        }
    },
    keyStore: {
        keystoreDir: `misc/cordova/keystore`,
	    keypass    : "lantu35791",
	    storepass  : "lantu35791",
	    alias      : "mobilecampus",
	    developer  : {
		    fullName      : "lantunet.com",
	    	groupUnitName : "lantunet",
		    groupGroupName: "lantunet",
		    locationCity  : "Chengdu",
		    locationArea  : "Chengdu",
		    country       : "CN"
	    }
    }
}