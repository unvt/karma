import { Router } from 'https://deno.land/x/oak/mod.ts'
import { tileToBBOX, getChildren } from './tilebelt.js'
import { stringify } from "https://deno.land/x/xml/mod.ts"

const tileSize = 256
const minLodPixels = tileSize / 2
const maxLodPixels = tileSize * 8
const urlHead = 'https://maps.gsi.go.jp/xyz'

const generateKml = (ctx) => {
  const [z, x, y, minzoom, maxzoom] = [
    parseInt(ctx.params.z),
    parseInt(ctx.params.x),
    parseInt(ctx.params.y),
    parseInt(ctx.params.minzoom),
    parseInt(ctx.params.maxzoom)
  ]
  let doc = {
    xml: {
      '@version': '1.0',
      '@encoding': 'utf-8'
    },
    kml: {
      '@xmlns': 'http://www.opengis.net/kml/2.2',
      Document: {
        name: `${z}/${x}/${y}`,
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
    if (z < maxzoom) {
      let links = []
      for(let [cx, cy, cz] of getChildren([x, y, z])) {
        console.log(`${cz}-${cx}-${cy}`)
        const [cw, cs, ce, cn] = tileToBBOX([cx, cy, cz])
        links.push({
          name: `${cz}/${cx}/${cy}`,
          Region: {
            LatLonAltBox: {
              west: cw,
              south: cs,
              eash: ce,
              north: cn
            },
            Lod: {
              minLodPixels: minLodPixels,
              maxLodPixels: -1
            }
          },
          Link: {
            href: `http://localhost:8007/${minzoom}/${maxzoom}/${ext}/${t}/${cz}/${cx}/${cy}`,
            viewRefreshMode: 'onRegion',
            viewFormat: ''
          }
        })
      }
      doc.kml.Document.NetworkLink = links
    }
  }
  return stringify(doc)
}

const router = new Router()

router.get('/:minzoom/:maxzoom/:ext/:t', (ctx) => {
  ctx.params.ext
  ctx.params.t
  ctx.response.body = generateKml(ctx)
})

router.get('/:minzoom/:maxzoom/:ext/:t/:z/:x/:y', (ctx) => {
  console.log(JSON.stringify(ctx))
  ctx.response.body = generateKml(ctx)
})

export { router }

