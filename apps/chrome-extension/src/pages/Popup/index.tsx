import React from 'react'
import { render } from 'react-dom'

import { Popup } from './Popup'
import { MantineProvider } from '@mantine/core'

render(
  <MantineProvider withGlobalStyles withNormalizeCSS>
    <Popup />
  </MantineProvider>,
  window.document.querySelector('#app-container')
)

// @ts-ignore
if (module.hot) module.hot.accept()
