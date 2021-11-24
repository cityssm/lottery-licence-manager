[Help Home](readme.md)

# Admin - config.js

The `data/config.js` file is used to customize your application.
On first install, the file does not exist.  You can create one from scratch,
or get started by using the `data/configExample.js` file as a template.
You can also import configuration from another file, like `data/configOntario.js`,
then override the settings you want.

```javascript
export const config = {};

// your configuration

export default config;
```

* * *

## config.application = {};

| Property Name     | Type   | Description                                                 | Default Value              |
| ----------------- | ------ | ----------------------------------------------------------- | -------------------------- |
| `applicationName` | string | Make the application your own by changing the name.         | `"Lottery Licence System"` |
| `logoURL`         | string | The path to a custom logo.  Square-shaped images work best. | `"/images/bingoBalls.png"` |
| `httpPort`        | number | The listening port for HTTP.                                | `3000`                     |
| `https`           | object | The HTTPS configuration.                                    | _(Described below)_        |

### config.application.https = {};

| Property Name | Type   | Description                                | Default Value |
| ------------- | ------ | ------------------------------------------ | ------------- |
| `port`        | number | The listening port for HTTPS.              | `null`        |
| `keyPath`     | string | The path to the key file.                  | `null`        |
| `certPath`    | string | The path to the certificate file.          | `null`        |
| `passphrase`  | string | The secret passphrase for the certificate. | `null`        |

* * *

## config.session = {};

| Property Name  | Type    | Description                                                                        | Default Value                        |
| -------------- | ------- | ---------------------------------------------------------------------------------- | ------------------------------------ |
| `cookieName`   | string  | The name of the session cookie.                                                    | `"lottery-licence-manager-user-sid"` |
| `secret`       | string  | The secret used to sign the session cookie.                                        | `"cityssm/lottery-licence-manager"`  |
| `maxAgeMillis` | number  | The session timeout in milliseconds.                                               | `3600000`                            |
| `doKeepAlive`  | boolean | When `true`, the browser will ping the web application to keep the session active. | `false`                              |

* * *

## config.admin = {};

_Note that this property can be used to activate an admin user,
that can then be used to create a proper admin user in the `users.db`.
**It should not be used on an ongoing basis.**_

| Property Name     | Type   | Description                              | Default Value |
| ----------------- | ------ | ---------------------------------------- | ------------- |
| `defaultPassword` | string | A default password for the _admin_ user. | `null`        |

* * *

## config.user = {};

| Property Name              | Type   | Description                                                                                               | Default Value                                            |
| -------------------------- | ------ | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `createUpdateWindowMillis` | number | The amount of time a _create only_ user can update a record before it is restricted to full update users. | `3600000`                                                |
| `defaultProperties`        | object | The default properties for a new user.                                                                    | `{ canCreate: false, canUpdate: false, isAdmin: false }` |

* * *

## config.defaults = {};

| Property Name | Type   | Description                                                                              | Default Value |
| ------------- | ------ | ---------------------------------------------------------------------------------------- | ------------- |
| `city`        | string | The default city, used when creating new locations and organizations.                    | `""`          |
| `province`    | string | The default province, used when creating new locations and organizations.                | `""`          |
| `countryCode` | string | The default two-letter country code, used when creating new locations and organizations. | `""`          |

* * *

## config.licences = {};

| Property Name           | Type     | Description                                                                         | Default Value                                                                                             |
| ----------------------- | -------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `feeCalculationFn`      | function | A function that returns an object, calculating the licence fee for a given licence. | `(licenceObject) => { return { fee: 10, message: "Using base licence fee.", licenceHasErrors: false }; }` |
| `printTemplate`         | string   | The name of the ejs file that generates the licence print out.                      | `"licence-print"`                                                                                         |
| `externalLicenceNumber` | object   | The external licence number configuration.                                          | _(Described below)_                                                                                       |
| `externalReceiptNumber` | object   | The external receipt number configuration.                                          | _(Described below)_                                                                                       |

### config.licences.externalLicenceNumber = {};

| Property Name    | Type    | Description                                                                                                         | Default Value               |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `fieldLabel`     | string  | The label to describe the customizable licence number.                                                              | `"External Licence Number"` |
| `newCalculation` | string  | An option to automatically calculate the new externalLicenceNumber value.  Set to `"range"` to use the calculation. | `""`                        |
| `isPreferredID`  | boolean | When true, the external licence number will be more prominently shown.                                              | `false`                     |

### config.licences.externalReceiptNumber = {};

| Property Name | Type   | Description                                            | Default Value      |
| ------------- | ------ | ------------------------------------------------------ | ------------------ |
| `fieldLabel`  | string | The label to describe the customizable receipt number. | `"Receipt Number"` |

* * *

## config.licenceTypes = \[licenceTypeA, licenceTypeB, ...\];

An array of licence type configuration objects.

### `licenceType = {};`

| Property Name        | Type    | Description                                                                   | Sample Value        |
| -------------------- | ------- | ----------------------------------------------------------------------------- | ------------------- |
| `licenceTypeKey`     | string  | The two-character key for the licence type.                                   | `"NV"`              |
| `licenceType`        | string  | The human readable name of the licence type.                                  | `"Nevada"`          |
| `totalPrizeValueMax` | number  | The maximum prize value permitted for the licence type.                       | `5000`              |
| `isActive`           | boolean | Whether or not the licence type is available for new licences.                | `true`              |
| `ticketTypes`        | array   | An optional array of ticket type objects if ticket types must be tracked.     | _(Described below)_ |
| `licenceFields`      | array   | An optional array of fields that are filled out alongside the licence.        | _(Described below)_ |
| `eventFields`        | array   | An optional array of fields that are filled out alongside each licence event. | _(Described below)_ |
| `printSettings`      | object  | Specific settings to pass to the licence report print.                        | `{}`                |

#### ticketTypes = \[ticketTypeA, ticketTypeB, ...\];

| Property Name   | Type   | Description                                   | Sample Value |
| --------------- | ------ | --------------------------------------------- | ------------ |
| `ticketType`    | string | The one-to-five character ticket type key.    | `"BN26"`     |
| `ticketPrice`   | number | The price of a single ticket.                 | `1`          |
| `ticketCount`   | number | The total number of tickets in a single unit. | `16800`      |
| `prizesPerDeal` | number | The total amount of prizes.                   | `11440`      |
| `feePerUnit`    | number | The licence fee per unit.                     | `343.2`      |

#### licenceFields = \[licenceFieldA, licenceFieldB, ...\];

| Property Name     | Type    | Description                                                         | Sample Value                                      |
| ----------------- | ------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| `fieldKey`        | string  | The one-to-twenty character field key.                              | `"units"`                                         |
| `fieldLabel`      | string  | The visible label for the field.                                    | `"Total Number of Units"`                         |
| `isShownOnEvent`  | boolean | Whether or not the field should be shown on the event view.         | `true`                                            |
| `isActive`        | boolean | Whether or not the field should be available on new licences.       | `true`                                            |
| `inputAttributes` | object  | An object containing HTML attributes for the field's input element. | `{ type: "number", min: 1, max: 10000, step: 1 }` |

#### eventFields = \[eventFieldA, eventFieldB, ...\];

| Property Name     | Type    | Description                                                         | Sample Value                                            |
| ----------------- | ------- | ------------------------------------------------------------------- | ------------------------------------------------------- |
| `fieldKey`        | string  | The one-to-twenty character field key.                              | `"distributorCommission"`                               |
| `fieldLabel`      | string  | The visible label for the field.                                    | `"Distributor Commission"`                              |
| `isActive`        | boolean | Whether or not the field should be available on new licences.       | `true`                                                  |
| `inputAttributes` | object  | An object containing HTML attributes for the field's input element. | `{ type: "number", min: 0, max: 10000.00, step: 0.01 }` |

* * *

## config.amendments = {};

| Property Name             | Type    | Description                                                                                                             | Default Value |
| ------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------- | ------------- |
| `displayCount`            | number  | The number of amendments to display in the licence views.                                                               | `5`           |
| `trackLicenceFeeUpdate`   | boolean | Whether or not to create an amendment record when a licence fee is changed.                                             | `true`        |
| `trackDateTimeUpdate`     | boolean | Whether or not to create an amendment record when the date or time range for a licence is changed.                      | `true`        |
| `trackOrganizationUpdate` | boolean | Whether or not to create an amendment record when the organization associated with a licence is changed.                | `true`        |
| `trackLocationUpdate`     | boolean | Whether or not to create an amendment record when the location associated with a licence is changed.                    | `true`        |
| `trackTicketTypeNew`      | boolean | Whether or not to create an amendment record when a new ticket type is added to a licence.                              | `true`        |
| `trackTicketTypeUpdate`   | boolean | Whether or not to create an amendment record when the number of units associated with a licence ticket type is changed. | `true`        |
| `trackTicketTypeDelete`   | boolean | Whether or not to create an amendment record when a ticket type is removed from a licence.                              | `true`        |
