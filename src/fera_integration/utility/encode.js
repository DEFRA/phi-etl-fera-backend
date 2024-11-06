// TO TEST USING THIS FILE, FOLLOW THESE STEPS:
// 1. Add "type": "module" to package.json
// 2. in the terminal use command node src/fera_integration/utility/encode.js

import { readFileSync, writeFileSync } from 'fs'

const pathToFile = 'C:/Projects/DEFRA/PHI-Beta/'
// Path to your .pem file
const pemContent = readFileSync(pathToFile + 'fera.pem', 'utf8')
const base64Cert = Buffer.from(pemContent).toString('base64')

// Write the encoded content to a file
writeFileSync(pathToFile + 'fera64encoded', base64Cert)

// console.log('Base64 encoding complete. Check encodedfile.txt', base64Cert.length)
