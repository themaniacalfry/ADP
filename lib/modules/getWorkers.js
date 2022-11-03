"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getWorkers = void 0;
var adp = _interopRequireWildcard(require("../lib/adp"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
const getWorkers = async (params, context) => {
  // Data contains the client_id, client_secret, cert, and key.
  const data = context.settings.app;

  // Obtains an API Token.
  const auth = await adp.auth(data);
  if (!auth) throw new Error('Registration certificates are required.');

  // API call to ADP to get the first page of the works. This is use to calculate how many additional API calls are needed.
  const res = await adp.getWorkers(auth, data, null);

  // Creates an Array based on the total amount of pages from the first request.
  const pages = [...Array(Math.ceil(res.meta.totalNumber / 100)).keys()];

  // For each page in the pages array, an additional getWorkers request is made as a promise to obtain all results.
  const promises = pages.map(i => {
    return adp.getWorkers(auth, data, 100 * (i + 1));
  });

  // All results are then processes and stored as allResponses.
  const allRespones = await Promise.all(promises);

  // The workers is a concatination of the first response and the rest of the promised workers responses. 
  const workers = [].concat(res.workers, allRespones.map(o => o.workers).flat());

  // A userMap is created to store all workers objects with a referenceable ID using their ADP ID.
  const userMap = {};

  // Iterates through each worker in the workers array.
  for (const worker of workers) {
    // If the worker is not null.
    if (worker) {
      // If the worker contains an email address.
      if (worker.businessCommunication.emails) {
        // Sets the worker object with the ADP ID as the key.
        userMap[worker.workerID.idValue] = worker.businessCommunication.emails[0].emailUri;
      }
    }
  }

  // Filters out all null values.
  const result = workers.filter(i => {
    return i != null;
  }).map(worker => {
    // If the user has a manager that they report to, exchange the ADP ID for an email address.
    if (worker.workAssignments && worker.workAssignments[0] && worker.workAssignments[0].reportsTo && worker.workAssignments[0].reportsTo[0]) {
      worker.workAssignments[0].reportsTo[0].workerID.emailUri = userMap[worker.workAssignments[0].reportsTo[0].workerID.idValue];
    }
    return worker;
  });

  // Sets the result for Bridge to use in the workflow.
  return {
    result
  };
};
exports.getWorkers = getWorkers;