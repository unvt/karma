import { Router } from 'https://deno.land/x/oak/mod.ts'
import { tileToBBOX } from './tilebelt.js'
import { stringify } from "https://deno.land/x/xml/mod.ts"

const tileSize = 256
const minLodPixels = tileSize / 2
const maxLodPixels = tileSize * 8
const urlHead = 'https://maps.gsi.go.jp/xyz'

const generateKml = (ctx) => {
  let doc = {
    xml: {
      '@version': '1.0',
      '@encoding': 'utf-8'
    },
    kml: {
      '@xmlns': 'http://www.opengis.net/kml/2.2',
      Document: {
        name: 'name',
        description: '',
        Style: {
          ListStyle: {
            '@id': 'hideChildren',
            'listItemType': 'checkHideChildren'
          }
        }
      }
    }
  }
  if(ctx.params.x) {
    const [z, x, y, minx, maxx] = [
      parseInt(ctx.params.z),
      parseInt(ctx.params.x),
      parseInt(ctx.params.y),
      parseInt(ctx.params.minx),
      parseInt(ctx.params.maxx)
    ]
    console.log(`${z}/${x}/${y}`)
    const [ext, t] = [
      ctx.params.ext,
      ctx.params.t
    ]
    const [west, south, east, north] = 
      tileToBBOX([x, y, z])
    const drawOrder = (x == 0) ? 2 * z + 1 : 2 * z
      
    doc.kml.Document.Region = {
      LatLonAltBox: {
        west: west,
        south: south,
        east: east,
        north: north
      },
      Lod: {
        minLodPixels: minLodPixels,
        maxLodPixels: maxLodPixels
      }
    }
    doc.kml.Document.GroundOverlay = {
      drawOrder: drawOrder,
      Icon: {
        href: `${urlHead}/${t}/${z}/${x}/${y}.${ext}`
      },
      LatLonBox: {
        west: west,
        south: south,
        east: east,
        north: north
      }
    }
  }
  return stringify(doc)
}

const router = new Router()

router.get('/:minx/:maxx/:ext/:t', (ctx) => {
  ctx.params.ext
  ctx.params.t
  ctx.response.body = generateKml(ctx)
})

router.get('/:minx/:maxx/:ext/:t/:z/:x/:y', (ctx) => {
  ctx.response.body = generateKml(ctx)
})

export { router }

