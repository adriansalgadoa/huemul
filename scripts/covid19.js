// Description:
//  Huemul muestra la cantidad de casos contagiados, recuperados y muertes por el corona virus
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   hubot covid19 - Retorna la cantidad de casos de covid19 en Chile.
//   hubot coronavirus - Retorna la cantidad de casos de covid19 en Chile.
//
// Author:
//   @lgaticaq

module.exports = robot => {
  robot.respond(/(covid19|coronavirus)$/i, res => {
    const country = 'Chile'
    const send = (confirmed, recovered, deaths) => {
      const fallback = `Hay ${confirmed} casos confirmados, ${recovered} recuperados y ${deaths} muertes en ${country}`
      if (['SlackBot', 'Room'].includes(robot.adapter.constructor.name)) {
        const options = {
          as_user: false,
          link_names: 1,
          icon_url: 'https://i.imgur.com/MzMz8ci.png',
          username: 'Covid 19',
          unfurl_links: false,
          attachments: [
            {
              fallback,
              color: 'danger',
              title: `Resumen de casos confirmados de Covid 19 en ${country}`,
              fields: [
                {
                  title: `${confirmed} :face_with_thermometer:`,
                  short: true
                },
                {
                  title: `${recovered} :muscle:`,
                  short: true
                },
                {
                  title: `${deaths} :skull_and_crossbones:`,
                  short: true
                }
              ]
            }
          ]
        }
        robot.adapter.client.web.chat.postMessage(res.message.room, null, options)
      } else {
        res.send(fallback)
      }
    }

    const errorMessage = 'Ocurrió un error al hacer la búsqueda'

    robot.http(`https://covid19.mathdro.id/api/countries/${country}`).get()((err, response, body) => {
      if (err) {
        robot.emit('error', err, res, 'covid19')
        robot.emit('slack.ephemeral', errorMessage, res.message.room, res.message.user.id)
      } else if (response.statusCode !== 200) {
        robot.emit('slack.ephemeral', errorMessage, res.message.room, res.message.user.id)
      } else {
        try {
          const data = JSON.parse(body)
          send(data.confirmed.value, data.recovered.value, data.deaths.value)
        } catch (err) {
          robot.emit('error', err, res, 'covid19')
          robot.emit('slack.ephemeral', errorMessage, res.message.room, res.message.user.id)
        }
      }
    })
  })
}
