const Status = require('@converseai/plugins-sdk').Status;
const ModuleResponse = require('@converseai/plugins-sdk').Payloads.Module.ModuleResponse;

const handleError = (app, err) => {
    console.error(`Module failed : ${err.message || JSON.stringify(err)}`);

    const response = new ModuleResponse();

    response.setError({
      httpStatus: 400,
      code: 'FUNCTION_FAILED',
      description: `${err.message || JSON.stringify(err)}`,
    });
    
    app.send(Status.FAIL, response);
}

module.exports = {
    handleError
}