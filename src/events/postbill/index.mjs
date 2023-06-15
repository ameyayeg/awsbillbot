import arc from '@architect/functions'

import Mastodon from 'mastodon-api'

const M = new Mastodon({
  client_key: process.env.CLIENT_KEY,
  client_secret: process.env.CLIENT_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  timeout_ms: 60 * 1000, // optional HTTP request timeout to apply to all requests.
  api_url: 'https://mstdn.ca/api/v1/', // optional, defaults to https://mastodon.social/api/v1/
})

async function toot(status, id = null) {
  let params = {
    status: status,
  }
  if (id) {
    params.in_reply_to_id = id
  }
  let results = await M.post('statuses', params)
  return results.data.id
}

async function postbill(event) {
  const { bills = [] } = event

  let id = null

  if (bills.length > 0) {
    id = await toot(bills.shift())
  }

  for (let bill of bills) {
    await toot(bill, id)
  }

  return
}

export const handler = arc.events.subscribe(postbill)
