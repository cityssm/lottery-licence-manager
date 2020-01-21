[Help Home](readme.md)

# Admin - config.js

The `data/config.js` file is used to customize your application.
On first install, the file does not exist.  You can create one from scratch,
or get started by using the `data/config-example.js` file as a template.

```javascript
let config = {};

// your configuration

module.exports = config;
```


## `config.application = {};`

Property Name | Description | Default Value
------------- | ----------- | -------------
`applicationName` | Make the application your own by changing the name. | `"Lottery Licence System"`
`logoURL` | The path to a custom logo.  Square-shaped images work best. | `"/images/bingoBalls.png"`
`httpPort` | The listening port for HTTP. | `3000`


### `config.application.https = {};`

Property Name | Description | Default Value
------------- | ----------- | -------------
`port` | The listening port for HTTPS. | `null`
`keyPath` | The path to the key file. | `null`
`certPath` | The path to the certificate file. | `null`
`passphrase` | The secret passphrase for the certificate. | `null`



## `config.defaults = {};`

Property Name | Description | Default Value
------------- | ----------- | -------------
`city` | The default city, used when creating new locations and organizations. | `""`
`province` | The default province, used when creating new locations and organizations. | `""`


## `config.licences = {};`

Property Name | Description | Default Value
------------- | ----------- | -------------
`feeCalculationFn` | A function that returns an object, calculating the licence fee for a given licence. | `function(licenceObject) { return { fee: 10, message: "Using base licence fee.", licenceHasErrors: false }; }`
`printTemplate` | The name of the ejs file that generates the licence print out. | `"licence-print"`


### `config.licences.externalLicenceNumber = {};`

Property Name | Description | Default Value
------------- | ----------- | -------------
`fieldLabel` | The label to describe the customizable licence number. | `"External Licence Number"`
`newCalculation` | An option to automatically calculate the new externalLicenceNumber value.  Set to `"range"` to use the calculation. | `""`


### `config.licences.externalReceiptNumber = {};`

Property Name | Description | Default Value
------------- | ----------- | -------------
`fieldLabel` | The label to describe the customizable receipt number. | `"Receipt Number"`


## `config.licenceTypes = [licenceTypeA, licenceTypeB, ...];`

An array of licence type configuration objects.


### `licenceType = {};`

Property Name | Description | Sample Value
------------- | ----------- | ------------
`licenceTypeKey` | The two-character key for the licence type. | `"NV"`
`licenceType` | The human readable name of the licence type. | `"Nevada"`
`isActive` | Whether or not the licence type is available for new licences. | `true`
`ticketTypes` | An optional array of ticket type objects if ticket types must be tracked. | (Described below)
`licenceFields` | An optional array of fields that are filled out alongside the licence. | (Described below)
`eventFields` | An optional array of fields that are filled out alongside each licence event. | (Described below)


#### `ticketTypes = [ticketTypeA, ticketTypeB, ...];`

Property Name | Description | Sample Value
------------- | ----------- | ------------
`ticketType` | The one-to-five character ticket type key. | `"BN26"`
`ticketPrice` | The price of a single ticket. | `1`
`ticketCount` | The total number of tickets in a single unit. | `16800`
`prizesPerDeal` | The total amount of prizes. | `11440`
`feePerUnit` | The licence fee per unit. | `343.2`


#### `licenceFields = [licenceFieldA, licenceFieldB, ...];`

Property Name | Description | Sample Value
------------- | ----------- | ------------
`fieldKey` | The one-to-twenty character field key. | `"units"`
`fieldLabel` | | Total Number of Units
`isActive` | | `true`
`inputAttributes` | |


#### `eventFields = [eventFieldA, eventFieldB, ...];`

Property Name | Description | Sample Value
------------- | ----------- | ------------
`fieldKey` | The one-to-twenty character field key. | `"distributorCommission"`
`fieldLabel` | |
`isActive` | | `true`
`inputAttributes` | |
