// The chunkArray function splits any array into small arrays of 500 chunks.
// This is to allow all Smartsheet API calls to succeed as there is a limit of 500 rows per request.
const chunkArray = (array) => {
  const arrays = [];

  let i,
      j,
      temparray,
      chunk = 500; // Sets the value to 500 items per array.

  for (i = 0, j = array.length; i < j; i += chunk) {
      temparray = array.slice(i, i + chunk);
      arrays.push(temparray);
  }

  return arrays;
}

const updateUsers = []; // Array of all users that have values that don't match the values on their row.
const addUsers = []; // Array of all users to be added to the Employee List sheet.
const inviteUsers = []; // Array of all users to be invited to the Gexpro Service Smartsheet account.
const removeUsers = []; // Array of all users to be removed from the Gexpro Service Smartsheet account.

const rowMap = new Map(); // A mapped version of the Employee List sheet in a Map format. THe key is the ADP ID and the value is the row record.
const columns = new Map(); // A map of the columns on the Employee List sheet.

// Iterates through the sheets columns and setting them in the column Map.
for (const column of sheet.columns) {
  columns.set(column.title, column.id);
}

// Iterates Converts the sheet in Smartsheet to a Map so that the ADP workers can be compared.
for (const row of sheet.rows) {
  const object = {
    id: row.id,
    userId: row.cells['ADP ID'].value || null,
    jobTitle: row.cells['Job Title'].value || null,
    email: row.cells['Email'].value || null,
    name: row.cells['Employee Name'].value || null,
    reportsTo: row.cells['Reports To'].value || null,
    location: row.cells['Location'].value || null,
    workPhone: row.cells['Work Phone'].value || null,
    seniorityDate: row.cells['Seniority Date'].value || null,
    status: row.cells['Status'].value || null
  }

  rowMap.set(row.cells['ADP ID'].value, object);
}

// Iterates through every ADP worker and categorizes them into Add, Update, or Delete.
for (const worker of workers) {
  // Sets the worker variables.
  const userId = worker.workerID.idValue;
  const name = worker.person.legalName.formattedName;
  const status = worker.workerStatus.statusCode.codeValue;
  
  let jobTitle = null;
  let reportsTo = null;
  let location = null;
  let seniorityDate = null;

  let email = null;
  let workPhone = null;

  // Logic to check if the user has the workAssignment object.
  if (worker.workAssignments && worker.workAssignments.length > 0) {
      jobTitle = worker.workAssignments[0].jobTitle || null;

      if (worker.workAssignments[0].homeWorkLocation && worker.workAssignments[0].homeWorkLocation.address && worker.workAssignments[0].homeWorkLocation.address.cityName) {
          location = worker.workAssignments[0].homeWorkLocation.address.cityName || null;
      }
      
      seniorityDate = worker.workAssignments[0].seniorityDate || null;

      if (reportsTo = worker.workAssignments[0].reportsTo && worker.workAssignments[0].reportsTo.length > 0) {
          reportsTo = worker.workAssignments[0].reportsTo[0].workerID.emailUri || null;
      }
  }
  
  // Logic to check if the user has an email address.
  if (worker.businessCommunication.emails && worker.businessCommunication.emails.length > 0) {
      email = worker.businessCommunication.emails[0].emailUri || null;
  }

  // Logic to check if the user has a work phone number.
  if (worker.businessCommunication.landlines && worker.businessCommunication.landlines.length > 0) {
      workPhone = `+${worker.businessCommunication.landlines[0].countryDialing} ${worker.businessCommunication.landlines[0].formattedNumber}` || null;
  }

  // Structuring the Smartsheet API call for the Add and Update users.
  // Uses the columns Map to easily get the columnId based on a name rather than hardcoding columnId values.
  const cells = [
    {
      columnId: columns.get('ADP ID'),
      value: userId
    },
    {
      columnId: columns.get('Job Title'),
      value: jobTitle
    },
    {
      columnId: columns.get('Email'),
      value: email,
      strict: false
    },
    {
      columnId: columns.get('Employee Name'),
      value: name,
      strict: false
    },
    {
      columnId: columns.get('Reports To'),
      value: reportsTo,
      strict: false
    },
    {
      columnId: columns.get('Location'),
      value: location,
      strict: false
    },
    {
      columnId: columns.get('Work Phone'),
      value: workPhone
    },
    {
      columnId: columns.get('Seniority Date'),
      value: seniorityDate
    },
    {
      columnId: columns.get('Status'),
      value: status,
      strict: false
    }
  ]

  // If the ADP user has an equivilant row in Smartsheet and the ADP status is active
  // add user to the Update User, Remove User, or Igonore User list.
  if (email && rowMap.has(userId)) {
    const row = rowMap.get(userId);

    // If the ADP user as a status of anything other than 'Active' but the status in Smartsheet is still 'Active'
    // add user to Update Users and Remove Users list.
    if (status.toLowerCase() != 'active' && row.status.toLowerCase() == 'active') {
      const row = rowMap.get(userId);

      // Allow for final update to Smartsheet.
      updateUsers.push({
        id: row.id,
        cells
      });

      removeUsers.push({
        email,
        rowId: row.id
      });

    // If ANY of the column values are not the same, adds the user to the Update users list.
    } else if (userId != row.userId
      || email.toLowerCase() != row.email.toLowerCase()
      || name != row.name
      || location != row.location
      || reportsTo.toString() != row.reportsTo.toString()
      || jobTitle != row.jobTitle
      || seniorityDate != row.seniorityDate
      || status != row.status
      || workPhone != row.workPhone) {
        updateUsers.push({
          id: row.id,
          cells
      });
    }

  // If ADP user does not exists on the sheet in Smartsheet.
  } else if (!rowMap.has(userId)) {
    // If ADP user has a status of 'Active' but is not found on the sheet in Smartsheet, add the user
    // to the Add users list.
    if (status.toLowerCase() === 'active') {
      addUsers.push({
        toBottom: true,
        cells: cells
      });

      // Add new user to the Invite User list to create their Smartsheet account.
      inviteUsers.push(email);
    }
  }
}

// Creates the result output object combining the Add, Invite, Update, and Remove users lists together.
const result = {
  addUsers,
  inviteUsers,
  updateUsers,
  removeUsers
}

// Chunks the arrays into smaller arrays of 500 records. 
result.addUsers = chunkArray(result.addUsers);
result.updateUsers = chunkArray(result.updateUsers);

// Returns the result to the Advanced Express to be used with other workflows.
result;