"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = void 0;
var _extensionHandler = require("@smartsheet-bridge/extension-handler");
var _getWorkers = require("./modules/getWorkers");
const main = (0, _extensionHandler.createBridgeHandler)({
  modules: {
    getWorkers: _getWorkers.getWorkers
  }
});
exports.main = main;