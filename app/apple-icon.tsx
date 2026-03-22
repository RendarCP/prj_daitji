import { ImageResponse } from 'next/og'

export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b1112',
          borderRadius: 42,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 16,
            borderRadius: 36,
            background:
              'radial-gradient(circle at center, rgba(36, 195, 107, 0.22), rgba(36, 195, 107, 0) 64%)',
          }}
        />
        <div
          style={{
            width: 80,
            height: 80,
            transform: 'rotate(45deg)',
            borderRadius: 18,
            background: 'linear-gradient(135deg, #3bd47d 0%, #187a45 100%)',
            boxShadow: '0 0 0 10px rgba(18, 26, 27, 0.82)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 56,
            height: 56,
            transform: 'rotate(45deg)',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #fafcfb 0%, #dce9e2 100%)',
            boxShadow: '0 0 0 8px rgba(11, 17, 18, 0.6)',
          }}
        />
      </div>
    ),
    size,
  )
}
