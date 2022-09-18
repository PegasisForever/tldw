import {client, Data, ResOf} from "./network";
import {ActionIcon, Box, Loader, Text, TextInput, useMantineTheme} from "@mantine/core";
import React, {Fragment, PropsWithChildren, ReactChild, useMemo, useRef, useState} from "react";
import produce from "immer";
import {m} from "framer-motion";
import icon from "../../assets/img/icon-128.png";
import {IconSend} from "@tabler/icons";

export const ChatUI = (props: Data) => {
  const theme = useMantineTheme()
  const [askText, setAskText] = useState('')
  const [chat, setChat] = useState<Array<{ q: string; a: string | null }>>([])
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const readMinutes = useMemo(() => {
    let totalWords = 0
    for (const chapter of props.chapters) {
      for (const bullet of chapter.bullets) {
        totalWords += bullet.split(' ').length
      }
    }
    return Math.max(1, Math.round(totalWords / 238))
  }, [props.chapters])

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

  let bubbleI = 0
  const getDelay = () => {
    bubbleI++
    return (bubbleI - 1) * 0.1
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
        }}
        initial={{
          translateY: '-100%',
          opacity: 0,
        }}
        animate={{
          translateY: 0,
          opacity: 1,
        }}
      >
        <img src={icon} width={24} alt={''}/>
        <span>Brevity</span>
      </Box>
      <Box
        ref={chatContainerRef}
        sx={{
          overflowY: 'auto',
          flexGrow: 1,
          paddingTop: 18,
          paddingBottom: 54,
        }}>
        <LeftBubble showLogo delay={getDelay()}>
          <Text size={'sm'}>
            Brevity found {props.chapters.length} topics in this video.
          </Text>
          <Text size={'xs'} color={'dimmed'}>
            {readMinutes} min read.
          </Text>
        </LeftBubble>
        {props.chapters.map((chapter, i) => (
          <ChapterBubble key={i} chapter={chapter} chapterI={i} showLogo={i === props.chapters.length - 1}
                         delay={getDelay()}/>
        ))}
        {chat.map(({q, a}, i) => (
          <Fragment key={i}>
            <RightBubble>
              <Text>{q}</Text>
            </RightBubble>
            <LeftBubble showLogo delay={0.1}>
              {a ?
                <Text>{a}</Text> :
                <Loader size={'sm'} sx={{display: 'flex'}}/>
              }
            </LeftBubble>
          </Fragment>
        ))}
      </Box>
      <Box
        component={m.form}
        initial={{
          translateY: 50,
          opacity: 0,
        }}
        animate={{
          translateY: 0,
          opacity: 1,
        }}
        sx={{
          position: 'absolute',
          left: 64,
          right: 64,
          bottom: 12,
        }}
        onSubmit={e => {
          e.preventDefault()
          onSend()
        }}
      >
        <TextInput
          radius={'xl'}
          sx={{
            width: '100%',
            height: '100%',
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
    </Box>
  )
}

const formatMilliSeconds = (ms: number) => {
  const s = ms / 1000
  const minutes = Math.floor(s / 60)
  const seconds = Math.round(s - minutes * 60)

  return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
}

const ChapterBubble = ({
                         chapter,
                         chapterI,
                         showLogo,
                         delay
                       }: { chapter: ResOf<'getTLDW'>['chapters'][number]; chapterI: number, showLogo?: boolean, delay?: number }) => {
  const theme = useMantineTheme()
  return <LeftBubble showLogo={showLogo} delay={delay}>
    <Text size={'xs'} color={'dimmed'}>
      <Box component={'span'}
           sx={{color: theme.black}}>Topic {chapterI + 1}</Box> | {formatMilliSeconds(chapter.start)} - {formatMilliSeconds(chapter.end)}
    </Text>
    <Text size={'lg'} sx={{}}>
      {chapter.gist}
    </Text>
    <Box
      component={'ul'}
      sx={{
        marginTop: 4,
        marginBottom: 0,
        paddingLeft: 16,
        fontSize: theme.fontSizes.sm,
      }}>
      {chapter.bullets.map((text, i) => (
        <Box component={'li'} key={i}>
          {text}
        </Box>
      ))}
    </Box>
  </LeftBubble>
}

const LeftBubble = ({children, showLogo, delay}: PropsWithChildren<{ showLogo?: boolean, delay?: number }>) => {
  const theme = useMantineTheme()
  return <Box
    component={m.div}
    initial={{
      opacity: 0,
      translateY: 100,
    }}
    animate={{
      opacity: 1,
      translateY: 0,
    }}
    transition={{delay}}
    mb={showLogo ? 18 : 6}
    sx={{
      display: 'flex',
      alignItems: 'flex-end',
      paddingRight: 64,
    }}>
    <Box sx={{width: 48, paddingLeft: 8, display: 'flex'}}>
      {showLogo ? <img src={icon} width={32} alt={''}/> : null}
    </Box>
    <Box sx={{
      flexGrow: 1,
      flexBasis: 0,
      backgroundColor: theme.white,
      padding: 12,
      borderRadius: 16,
    }}>
      {children}
    </Box>
  </Box>
}

const RightBubble = ({children, delay}: PropsWithChildren<{ delay?: number }>) => {
  const theme = useMantineTheme()
  return <Box
    component={m.div}
    initial={{
      opacity: 0,
      translateY: 100,
    }}
    animate={{
      opacity: 1,
      translateY: 0,
    }}
    transition={{delay}}
    mb={18} mr={16} ml={80}
    sx={{
      backgroundColor: theme.white,
      padding: 12,
      borderRadius: 16,
    }}>
    {children}
  </Box>
}