'use strict'

import { createContext } from 'react'

const themeContext = createContext({
  name: 'light',
  backgroundColor: '#fff',
  color: '#222'
})

export default themeContext
