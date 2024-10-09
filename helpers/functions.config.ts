// eslint-disable-next-line node/no-unpublished-import
import { config } from '../data/config.js'

import type * as configTypes from '../types/configTypes'
import type * as recordTypes from '../types/recordTypes'
import type { CountryCode } from 'libphonenumber-js'

/*
 * SET UP FALLBACK VALUES
 */

const configFallbackValues = new Map<string, unknown>()

configFallbackValues.set(
  'application.applicationName',
  'Lottery Licence System'
)
configFallbackValues.set('application.logoURL', '/images/bingoBalls.png')
configFallbackValues.set('application.httpPort', 3000)
configFallbackValues.set('application.useTestDatabases', false)

configFallbackValues.set('reverseProxy.disableCompression', false)
configFallbackValues.set('reverseProxy.disableEtag', false)
configFallbackValues.set('reverseProxy.urlPrefix', '')

configFallbackValues.set(
  'session.cookieName',
  'lottery-licence-manager-user-sid'
)
configFallbackValues.set('session.secret', 'cityssm/lottery-licence-manager')
configFallbackValues.set('session.maxAgeMillis', 60 * 60 * 1000)
configFallbackValues.set('session.doKeepAlive', false)

configFallbackValues.set('users.testing', [])
configFallbackValues.set('users.canLogin', ['administrator'])
configFallbackValues.set('users.canCreate', [])
configFallbackValues.set('users.canUpdate', [])
configFallbackValues.set('users.isAdmin', ['administrator'])

configFallbackValues.set('admin.defaultPassword', '')

configFallbackValues.set('user.createUpdateWindowMillis', 60 * 60 * 1000)
configFallbackValues.set('user.defaultProperties', {
  canCreate: false,
  canUpdate: false,
  isAdmin: false
})

configFallbackValues.set('defaults.city', '')
configFallbackValues.set('defaults.province', 'ON')
configFallbackValues.set('defaults.countryCode', 'CA')

configFallbackValues.set('reminders.preferredSortOrder', 'date')
configFallbackValues.set('reminders.dismissingStatuses', [])

configFallbackValues.set('reminderCategories', [])

configFallbackValues.set('bankRecordTypes', [
  {
    bankRecordType: 'statement',
    bankRecordTypeName: 'Bank Statement'
  },
  {
    bankRecordType: 'cheques',
    bankRecordTypeName: 'Cheques'
  },
  {
    bankRecordType: 'receipts',
    bankRecordTypeName: 'Receipts'
  }
] as configTypes.ConfigBankRecordType[])

configFallbackValues.set(
  'licences.externalLicenceNumber.fieldLabel',
  'External Licence Number'
)
configFallbackValues.set('licences.externalLicenceNumber.newCalculation', '')
configFallbackValues.set('licences.externalLicenceNumber.isPreferredID', false)

configFallbackValues.set(
  'licences.externalReceiptNumber.fieldLabel',
  'Receipt Number'
)

configFallbackValues.set('licences.feeCalculationFn', () => {
  return {
    fee: 10,
    message: 'Using base licence fee.',
    licenceHasErrors: false
  }
})

configFallbackValues.set('licences.printTemplate', 'licence-print')

configFallbackValues.set('licenceTypes', [])

configFallbackValues.set('amendments.displayCount', 5)

configFallbackValues.set('amendments.trackLicenceFeeUpdate', true)
configFallbackValues.set('amendments.trackDateTimeUpdate', true)
configFallbackValues.set('amendments.trackOrganizationUpdate', true)
configFallbackValues.set('amendments.trackLocationUpdate', true)

configFallbackValues.set('amendments.trackTicketTypeNew', true)
configFallbackValues.set('amendments.trackTicketTypeUpdate', true)
configFallbackValues.set('amendments.trackTicketTypeDelete', true)

/*
 * Set up function overloads
 */

export function getProperty(
  propertyName: 'activeDirectory'
): configTypes.ConfigActiveDirectory

export function getProperty(propertyName: 'amendments.displayCount'): number
export function getProperty(
  propertyName: 'amendments.trackLicenceFeeUpdate'
): boolean
export function getProperty(
  propertyName: 'amendments.trackDateTimeUpdate'
): boolean
export function getProperty(
  propertyName: 'amendments.trackOrganizationUpdate'
): boolean
export function getProperty(
  propertyName: 'amendments.trackLocationUpdate'
): boolean
export function getProperty(
  propertyName: 'amendments.trackTicketTypeNew'
): boolean
export function getProperty(
  propertyName: 'amendments.trackTicketTypeUpdate'
): boolean
export function getProperty(
  propertyName: 'amendments.trackTicketTypeDelete'
): boolean

export function getProperty(propertyName: 'application.applicationName'): string
export function getProperty(propertyName: 'application.logoURL'): string
export function getProperty(propertyName: 'application.httpPort'): number
export function getProperty(propertyName: 'application.userDomain'): string
export function getProperty(
  propertyName: 'application.useTestDatabases'
): boolean

export function getProperty(
  propertyName: 'bankRecordTypes'
): configTypes.ConfigBankRecordType[]

export function getProperty(propertyName: 'defaults.city'): string
export function getProperty(propertyName: 'defaults.province'): string
export function getProperty(propertyName: 'defaults.countryCode'): CountryCode

export function getProperty(
  propertyName: 'reminders.preferredSortOrder'
): 'date' | 'config'
export function getProperty(
  propertyName: 'reminders.dismissingStatuses'
): string[]

export function getProperty(
  propertyName: 'licences.externalLicenceNumber.fieldLabel'
): string
export function getProperty(
  propertyName: 'licences.externalLicenceNumber.newCalculation'
): '' | 'range'
export function getProperty(
  propertyName: 'licences.externalLicenceNumber.isPreferredID'
): boolean

export function getProperty(
  propertyName: 'licences.externalReceiptNumber.fieldLabel'
): string

export function getProperty(
  propertyName: 'licences.feeCalculationFn'
): (licenceObject: recordTypes.LotteryLicence) => {
  fee: number
  message: string
  licenceHasErrors: boolean
}

export function getProperty(propertyName: 'licences.printTemplate'): string

export function getProperty(
  propertyName: 'licenceTypes'
): configTypes.ConfigLicenceType[]

export function getProperty(
  propertyName: 'reminderCategories'
): configTypes.ConfigReminderCategory[]

export function getProperty(
  propertyName: 'reverseProxy.disableCompression'
): boolean
export function getProperty(propertyName: 'reverseProxy.disableEtag'): boolean
export function getProperty(propertyName: 'reverseProxy.urlPrefix'): string

export function getProperty(propertyName: 'session.cookieName'): string
export function getProperty(propertyName: 'session.doKeepAlive'): boolean
export function getProperty(propertyName: 'session.maxAgeMillis'): number
export function getProperty(propertyName: 'session.secret'): string

export function getProperty(
  propertyName: 'user.createUpdateWindowMillis'
): number

export function getProperty(propertyName: 'users.testing'): string[]
export function getProperty(propertyName: 'users.canLogin'): string[]
export function getProperty(propertyName: 'users.canCreate'): string[]
export function getProperty(propertyName: 'users.canUpdate'): string[]
export function getProperty(propertyName: 'users.isAdmin'): string[]

export function getProperty(
  propertyName: 'user.defaultProperties'
): recordTypes.UserProperties

export function getProperty(propertyName: string): unknown {
  const propertyNameSplit = propertyName.split('.')

  let currentObject = config

  for (const propertyNamePiece of propertyNameSplit) {
    if (currentObject[propertyNamePiece]) {
      currentObject = currentObject[propertyNamePiece]
    } else {
      return configFallbackValues.get(propertyName)
    }
  }

  return currentObject
}

export const keepAliveMillis = getProperty('session.doKeepAlive')
  ? Math.max(
      getProperty('session.maxAgeMillis') / 2,
      getProperty('session.maxAgeMillis') - 10 * 60 * 1000
    )
  : 0

/*
 * REMINDER TYPES
 */

const reminderTypeCache = new Map<string, configTypes.ConfigReminderType>()

export const getReminderType = (
  reminderTypeKey: string
): configTypes.ConfigReminderType => {
  if (reminderTypeCache.size === 0) {
    for (const reminderCategory of getProperty('reminderCategories')) {
      for (const reminderType of reminderCategory.reminderTypes) {
        reminderType.reminderCategory = reminderCategory.reminderCategory
        reminderTypeCache.set(reminderType.reminderTypeKey, reminderType)
      }
    }
  }

  return reminderTypeCache.get(reminderTypeKey)
}

/*
 * LICENCE TYPES
 */

const licenceTypeCache = new Map<string, configTypes.ConfigLicenceType>()
let licenceTypeKeyNameObject = {}

export function getLicenceType(
  licenceTypeKey: string
): configTypes.ConfigLicenceType | undefined {
  if (!licenceTypeCache.has(licenceTypeKey)) {
    const licenceType = getProperty('licenceTypes').find(
      (element) => element.licenceTypeKey === licenceTypeKey
    )

    if (licenceType !== undefined) {
      licenceTypeCache.set(licenceTypeKey, licenceType)
    }
  }

  return licenceTypeCache.get(licenceTypeKey)
}

export const getLicenceTypeKeyToNameObject = (): {
  [licenceTpyeKey: string]: string
} => {
  if (Object.keys(licenceTypeKeyNameObject).length === 0) {
    const list = {}

    for (const element of getProperty('licenceTypes')) {
      if (element.isActive) {
        list[element.licenceTypeKey] = element.licenceType
      }
    }

    licenceTypeKeyNameObject = list
  }

  return licenceTypeKeyNameObject
}
