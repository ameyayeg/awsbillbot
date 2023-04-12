// learn more about event functions here: https://arc.codes/events
import { TwitThread } from 'twit-thread'
import arc from '@architect/functions'

const t = new TwitThread({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET,
  access_token: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
})

async function tweetbill(event) {
  const { bills } = event

  const text = bills.join('\n\n')

  return new Promise(
    (resolve, reject) => {
      t.tweetThread([{ text: text }])
    },
    (error, data, response) => {
      if (error) {
        console.log(error)
        reject(error)
      } else {
        console.log(data)
        resolve(data)
      }
    }
  )
}

export const handler = arc.events.subscribe(tweetbill)
