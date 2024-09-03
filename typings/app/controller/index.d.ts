// This file is created by egg-ts-helper@2.1.0
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportHome = require('../../../app/controller/home');
import ExportSaylo = require('../../../app/controller/saylo');

declare module 'egg' {
  interface IController {
    home: ExportHome;
    saylo: ExportSaylo;
  }
}
