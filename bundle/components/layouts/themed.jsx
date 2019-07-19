'use strict'

import React from 'react'

import themeContext from '../common/contexts/theme'

const themes = [
  {
    name: 'light',
    backgroundColor: '#fff',
    color: '#222'
  },
  {
    name: 'dark',
    backgroundColor: '#222',
    color: '#ddd'
  }
]

const Themed = ({ theme, children }) => (
  <themeContext.Provider
    value={themes.find(({ name }) => name === theme) || themes[0]}
  >
    {children}
  </themeContext.Provider>
)

export default Themed
