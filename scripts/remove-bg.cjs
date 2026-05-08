// scripts/remove-bg.cjs — uses jimp v1 API
const path = require('path')
const { Jimp } = require('jimp')

const INPUT  = path.join(__dirname, '../public/logo.png')
const OUTPUT = path.join(__dirname, '../public/logo_transparent.png')

;(async () => {
  const img = await Jimp.read(INPUT)

  const { width, height, data } = img.bitmap

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      const r = data[idx + 0]
      const g = data[idx + 1]
      const b = data[idx + 2]
      // Make near-black pixels (the background + dark outline) transparent
      if (r < 40 && g < 40 && b < 40) {
        data[idx + 3] = 0
      }
    }
  }

  await img.write(OUTPUT)
  console.log('✅  Saved:', OUTPUT)
})()
