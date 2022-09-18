import { ActionIcon, Box, Loader, Stack, Text, TextInput, useMantineTheme } from '@mantine/core'
import React, { Fragment, PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'
import loadingGif from '../../assets/img/loading.gif'
import logo from '../../assets/img/logo.webp'
import { client, ResOf, useQuerySWR } from './network'
import { IconSend } from '@tabler/icons'
import produce from 'immer'
import {LogoAnimation} from "./LogoAnimation";

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
      <LogoAnimation size={250}/>
    </Stack>
  )
}

const ChatUI = (props: ResOf<'getTLDW'>) => {
  const theme = useMantineTheme()
  const [askText, setAskText] = useState('')
  const [chat, setChat] = useState<Array<{ q: string; a: string | null }>>([])
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      const el = chatContainerRef.current
      if (el) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: 'smooth',
        })
      }
    }, 16)
  }

  const onSend = () => {
    if (askText && (chat.length === 0 || chat[chat.length - 1].a !== null)) {
      setChat(old =>
        produce(old, draft => {
          draft.push({
            q: askText,
            a: null,
          })
        })
      )
      client
        .query('getAnswer', { id: props.id, question: askText })
        .then(res => {
          setChat(old =>
            produce(old, draft => {
              draft[draft.length - 1].a =
                res.answer ?? "Sorry, this video doesn't appear to have content relating to your question."
            })
          )
          scrollToBottom()
        })
        .catch(e => {
          console.error(e)
          setChat(old =>
            produce(old, draft => {
              draft[draft.length - 1].a = 'There is an error, please try later.'
            })
          )
          scrollToBottom()
        })
      setAskText('')
      scrollToBottom()
    }
  }

  return (
    <>
      <Box
        ref={chatContainerRef}
        sx={{
          overflowY: 'auto',
          flexGrow: 1,
          paddingTop: 6,
          paddingBottom: 6,
        }}>
        <LeftBubble>
          <Text>I summarized the video for you. There are {props.chapters.length} chapters in total :)</Text>
        </LeftBubble>
        {props.chapters.map((chapter, i) => (
          <ChapterBubble key={i} chapter={chapter} chapterI={i} />
        ))}
        {chat.map(({ q, a }, i) => (
          <Fragment key={i}>
            <RightBubble>
              <Text>{q}</Text>
            </RightBubble>
            <LeftBubble>{a ? <Text>{a}</Text> : <Loader size={'sm'} />}</LeftBubble>
          </Fragment>
        ))}
      </Box>
      <Box
        component={'form'}
        onSubmit={e => {
          e.preventDefault()
          onSend()
        }}
        sx={{
          flexShrink: 0,
          padding: 6,
          display: 'flex',
          backgroundColor: theme.white,
          borderTop: `1px solid ${theme.colors.gray[5]}`,
          alignItems: 'center',
          gap: 8,
        }}>
        <TextInput
          sx={{
            flexGrow: 1,
          }}
          placeholder={'Ask Brevity.....'}
          value={askText}
          onChange={e => setAskText(e.target.value)}
        />
        <ActionIcon mr={2} color={'blue'} variant={'subtle'} onClick={onSend}>
          <IconSend size={28} />
        </ActionIcon>
      </Box>
    </>
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
              marginBottom: 0,
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
            display: 'flex',
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
          {children}
        </Box>
      </Box>
    </BubbleAlign>
  )
}

const RightBubble = ({ children }: PropsWithChildren<{}>) => {
  const theme = useMantineTheme()
  return (
    <BubbleAlign align={'right'}>
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
            display: 'flex',
            '&:after': {
              content: `""`,
              position: 'absolute',
              right: 0,
              top: '50%',
              width: 0,
              height: 0,
              border: '12px solid transparent',
              borderLeftColor: theme.white,
              borderRight: 0,
              marginTop: -12,
              marginRight: -12,
            },
          }}>
          {children}
        </Box>
      </Box>
    </BubbleAlign>
  )
}
