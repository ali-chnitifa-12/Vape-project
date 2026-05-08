// scripts/remove-bg.js — ESM version
import Jimp from 'jimp'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const INPUT  = path.join(__dirname, '../public/logo.png')
const OUTPUT = path.join(__dirname, '../public/logo_transparent.png')

;(async () => {
  const img = await Jimp.read(INPUT)

  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
    const r = this.bitmap.data[idx + 0]
    const g = this.bitmap.data[idx + 1]
    const b = this.bitmap.data[idx + 2]

    // If the pixel is very dark (near-black background), make it transparent
    if (r < 30 && g < 30 && b < 30) {
      this.bitmap.data[idx + 3] = 0 // alpha = 0 → fully transparent
    }
  })

  await img.writeAsync(OUTPUT)
  console.log('✅  Saved:', OUTPUT)
})()
