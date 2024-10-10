import type { Request, Response } from 'express'

import mergeLocations from '../../helpers/licencesDB/mergeLocations.js'

export interface DoMergeLocationsRequest {
  targetLocationID: string
  sourceLocationID: string
}

export default function handler(
  request: Request<unknown, unknown, DoMergeLocationsRequest>,
  response: Response
): void {
  const targetLocationID = request.body.targetLocationID
  const sourceLocationID = request.body.sourceLocationID

  const success = mergeLocations(
    targetLocationID,
    sourceLocationID,
    request.session.user
  )

  response.json({
    success
  })
}
