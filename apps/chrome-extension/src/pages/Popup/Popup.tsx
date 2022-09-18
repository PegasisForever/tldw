import {Box, useMantineTheme} from '@mantine/core'
import React, {useState} from 'react'
import {Data} from './network'
import {WelcomeUI} from "./WelcomeUI";
import {ChatUI} from "./ChatUI";

export const Popup = () => {
  const [data, setData] = useState<Data | null>(null)

  const theme = useMantineTheme()
  return (
    <Box
      sx={{
        position: 'relative',
        width: 400,
        height: 600,
        background: theme.fn.linearGradient(135, '#fad9c8', '#b5ede2'),
      }}>
      <WelcomeUI data={data} setData={setData}/>
      {data ? <ChatUI {...data} /> : null}
    </Box>
  )
}
