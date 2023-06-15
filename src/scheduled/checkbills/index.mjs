import arc from '@architect/functions'

const url = `https://www.parl.ca/legisinfo/en/overview/json/onagenda`

async function publishBills(bills) {
  await arc.events.publish({
    name: 'postbill',
    payload: { bills },
  })
  await arc.events.publish({
    name: 'tweetbill',
    payload: { bills },
  })
}

export async function handler(event) {
  const bills = await fetch(url)
  const allBills = await bills.json()

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
      const formattedBills = governmentBills
        .map((bill) => {
          return {
            number: bill.NumberCode,
            title: bill.LongTitle,
            status: bill.StatusName,
            url: `http://www.parl.ca/legisinfo/en/bill/${bill.ParliamentNumber}-${bill.SessionNumber}/${bill.NumberCode}`,
            minister: bill.SponsorAffiliationTitle,
          }
        })
        .map((bill) => {
          return `Bill: ${bill.number}\nTitle: ${bill.title}\nStatus: ${bill.status}\nPortfolio: ${bill.minister}\n${bill.url}`
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
