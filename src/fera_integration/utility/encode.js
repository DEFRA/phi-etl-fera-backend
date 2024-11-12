// TO TEST USING THIS FILE, FOLLOW THESE STEPS:
// 1. Add "type": "module" to package.json
// 2. in the terminal use command node src/fera_integration/utility/encode.js

import { readFileSync, writeFileSync } from 'fs'

const pathToFile = 'C:/Projects/DEFRA/PHI-Beta/FERA Data/'
// Path to your .pem file
const pemContent = readFileSync(pathToFile + 'feracert.pem', 'utf8')
const base64Cert = Buffer.from(pemContent).toString('base64')

const pemKey = readFileSync(pathToFile + 'key.pem', 'utf8')
const base64Key = Buffer.from(pemKey).toString('base64')

// Write the encoded content to a file
writeFileSync(pathToFile + 'fera64encoded1', base64Cert)
writeFileSync(pathToFile + 'keyEncoded1', base64Key)

// console.log('Base64 encoding complete. Check encodedfile.txt', base64Cert.length)
// console.log('Base64 encoding complete. Check encodedfile.txt', base64Key.length)
