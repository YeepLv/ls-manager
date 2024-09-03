class AppBootHook {
    constructor(app) {
        this.app = app;
    }

    async beforeStart() {

        console.log('11111111111')
    }

    async didReady() {
        const dbDir = 'C:/Users/yeep/AppData/Local/label-studio/label-studio'
        const sqlite3 = require('sqlite3').verbose();
        const db = new sqlite3.Database(dbDir + '/label_studio.sqlite3');
        this.app.db = db;
    }
}

module.exports = AppBootHook;