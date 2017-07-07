let config = {
    basis: {

    },
    project: {
        version: "0.0.1",
        platform: {
            mode: "web"
        }
    }
};

function setPlatformMode(mode){
    config.project.platform.mode = mode; 
}

module.exports = {
    defaultConfig : config,
    setPlatformMode: setPlatformMode
};