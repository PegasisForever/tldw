import {ActionIcon, Box, Loader, Stack, Text, TextInput, useMantineTheme, Button} from '@mantine/core'
import React, {Fragment, PropsWithChildren, useRef, useState} from 'react'
import {client, Data, ResOf} from './network'
import {IconSend} from '@tabler/icons'
import produce from 'immer'
import {WelcomeUI} from "./WelcomeUI";
import {m} from 'framer-motion'
import icon from '../../assets/img/icon-128.png'

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

const ChatUI = (props: Data) => {
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
        .query('getAnswer', {id: props.id, question: askText})
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
    <Box sx={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box
        component={m.div}
        sx={{
          flexShrink: 0,
          padding: 8,
          backgroundColor: '#002f49',
          color: theme.white,
          fontWeight: 600,
          fontSize: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
        <img src={icon} width={24} alt={''}/>
        <span>Brevity</span>

      </Box>
      <Box
        ref={chatContainerRef}
        sx={{
          overflowY: 'auto',
          flexGrow: 1,
          paddingTop: 6,
          paddingBottom: 54,
        }}>
        <LeftBubble>
          <Text>I summarized the video for you. There are {props.chapters.length} chapters in total :)</Text>
        </LeftBubble>
        {props.chapters.map((chapter, i) => (
          <ChapterBubble key={i} chapter={chapter} chapterI={i}/>
        ))}
        {chat.map(({q, a}, i) => (
          <Fragment key={i}>
            <RightBubble>
              <Text>{q}</Text>
            </RightBubble>
            <LeftBubble>{a ? <Text>{a}</Text> : <Loader size={'sm'}/>}</LeftBubble>
          </Fragment>
        ))}
      </Box>
      <TextInput
        radius={'xl'}
        sx={{
          position: 'absolute',
          left: 64,
          right: 64,
          bottom: 12,
        }}
        styles={{
          input: {
            backgroundColor: theme.fn.rgba(theme.white, 0.9),
          }
        }}
        rightSection={<ActionIcon mr={2} color={'blue'} variant={'subtle'} onClick={onSend} sx={{
          borderRadius: 99999
        }}>
          <IconSend size={22}/>
        </ActionIcon>}
        placeholder={"I'm looking for something specific..."}
        value={askText}
        onChange={e => setAskText(e.target.value)}
      />
    </Box>
  )
}

const BubbleAlign = ({children, align}: PropsWithChildren<{ align: 'left' | 'right' }>) => {
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

const ChapterBubble = ({chapter, chapterI}: { chapter: ResOf<'getTLDW'>['chapters'][number]; chapterI: number }) => {
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

const LeftBubble = ({children}: PropsWithChildren<{}>) => {
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

const RightBubble = ({children}: PropsWithChildren<{}>) => {
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
