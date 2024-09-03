/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.post('/user/login', controller.home.login);
  router.get('/user/info', controller.home.getUserInfo);
  router.get('/user', controller.home.getUser);
  router.get('/saylo/getLabelAmount', controller.saylo.getLabelAmount);
  router.get('/saylo/getLabelDetails', controller.saylo.getLabelDetails);
  router.get('/saylo/getProjectQI', controller.saylo.getProjectQI);
};
