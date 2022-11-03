import { ModuleFunction } from '@smartsheet-bridge/extension-handler';
import { Settings } from '../settings';
import * as adp from '../lib/adp';

export const getWorkers: ModuleFunction<{}, Settings> = async (params, context) => {
  // Data contains the client_id, client_secret, cert, and key.
  const data = context.settings.app;

  // Obtains an API Token.
  const auth = await adp.auth(data);

  if (!auth) throw new Error('Registration certificates are required.')

  // API call to ADP to get the first page of the works. This is use to calculate how many additional API calls are needed.
  const res = await adp.getWorkers(auth, data, null);

  // Creates an Array based on the total amount of pages from the first request.
  const pages = [...Array(Math.ceil(res.meta.totalNumber / 100)).keys()];

  // For each page in the pages array, an additional getWorkers request is made as a promise to obtain all results.
  const promises = pages.map(i => {
    return adp.getWorkers(auth, data, 100 * (i + 1))
  });

  // All results are then processes and stored as allResponses.
  const allRespones: any = await Promise.all(promises);

  // The workers is a concatination of the first response and the rest of the promised workers responses. 
  const workers: any[] = [].concat(res.workers, allRespones.map((o: any) => o.workers).flat());

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
  const result: any[] = workers.filter(i => {
    return i != null;
  }).map(worker => {
    // If the user has a manager that they report to, exchange the ADP ID for an email address.
    if (worker.workAssignments && worker.workAssignments[0] && worker.workAssignments[0].reportsTo && worker.workAssignments[0].reportsTo[0]) {
      worker.workAssignments[0].reportsTo[0].workerID.emailUri = userMap[worker.workAssignments[0].reportsTo[0].workerID.idValue];
    }

    return worker;
  });

  // Sets the result for Bridge to use in the workflow.
  return { result };
};
