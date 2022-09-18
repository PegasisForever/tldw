import {m} from 'framer-motion'
import React from 'react'
import {useMantineTheme} from "@mantine/core";

export const LogoAnimation = (props: { size: number, fast: boolean }) => {
  const theme = useMantineTheme()
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
      animate={{
        rotate: [0, 360]
      }}
      transition={{
        duration: props.fast ? 3 : 6,
        ease: "linear",
        repeat: Infinity,
      }}
    >
      <m.g
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
    </m.g>

    <m.g
      animate={{
        rotate: [360, 0]
      }}
      transition={{
        duration: props.fast ? 4 : 8,
        ease: "linear",
        repeat: Infinity,
      }}
    >
      <m.g
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
    </m.g>

  </svg>
}