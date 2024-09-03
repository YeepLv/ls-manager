const Service = require('egg').Service;

/*
* 用户表 hts_user
*/


class UserService extends Service {
    // 获取用户数据
    async userList() {
        const db = this.app.db;
        const userList = await new Promise((resolve, reject) => {
            db.all('select * from htx_user', [], (err, rows) => {
                resolve(rows);
            });
        });
    }

    // 登录
    async login() {
        
    }
}

module.exports = UserService;