const { readFile, writeFile } = require('fs/promises')

const _p = require('./package.json')

async function init() {
  const env = await readFile('./.env.example', 'utf-8')

  // HYPER could be set in shell environment ie. by Gitpod
  if (!process.env.HYPER) {
    console.log('Setting HYPER for local development with hyper {nano} ⚡️🍷')
    process.env.HYPER = `http://localhost:6363/${_p.name}`
  }

  let newEnv = env.replace(/^HYPER=.*$/m, `HYPER="${process.env.HYPER}"`)

  await writeFile('.env.local', newEnv)
}

init()
