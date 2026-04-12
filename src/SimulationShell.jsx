import React from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { FastForward, Pause, PlayArrow, Refresh, Settings } from '@mui/icons-material';

const TOPBAR_H = 60;
const LEFT_W = 210;
const RIGHT_W = 240;

const SHELL_BG = '#f8f6f2';
const SURFACE = '#f2f1ec';
const SURFACE_HIGH = '#e9e8e4';
const PRIMARY = '#006b1f';
const ON_SURFACE = '#2e2f2d';
const ON_SURFACE_VAR = '#5b5c59';
const BORDER = 'rgba(46,47,45,0.08)';

/**
 * Generic simulation shell — top bar + left actions + center canvas + right stats.
 *
 * Props:
 *   title         string
 *   day           number | string   (shown in top bar, optional)
 *   dayLabel      string            (default "Cycle")
 *   isRunning     bool
 *   onToggle      () => void        (start / pause)
 *   onReset       () => void        (optional)
 *   onFastForward () => void        (optional)
 *   onSettings    () => void        (optional)
 *   actions       ReactNode         (left sidebar — use SimAction)
 *   stats         ReactNode         (right sidebar — use SimStat / SimLog)
 *   children      ReactNode         (center simulation area)
 */
export const SimulationShell = ({
  title,
  day,
  dayLabel = 'Cycle',
  isRunning,
  onToggle,
  onReset,
  onFastForward,
  onSettings,
  actions,
  stats,
  children,
}) => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: SHELL_BG, overflow: 'hidden' }}>

      {/* ── Top bar ── */}
      <Box sx={{
        height: TOPBAR_H, px: 3, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <Typography sx={{ fontWeight: 900, fontSize: '1.35rem', color: PRIMARY, letterSpacing: '-0.03em' }}>
          {title}
        </Typography>

        {/* Controls pill */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, background: SURFACE, px: 2, py: 0.75, borderRadius: 99 }}>
          {day != null && (
            <>
              <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: ON_SURFACE, letterSpacing: '-0.01em' }}>
                {dayLabel}&nbsp;{day}
              </Typography>
              <Box sx={{ width: 1, height: 18, bgcolor: BORDER, mx: 0.75 }} />
            </>
          )}
          {onToggle && (
            <IconButton size="small" onClick={onToggle}
              sx={{
                width: 30, height: 30,
                background: isRunning ? 'transparent' : PRIMARY,
                color: isRunning ? ON_SURFACE_VAR : '#fff',
                '&:hover': { background: isRunning ? SURFACE_HIGH : '#005518' },
              }}>
              {isRunning ? <Pause sx={{ fontSize: '1rem' }} /> : <PlayArrow sx={{ fontSize: '1rem' }} />}
            </IconButton>
          )}
          {onFastForward && (
            <IconButton size="small" onClick={onFastForward}
              sx={{ width: 28, height: 28, color: ON_SURFACE_VAR, '&:hover': { background: SURFACE_HIGH } }}>
              <FastForward sx={{ fontSize: '1rem' }} />
            </IconButton>
          )}
          {onReset && (
            <IconButton size="small" onClick={onReset}
              sx={{ width: 28, height: 28, color: ON_SURFACE_VAR, '&:hover': { background: SURFACE_HIGH } }}>
              <Refresh sx={{ fontSize: '1rem' }} />
            </IconButton>
          )}
        </Box>

        {onSettings ? (
          <IconButton size="small" onClick={onSettings} sx={{ color: PRIMARY }}>
            <Settings />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} /> /* placeholder pour garder le titre centré */
        )}
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Left sidebar — Actions */}
        {actions && (
          <Box sx={{
            width: LEFT_W, flexShrink: 0, py: 2.5, px: 1.5,
            display: 'flex', flexDirection: 'column', gap: 0.75,
            borderRight: `1px solid ${BORDER}`, overflowY: 'auto',
          }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: ON_SURFACE_VAR, px: 1, mb: 0.5 }}>
              Actions
            </Typography>
            {actions}
          </Box>
        )}

        {/* Center — simulation area */}
        <Box sx={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {children}
        </Box>

        {/* Right sidebar — Stats */}
        {stats && (
          <Box sx={{
            width: RIGHT_W, flexShrink: 0, py: 2.5, px: 2,
            display: 'flex', flexDirection: 'column', gap: 1.5,
            borderLeft: `1px solid ${BORDER}`, overflowY: 'auto',
          }}>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: ON_SURFACE_VAR, mb: 0.5 }}>
              Statistiques
            </Typography>
            {stats}
          </Box>
        )}
      </Box>
    </Box>
  );
};

/* ────────────────────────────────────────────────
   Sub-components for left sidebar
──────────────────────────────────────────────── */

/**
 * Standard action button for the left sidebar.
 * icon: a MUI SvgIcon component (e.g. <Replay />)
 * variant: 'default' | 'primary'
 */
export const SimAction = ({ label, icon: Icon, onClick, disabled, variant = 'default' }) => (
  <Button
    onClick={onClick}
    disabled={disabled}
    startIcon={Icon ? <Icon sx={{ fontSize: '1rem' }} /> : undefined}
    sx={{
      justifyContent: 'flex-start', textTransform: 'none', borderRadius: 2.5,
      px: 2, py: 1.25, fontWeight: 600, fontSize: '0.82rem',
      background: variant === 'primary' ? PRIMARY : 'transparent',
      color: variant === 'primary' ? '#d0ffca' : ON_SURFACE,
      '&:hover': { background: variant === 'primary' ? '#005518' : SURFACE_HIGH },
      '&.Mui-disabled': { color: '#b0b0a8' },
    }}
  >
    {label}
  </Button>
);

/* ────────────────────────────────────────────────
   Sub-components for right sidebar
──────────────────────────────────────────────── */

/** A key/value stat block. highlight = vert. */
export const SimStat = ({ label, value, highlight }) => (
  <Box sx={{
    background: highlight ? 'rgba(0,107,31,0.07)' : SURFACE,
    border: `1px solid ${highlight ? 'rgba(0,107,31,0.18)' : 'transparent'}`,
    borderRadius: 2, px: 2, py: 1.25,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  }}>
    <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: ON_SURFACE_VAR, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: highlight ? PRIMARY : ON_SURFACE, lineHeight: 1 }}>
      {value}
    </Typography>
  </Box>
);

/** A text log / message strip. */
export const SimLog = ({ message }) =>
  message ? (
    <Box sx={{ background: SURFACE_HIGH, borderRadius: 2, px: 2, py: 1.25, borderLeft: `2px solid ${PRIMARY}` }}>
      <Typography sx={{ fontSize: '0.78rem', color: ON_SURFACE, fontStyle: 'italic', lineHeight: 1.4 }}>
        {message}
      </Typography>
    </Box>
  ) : null;

/** A section label to group stats. */
export const SimSection = ({ label }) => (
  <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: ON_SURFACE_VAR, mt: 1 }}>
    {label}
  </Typography>
);
