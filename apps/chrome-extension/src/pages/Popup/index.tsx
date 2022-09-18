import React from 'react'
import {render} from 'react-dom'

import {Popup} from './Popup'
import {MantineProvider} from '@mantine/core'
import {SWRConfig} from 'swr'
import {domMax, LazyMotion} from "framer-motion";

render(
  <MantineProvider withGlobalStyles withNormalizeCSS>
    <LazyMotion features={domMax}>
      <SWRConfig
        value={{
          refreshInterval: 0,
        }}>
        <Popup/>
      </SWRConfig>
    </LazyMotion>
  </MantineProvider>,
  window.document.querySelector('#app-container')
)

// @ts-ignore
if (module.hot) module.hot.accept()
