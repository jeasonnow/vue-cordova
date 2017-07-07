const 
    setup = require("./setup.js");

setup
    .initAppEnv()
    .then(() => {
        return setup.installAppPlugins();
    })