import React, {useState} from "react";
import {Button, Box} from "@mantine/core";
import {LogoAnimation} from "./LogoAnimation";
import {m} from "framer-motion";
import {client, Data} from "./network";

const youtubeIdRegex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/

function parseYoutubeId(url: string) {
  const match = url.match(youtubeIdRegex)
  if (match && match[7].length === 11) {
    return match[7]
  } else {
    return undefined
  }
}

export const WelcomeUI = (props: { data: Data | null, setData: (data: Data) => void }) => {
  const [isLoading, setIsLoading] = useState(false)
  return (
    <Box
      component={m.div}
      animate={{opacity: props.data ? 0 : 1}}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
      }}>
      <LogoAnimation size={250} fast={isLoading}/>
      <m.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1
        }}
        transition={{
          delay: 0.4,
          duration: 0.5
        }}>
        <Button disabled={isLoading || !!props.data} variant={'default'} px={48} sx={{
          borderRadius: 99999,
          border: 'none',
        }} onClick={async () => {
          try {
            setIsLoading(true)
            // await new Promise(r => setTimeout(r, 2000));
            const tabs = await chrome.tabs
              .query({
                active: true,
                currentWindow: true,
              })
            const url = tabs[0].url
            const videoId = parseYoutubeId(url!)
            if (!videoId) return

            const res = await client.query('getTLDW', {youtubeVideoId: videoId})
            props.setData(res)
          } catch (e) {
            console.log(e)
          } finally {
            setIsLoading(false)
          }
        }}>
          Make It Brief
        </Button>
      </m.div>
    </Box>
  )
}