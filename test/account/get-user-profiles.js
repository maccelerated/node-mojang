const test = require('ava')
const nock = require('nock')
const {getUserProfiles} = require('../..')

// API behavior observed 25.08.2017 by maccelerated
test('resolves with a valid access token', async t => {
  nock('https://api.mojang.com', {
    reqheaders: {
      'authorization': 'Bearer goodaccesstoken'
    }
  })
    .get('/user/profiles')
    .reply(200, [
      {
        'agent': 'minecraft',
        'id': '7ddf32e17a6ac5ce04a8ecbf782ca509',
        'name': 'example',
        'userId': '83e4a96aed96436c621b9809e258b309',
        'createdAt': 1000000000000,
        'legacyProfile': false,
        'deleted': false,
        'paid': true,
        'migrated': false
      }
    ])

  const accessToken = 'goodaccesstoken'
  const list = await getUserProfiles({accessToken})
  t.is(list.length, 1)
  t.truthy(list[0].name)
})

// API behavior observed 30.08.2017 by maccelerated
test('wraps api error on bad access token', async t => {
  nock('https://api.mojang.com', {
    reqheaders: {
      'authorization': 'Bearer badormissing'
    }
  })
    .get('/user/profiles')
    .reply(401, {
      'error': 'Unauthorized',
      'errorMessage': 'The request requires user authentication'
    }, {
      'WWW-Authenticate': 'Bearer realm="Mojang", error="invalid_token", error_description="The access token is invalid"'
    })

  const accessToken = 'badormissing'
  const err = await t.throws(getUserProfiles({accessToken}))
  t.is(err.message, 'The access token is invalid')
  t.is(err.name, 'Unauthorized')
})
