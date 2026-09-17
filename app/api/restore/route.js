import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { image, prompt } = await req.json()
    
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = process.env.CLOUDFLARE_API_TOKEN

    if (!accountId || !apiToken) {
      return NextResponse.json({ error: 'Faltan variables en Vercel' }, { status: 500 })
    }

    // Quitamos el prefijo data:image...
    const base64 = image.replace(/^data:image\/\w+;base64,/, '')

    const cfRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt || 'restore old photo, remove scratches, high quality, detailed face',
          image: base64,
          strength: 0.6,
          num_steps: 25,
        }),
      }
    )

    if (!cfRes.ok) {
      const errorText = await cfRes.text()
      console.error('Cloudflare Error:', errorText)
      return NextResponse.json({ error: `Cloudflare: ${errorText}` }, { status: 500 })
    }

    const result = await cfRes.arrayBuffer()
    const base64Result = Buffer.from(result).toString('base64')
    
    return NextResponse.json({ 
      restored: `data:image/jpeg;base64,${base64Result}` 
    })

  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: `fetch failed: ${e.message}` }, { status: 500 })
  }
}
