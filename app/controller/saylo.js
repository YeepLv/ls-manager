const { Controller } = require('egg');

class SayloController extends Controller {
    async getLabelAmount() {
        const { ctx } = this;
        const data = await ctx.service.saylo.getLabelAmount(ctx.query)
        ctx.response.body = {
            code: 20000,
            data
        }
    }
    async getLabelDetails() {
        const { ctx } = this;
        const data = await ctx.service.saylo.getLabelDetails()
        ctx.response.body = {
            code: 20000,
            data
        }
    }
    async getProjectQI() {
        const { ctx } = this;
        const data = await ctx.service.saylo.getProjectQI()
        ctx.response.body = {
            code: 20000,
            data
        }
    }
}

module.exports = SayloController;
