import { Box, List, Stack, Text, useMantineTheme } from '@mantine/core'
import React, { PropsWithChildren, useEffect, useMemo, useState } from 'react'
import loadingGif from '../../assets/img/loading.gif'
import logo from '../../assets/img/logo.webp'
import { ResOf, useQuerySWR } from './network'

const youtubeIdRegex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/

function parseYoutubeId(url: string) {
  const match = url.match(youtubeIdRegex)
  if (match && match[7].length === 11) {
    return match[7]
  } else {
    return undefined
  }
}

export const Popup = () => {
  const [url, setUrl] = useState<string>()
  console.log('url', url)

  useEffect(() => {
    chrome.tabs
      .query({
        active: true,
        currentWindow: true,
      })
      .then(tabs => setUrl(tabs[0].url))
  }, [])

  const videoId = useMemo(() => {
    if (url) {
      return parseYoutubeId(url)
    } else {
      return undefined
    }
  }, [url])

  const [res] = useQuerySWR('getTLDW', videoId ? { youtubeVideoId: videoId } : null)

  const theme = useMantineTheme()
  return (
    <Box
      sx={{
        width: 400,
        height: 600,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.gray[1],
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
          backgroundColor: theme.white,
        }}>
        <img src={logo} width={32} alt={''} />
        <span>Brevity</span>
      </Box>
      {res ? <ChatUI {...res} /> : <LoadingUI />}
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

const ChatUI = (props: ResOf<'getTLDW'>) => {
  return (
    <Box
      sx={{
        overflowY: 'auto',
        flexGrow: 1,
        paddingTop: 6,
        paddingBottom: 6,
      }}>
      <LeftBubble>I summarized the video for you. There are {props.chapters.length} chapters in total :)</LeftBubble>
      {props.chapters.map((chapter, i) => (
        <ChapterBubble key={i} chapter={chapter} chapterI={i} />
      ))}
    </Box>
  )
}

const BubbleAlign = ({ children, align }: PropsWithChildren<{ align: 'left' | 'right' }>) => {
  return (
    <Box
      sx={{
        padding: 14,
        paddingTop: 6,
        paddingBottom: 6,
        [align === 'left' ? 'paddingRight' : 'paddingLeft']: 48,
      }}>
      {children}
    </Box>
  )
}

const formatMilliSeconds = (ms: number) => {
  const s = ms / 1000
  const minutes = Math.floor(s / 60)
  const seconds = Math.round(s - minutes * 60)

  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
}

const ChapterBubble = ({ chapter, chapterI }: { chapter: ResOf<'getTLDW'>['chapters'][number]; chapterI: number }) => {
  const theme = useMantineTheme()
  return (
    <BubbleAlign align={'left'}>
      <Box
        sx={{
          filter: `drop-shadow(0px 0px 1px ${theme.colors.gray[6]})`,
        }}>
        <Box
          sx={{
            backgroundColor: theme.white,
            padding: 12,
            borderRadius: 8,
            borderTopLeftRadius: 0,
            position: 'relative',
            '&:after': {
              content: `""`,
              position: 'absolute',
              left: 0,
              top: 12,
              width: 0,
              height: 0,
              border: '12px solid transparent',
              borderRightColor: theme.white,
              borderLeft: 0,
              marginTop: -12,
              marginLeft: -12,
            },
          }}>
          <Text size={'xs'} color={'dimmed'}>
            Chapter {chapterI + 1} | {formatMilliSeconds(chapter.start)} - {formatMilliSeconds(chapter.end)}
          </Text>
          <Text size={'xl'} sx={{}}>
            {chapter.gist}
          </Text>
          <Box
            component={'ul'}
            sx={{
              marginTop: 4,
              paddingLeft: 16,
            }}>
            {chapter.bullets.map((text, i) => (
              <Box component={'li'} key={i}>
                {text}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </BubbleAlign>
  )
}

const LeftBubble = ({ children }: PropsWithChildren<{}>) => {
  const theme = useMantineTheme()
  return (
    <BubbleAlign align={'left'}>
      <Box
        sx={{
          filter: `drop-shadow(0px 0px 1px ${theme.colors.gray[6]})`,
        }}>
        <Box
          sx={{
            backgroundColor: theme.white,
            padding: 12,
            borderRadius: 8,
            position: 'relative',
            '&:after': {
              content: `""`,
              position: 'absolute',
              left: 0,
              top: '50%',
              width: 0,
              height: 0,
              border: '12px solid transparent',
              borderRightColor: theme.white,
              borderLeft: 0,
              marginTop: -12,
              marginLeft: -12,
            },
          }}>
          <Text>{children}</Text>
        </Box>
      </Box>
    </BubbleAlign>
  )
}
