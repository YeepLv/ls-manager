const Service = require('egg').Service;
const moment = require('moment');

/*
* 用户表 hts_user
*/

function countOccurrences(arr, map) {  
    let counts = {};  
    for (let i = 0; i < arr.length; i++) {  
        let item = arr[i];  
        if (counts[item]) {  
            counts[item]++;  
        } else {  
            counts[item] = 1;  
        }  
    }
    const result = []
    Object.keys(counts).forEach(key => {
        result.push({
            name: map[key],
            count: counts[key]
        })
    })
    return result;  
} 

class SayloService extends Service {
    // 获取用户数据
    async userList() {
        const db = this.app.db;
        const userList = await new Promise((resolve, reject) => {
            db.all('select * from htx_user', [], (err, rows) => {
                resolve(rows);
            });
        });
    }

    // 获取包含9分和3分的数据
    async scoreException() {
        const db = this.app.db;
        const project_list = await new Promise((resolve, reject) => {
            db.all('select * from project', [], (err, rows) => {
                resolve(rows);
            });
        });
        const id_array = [];
        project_list.forEach(proj => {
            if (proj.title.includes('Saylo')) {
                id_array.push(proj.id);
            }
        });
        if (id_array.length > 0) {
            let id_string = id_array.join(',');
            id_string = '(' + id_string + ')';
            const data = await new Promise((resolve, reject) => {
                db.all('select * from task_completion where project_id in ' + id_string, [], (err, rows) => {
                    resolve(rows);
                });
            });
            data.forEach(da => {
                const result = da.result;
            })
        }
        console.log('1111')
    }

    // 获取统计数据
    async getLabelAmount(params) {
        const db = this.app.db;
        const start = new Date(params.start);
        const end = new Date(params.end);
        const date = new Date(params.start);
        const dates_dataset = {};
        while (date <= end) {
            dates_dataset[date.toISOString().split('T')[0]] = 0
            date.setDate(date.getDate() + 1);
        }
        for (const d in dates_dataset) {
            const start_time = new Date(d)
            start_time.setHours(0, 0, 0, 0);
            start_time.setHours(start_time.getHours() - 8);
            const end_time = new Date(d);
            end_time.setHours(23, 59, 59 ,999)
            end_time.setHours(end_time.getHours() - 8);
            const sql1 = 'select count(*) as count from task_completion where created_at between \'' + moment(start_time).format('YYYY-MM-DD HH:mm:ss') + '\'' + 'and' + '\'' + moment(end_time).format('YYYY-MM-DD HH:mm:ss') + '\'';
            const sql2 = 'select completed_by_id,updated_by_id from task_completion where updated_at between \'' + moment(start_time).format('YYYY-MM-DD HH:mm:ss') + '\'' + 'and' + '\'' + moment(end_time).format('YYYY-MM-DD HH:mm:ss') + '\'';
            const labelCount = await new Promise((resolve, reject) => {
                db.get(sql1, [], (err, rows) => {
                    resolve(rows);
                });
            });
            const results = await new Promise((resolve, reject) => {
                db.all(sql2, [], (err, rows) => {
                    resolve(rows);
                });
            });
            let qi_count = 0
            results.forEach(res => {
                if (res['completed_by_id'] !== res['updated_by_id']) {
                    qi_count ++;
                }
            })
            dates_dataset[d] = {
                qi_count,
                label_count: labelCount.count
            }
        }
        return dates_dataset;
    }

    // 导出每日每人完成详情
    async getLabelDetails() {
        const db = this.app.db;
        const endTime = new Date()
        endTime.setHours(19, 0, 0, 0)
        const startTime = new Date()
        startTime.setTime(endTime.getTime() - 3600 * 1000 * 24)
        endTime.setHours(endTime.getHours() - 8);
        startTime.setHours(startTime.getHours() - 8);
        const sql1 = 'select completed_by_id,updated_by_id,project_id from task_completion where created_at between \'' + moment(startTime).format('YYYY-MM-DD HH:mm:ss') + '\'' + 'and' + '\'' + moment(endTime).format('YYYY-MM-DD HH:mm:ss') + '\'';
        const sql2 = 'select completed_by_id,updated_by_id,project_id from task_completion where updated_at between \'' + moment(startTime).format('YYYY-MM-DD HH:mm:ss') + '\'' + 'and' + '\'' + moment(endTime).format('YYYY-MM-DD HH:mm:ss') + '\'';
        const sql3 = 'select id,title from project';
        const sql4 = 'select id,username,first_name,phone from htx_user';
        // project id-name映射关系
        const projectNameMap = {}
        const projResult = await new Promise((resolve, reject) => {
            db.all(sql3, [], (err, rows) => {
                resolve(rows);
            });
        });
        projResult.forEach(item => {
            projectNameMap[item.id] = item.title;
        })
        // user id-name映射关系
        const userNameMap = {}
        const userResult = await new Promise((resolve, reject) => {
            db.all(sql4, [], (err, rows) => {
                resolve(rows);
            });
        });
        userResult.forEach(item => {
            userNameMap[item.id] = {
                name: item.first_name ? item.first_name : item.username,
                type: item.phone
            }
        })
        const details = {
            inLabel: [],
            inQi: [],
            outLabel: [],
            outQi: []
        }
        const peopleWork = {};
        // 今日的标注数据
        const labelResults = await new Promise((resolve, reject) => {
            db.all(sql1, [], (err, rows) => {
                resolve(rows);
            });
        });
        for (let i = 0;i < labelResults.length; i++) {
            const item = labelResults[i]
            // 判断标注
            if (peopleWork.hasOwnProperty(item['completed_by_id'])) {
                peopleWork[item['completed_by_id']].labelProjects.push(item.project_id);
                peopleWork[item['completed_by_id']].labelTotalCount += 1;
            } else {
                peopleWork[item['completed_by_id']] = {
                    labelProjects: [],
                    qiProjects: [],
                    labelTotalCount: 0,
                    qiTotalCount: 0,
                    userName: '',
                    type: ''
                };
                peopleWork[item['completed_by_id']].labelProjects.push(item.project_id);
                peopleWork[item['completed_by_id']].labelTotalCount += 1;
                peopleWork[item['completed_by_id']].userName = userNameMap[item['completed_by_id']].name
                peopleWork[item['completed_by_id']].type = userNameMap[item['completed_by_id']].type
            }
        }
        // 今日的质检数据
        const qiResults = await new Promise((resolve, reject) => {
            db.all(sql2, [], (err, rows) => {
                resolve(rows);
            });
        });
        for (let i = 0;i < qiResults.length; i++) {
            const item = qiResults[i]
            // 判断质检
            if (item['completed_by_id'] !== item['updated_by_id']) {
                if (peopleWork.hasOwnProperty(item['updated_by_id'])) {
                    peopleWork[item['updated_by_id']].qiProjects.push(item.project_id);
                    peopleWork[item['updated_by_id']].qiTotalCount += 1;
                } else {
                    peopleWork[item['updated_by_id']] = {
                        labelProjects: [],
                        qiProjects: [],
                        labelTotalCount: 0,
                        qiTotalCount: 0,
                        userName: '',
                        type: ''
                    };
                    peopleWork[item['updated_by_id']].qiProjects.push(item.project_id);
                    peopleWork[item['updated_by_id']].qiTotalCount += 1;
                    peopleWork[item['updated_by_id']].userName = userNameMap[item['updated_by_id']].name
                    peopleWork[item['updated_by_id']].type = userNameMap[item['updated_by_id']].type
                }
            }
        }
        Object.values(peopleWork).forEach(value => {
            const obj = {}
            if (value.type === 'in') {
                if (value.labelProjects.length > 0) {
                    obj.labelProjects = countOccurrences(value.labelProjects, projectNameMap);
                    obj.labelTotalCount = value.labelTotalCount;
                    obj.userName = value.userName;
                    details.inLabel.push(obj);
                }
                if (value.qiProjects.length > 0) {
                    obj.qiProjects = countOccurrences(value.qiProjects, projectNameMap);
                    obj.qiTotalCount = value.qiTotalCount;
                    obj.userName = value.userName;
                    details.inQi.push(obj);
                }
            } else if (value.type === 'out') {
                if (value.labelProjects.length > 0) {
                    obj.labelProjects = countOccurrences(value.labelProjects, projectNameMap);
                    obj.labelTotalCount = value.labelTotalCount;
                    obj.userName = value.userName;
                    details.outLabel.push(obj);
                }
                if (value.qiProjects.length > 0) {
                    obj.qiProjects = countOccurrences(value.qiProjects, projectNameMap);
                    obj.qiTotalCount = value.qiTotalCount;
                    obj.userName = value.userName;
                    details.outQi.push(obj);
                }
            }
        })
        return details;
    }

    // project的质检情况
    async getProjectQI(params) {
        const db = this.app.db;
        const limit = 10;
        const offset = 0;
        const sql1 = `select id,title from project order by id limit ${ limit } offset ${ offset }`;
        const projIds = await new Promise((resolve, reject) => {
            db.all(sql1, [], (err, rows) => {
                resolve(rows);
            });
        });
        const id_arr = []
        const projMap = {}
        projIds.forEach(item => {
            id_arr.push(item.id)
            projMap[item.id] = {
                title: item.title
            }
        })
        // 各project中的task总数
        const sql2 = `select project_id,count(*) as count from task where project_id in (${id_arr.join(',')}) group by project_id`;
        const projTaskCount = await new Promise((resolve, reject) => {
            db.all(sql2, [], (err, rows) => {
                resolve(rows);
            });
        });
        projTaskCount.forEach(item => {
            projMap[item.project_id].taskCount = item.count
        })
        // 各project中的标注task总数
        const sql3 = `select project_id,count(*) as count from task_completion where project_id in (${id_arr.join(',')}) group by project_id`;
        const projLabelTaskCount = await new Promise((resolve, reject) => {
            db.all(sql3, [], (err, rows) => {
                resolve(rows);
            });
        });
        projLabelTaskCount.forEach(item => {
            projMap[item.project_id].labelTaskCount = item.count
        })
        // 各project中的质检task总数
        const sql4 = `select project_id,count(*) as count from task_completion where project_id in (${id_arr.join(',')}) and completed_by_id != updated_by_id group by project_id`;
        const projQITaskCount = await new Promise((resolve, reject) => {
            db.all(sql4, [], (err, rows) => {
                resolve(rows);
            });
        });
        projQITaskCount.forEach(item => {
            projMap[item.project_id].QITaskCount = item.count
            projMap[item.project_id].unQITaskCount = projMap[item.project_id].labelTaskCount - item.count
        })
        const result = []
        Object.keys(projMap).forEach(key => {
            result.push({
                id: key,
                title: projMap[key].title,
                taskCount: projMap[key].taskCount,
                labelTaskCount: projMap[key].labelTaskCount,
                QITaskCount: projMap[key].QITaskCount,
                unQITaskCount: projMap[key].unQITaskCount
            })
        })
        return result;
    }
}

module.exports = SayloService;