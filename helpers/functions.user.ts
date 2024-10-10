import type { Request } from 'express'

export function userIsAdmin(request: Partial<Request>): boolean {
  return request.session?.user.userProperties.isAdmin ?? false
}

export function userCanUpdate(request: Partial<Request>): boolean {
  return request.session?.user.userProperties.canUpdate ?? false
}

export function userCanCreate(request: Partial<Request>): boolean {
  return request.session?.user.userProperties.canCreate ?? false
}

export function getHashString(userName: string, passwordPlain: string): string {
  return `${userName}::${passwordPlain}`
}
