import arc from '@architect/functions'
import tiny from 'tiny-json-http'

const url = `https://www.parl.ca/legisinfo/en/overview/json/onagenda`

async function publishBills(bills) {
  await arc.events.publish({
    name: 'postbill',
    payload: { bills },
  })
}

export async function handler(event) {
  const { body } = await tiny.get({ url })
  const allBills = JSON.parse(body)

  console.log(typeof allBills)

  if (allBills.length === 0) {
    const tweetText = `${new Date().toLocaleDateString(
      'en-GB'
    )}\nParliament is not sitting today.\nMore information: https://www.parl.ca/legisinfo/\n#cdnpoli`
    await publishBills([tweetText])
  } else {
    const governmentBills = allBills.filter((bill) => bill.IsGovernmentBill)
    if (governmentBills.length === 0) {
      const tweetText = `${new Date().toLocaleDateString(
        'en-GB'
      )}\nNo government bills being debated today.\nMore information: https://www.parl.ca/legisinfo/\n#cdnpoli`
      await publishBills([tweetText])
    } else {
      const tempBills = governmentBills.map((bill) => {
        return {
          number: bill.NumberCode,
          title: bill.LongTitle,
          status: bill.StatusName,
          url: `http://www.parl.ca/legisinfo/en/bill/${bill.ParliamentNumber}-${bill.SessionNumber}/${bill.NumberCode}`,
          minister: bill.SponsorAffiliationTitle,
        }
      })
      const formattedBills = tempBills.map((bill, idx) => {
        return `${idx + 1}/${tempBills.length}\nBill: ${bill.number}\nTitle: ${
          bill.title
        }\nStatus: ${bill.status}\nPortfolio: ${bill.minister}\n${bill.url}`
      })
      const bills = [
        `${new Date().toLocaleDateString('en-GB')}\nGood morning, there ${
          formattedBills.length === 1
            ? `is one bill`
            : `are ${formattedBills.length} bills`
        } on the agenda today. Please find details below. #cdnpoli
        `,
        ...formattedBills,
      ]
      await publishBills(bills)
    }
  }

  return
}
