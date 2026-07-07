import { Box, Tooltip } from '@mui/material'


function posJitter(pos) {
  const [c, r] = pos.split(',').map(Number)
  const h = Math.abs(c * 17 + r * 31 + c * r * 7)
  const tx = (h % 7 - 3) * 1.5
  const ty = ((h * 3) % 7 - 3) * 1.5
  const rot = ((h * 5) % 13 - 6) * 3
  return `translate(${tx}px, ${ty}px) rotate(${rot}deg)`
}

export function GridCell({
  pos,
  size,
  tooltip = null,
  bgColor = null,
  canReach = true,
  isPlayer = false,
  isDecor = false,
  cursor = 'pointer',
  indicator = null,
  onClick,
  children,
}) {
  const [c, r] = pos.split(',').map(Number)
  const checkerTint = (c + r) % 2 === 0 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.03)'

  const background = isPlayer
    ? 'radial-gradient(circle at center, rgba(0,220,80,0.42) 0%, transparent 68%)'
    : bgColor ?? checkerTint

  const fogFilter = !canReach && !isPlayer ? 'grayscale(100%) brightness(0.70)' : undefined

  const contentTransform = isDecor ? posJitter(pos) : undefined

  const cell = (
    <Box
      onClick={onClick}
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        outline: '0.5px solid rgba(0,0,0,0.05)',
        background,
        cursor,
        filter: fogFilter,
        fontSize: size * 0.58,
        lineHeight: 1,
        userSelect: 'none',
        flexShrink: 0,
        zIndex: 0,
        transition: 'transform 0.1s',
        '&:hover': {
          transform: 'scale(1.1)',
          zIndex: 2,
        },
      }}
    >
      <Box sx={{
        transform: contentTransform,
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.28))',
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        {children}
      </Box>
      {indicator && (
        <Box sx={{
          position: 'absolute',
          top: 2,
          right: 2,
          width: 5,
          height: 5,
          bgcolor: indicator,
          borderRadius: '50%',
        }} />
      )}
    </Box>
  )

  return tooltip
    ? <Tooltip title={tooltip} placement="top" arrow><span>{cell}</span></Tooltip>
    : cell
}
