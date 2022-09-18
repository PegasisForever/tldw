import React from 'react'
import { render } from 'react-dom'

import { Popup } from './Popup'
import { MantineProvider } from '@mantine/core'
import { SWRConfig } from 'swr'

render(
  <MantineProvider withGlobalStyles withNormalizeCSS>
    <SWRConfig
      value={{
        refreshInterval: 0,
      }}>
      <Popup />
    </SWRConfig>
  </MantineProvider>,
  window.document.querySelector('#app-container')
)

// @ts-ignore
if (module.hot) module.hot.accept()
