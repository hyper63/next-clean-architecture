import { readFile, writeFile } from 'node:fs/promises'

const _p = await readFile('./package.json').then(JSON.parse)

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
