import { callApi } from '@ace/callApi'
import { treeGET } from '@ace/treeGET'
import { treePUT } from '@ace/treePUT'
import { treePOST } from '@ace/treePOST'
import type { APIEvent } from '@ace/types'
import { treeDELETE } from '@ace/treeDELETE'


export async function GET(event: APIEvent) {
  'use server'
  return callApi(event, treeGET)
}


export async function POST(event: APIEvent) {
  'use server'
  return callApi(event, treePOST)
}


export async function PUT(event: APIEvent) {
  'use server'
  return callApi(event, treePUT)
}


export async function DELETE(event: APIEvent) {
  'use server'
  return callApi(event, treeDELETE)
}
