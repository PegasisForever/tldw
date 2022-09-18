import {m} from 'framer-motion'
import React from 'react'
import {createStyles, keyframes} from "@mantine/core";

const rotation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const useStyles = createStyles(theme => ({
  rotation1: {
    animation: `${rotation} 6s linear infinite`,
    transformOrigin: '50% 50%',
    transformBox: 'fill-box'
  },
  rotation2: {
    animation: `${rotation} 8s linear infinite reverse`,
    transformOrigin: '50% 50%',
    transformBox: 'fill-box'
  }
}))

export const LogoAnimation = (props: { size: number, fast: boolean }) => {
  const {classes, theme} = useStyles()
  const circleR = props.size / 3.5
  const gap = circleR / 4
  return <svg width={props.size} height={props.size}>
    <defs>
      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop stopColor={'#f9f3e3'} offset="0%"/>
        <stop stopColor={'#b2efe3'} offset="100%"/>
      </linearGradient>
    </defs>
    <m.circle
      cx={props.size / 2} cy={props.size / 2} r={circleR} fill={'#ffccbc'} opacity={0.3}
      initial={{
        scale: 0
      }}
      animate={{
        scale: 1
      }}
      transition={{
        delay: 0.2,
        type: 'spring',
        damping: 5,
        mass: 0.25,
      }}/>
    <m.circle
      cx={props.size / 2} cy={props.size / 2} r={circleR - gap} fill={'#ffccbc'} opacity={0.5}
      initial={{
        scale: 0
      }}
      animate={{
        scale: 1
      }}
      transition={{
        delay: 0.3,
        type: 'spring',
        damping: 5,
        mass: 0.25,
      }}/>
    <m.circle
      cx={props.size / 2} cy={props.size / 2} r={circleR - gap * 2} fill={"url(#g1)"} opacity={1}
      initial={{
        scale: 0
      }}
      animate={{
        scale: 1
      }}
      transition={{
        delay: 0.4,
        type: 'spring',
        damping: 5,
        mass: 0.25,
      }}/>
    <m.g
      className={classes.rotation1}
      style={{
        animationDuration: props.fast ? '3s' : '6s'
      }}
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      transition={{
        delay: 0.2,
        duration: 0.5
      }}>
      <m.circle
        cx={props.size / 2} cy={props.size / 2} r={circleR + gap} fill={'transparent'}
        strokeWidth={1} stroke={theme.colors.gray[4]}

      />
      <circle cx={props.size / 2 + circleR + gap} cy={props.size / 2} r={2} fill={theme.colors.gray[6]}/>
      <circle cx={props.size / 2 - circleR - gap} cy={props.size / 2} r={2} fill={theme.colors.gray[6]}/>
    </m.g>

    <m.g
      className={classes.rotation2}
      style={{
        animationDuration: props.fast ? '4s' : '8s'
      }}
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      transition={{
        delay: 0.2,
        duration: 0.5
      }}>
      <m.circle
        cx={props.size / 2} cy={props.size / 2} r={circleR + gap * 2} fill={'transparent'}
        strokeWidth={1} stroke={theme.colors.gray[4]}
      />
      <circle cx={props.size / 2 + circleR + gap * 2} cy={props.size / 2} r={2} fill={theme.colors.gray[6]}/>
      <circle cx={props.size / 2 - circleR - gap * 2} cy={props.size / 2} r={2} fill={theme.colors.gray[6]}/>
    </m.g>

  </svg>
}