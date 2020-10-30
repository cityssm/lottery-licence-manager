import * as assert from "assert";

import * as http from "http";
import * as app from "../app";

import { getLicences } from "../helpers/licencesDB/getLicences";
import { getAllUsers } from "../helpers/usersDB/getAllUsers";

import { fakeViewOnlySession } from "./_globals";


describe("lottery-licence-manager", () => {

  const httpServer = http.createServer(app);
  const portNumber = 54333;


  let serverStarted = false;

  before(() => {

    httpServer.listen(portNumber);

    httpServer.on("listening", () => {
      serverStarted = true;
      httpServer.close();
    });
  });

  it("Ensure server starts on port " + portNumber.toString(), () => {
    assert.ok(serverStarted);
  });

  it("Ensure licences.db exists", () => {
    assert.ok(getLicences({}, fakeViewOnlySession, { includeOrganization: false, limit: 1, offset: 0 }));
  });

  it("Ensure users.db exists", () => {
    assert.ok(getAllUsers());
  });
});
