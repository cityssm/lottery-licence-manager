import { rawToCSV } from '@cityssm/expressjs-server-js/stringFns.js'
import type { Request, Response } from 'express'

import { getProperty } from '../../helpers/functions.config.js'
import * as licencesDB from '../../helpers/licencesDB.js'
import { reportDefinitions } from '../../helpers/reportDefinitions/reportDefinitions.js'

const urlPrefix = getProperty('reverseProxy.urlPrefix')

export default function handler(request: Request, response: Response): void {
  const reportName = request.params.reportName

  if (!Object.hasOwn(reportDefinitions, reportName)) {
    response.redirect(`${urlPrefix}/reports/?error=reportNotFound`)
    return
  }

  const definition = reportDefinitions[reportName]

  const sql = definition.sql

  const parameters =
    definition.params === undefined ? [] : definition.params(request)

  const functions =
    definition.functions === undefined
      ? new Map<string, (...parameters_: unknown[]) => unknown>()
      : definition.functions()

  const rowsColumnsObject = licencesDB.getRawRowsColumns(
    sql,
    parameters,
    functions
  )

  const csv = rawToCSV(rowsColumnsObject)

  response.setHeader(
    'Content-Disposition',
    `attachment; filename=${reportName}-${Date.now().toString()}.csv`
  )

  response.setHeader('Content-Type', 'text/csv')

  response.send(csv)
}
