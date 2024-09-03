const { Controller } = require('egg');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }
  async getUser() {
    const { ctx } = this;
    await ctx.service.user.userList();
  }
  async login() {
    const { ctx } = this;
    ctx.response.body = {
      code: 20000,
      data: 'admin-token'
    }
  }
  async getUserInfo() {
    const { ctx } = this;
    ctx.response.body = {
      code: 20000,
      data: {
        roles: ['admin'],
        introduction: 'I am a super administrator',
        avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        name: 'Super Admin'
      },
    }
  }
  async getScoreException() {
    const { ctx } = this;
    await ctx.service.saylo.scoreException();
  }
}

module.exports = HomeController;
