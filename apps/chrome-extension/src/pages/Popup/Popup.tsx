import { Box, Text, Stack, useMantineTheme } from '@mantine/core'
import React from 'react'
import loadingGif from '../../assets/img/loading.gif'
import logo from '../../assets/img/logo.webp'

export const Popup = () => {
  const theme = useMantineTheme()
  return (
    <Box
      sx={{
        width: 400,
        height: 600,
        display: 'flex',
        flexDirection: 'column',
      }}>
      <Box
        px={16}
        py={8}
        sx={{
          borderBottom: `1px solid ${theme.colors.gray[5]}`,
          fontSize: 24,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
        <img src={logo} width={32} alt={''} />
        <span>Brevity</span>
      </Box>
      <LoadingUI />
    </Box>
  )
}

const LoadingUI = () => {
  return (
    <Stack
      align={'center'}
      justify={'center'}
      sx={{
        flexGrow: 1,
      }}>
      <img src={loadingGif} width={64} height={64} alt={''} />
      <Text size={'lg'}>Brevity is thinking.....</Text>
    </Stack>
  )
}
