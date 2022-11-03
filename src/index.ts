import { createBridgeHandler } from '@smartsheet-bridge/extension-handler';
import { getWorkers } from './modules/getWorkers';

export const main = createBridgeHandler({
  modules: {
    getWorkers
  }
});
