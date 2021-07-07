import type { RequestHandler } from "express";

import { getInactiveOrganizations } from "../../helpers/licencesDB/getInactiveOrganizations.js";


export const handler: RequestHandler = (request, response) => {

  const inactiveYears = Number.parseInt(request.body.inactiveYears, 10);

  response.json(getInactiveOrganizations(inactiveYears));
};


export default handler;
