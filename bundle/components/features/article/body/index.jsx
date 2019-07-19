'use strict'

import React, { useContext } from 'react'

import styles from './styles.scss'

import themeContext from '../../../common/contexts/theme'

const Body = () => {
  const theme = useContext(themeContext)

  return (
    <div className={styles[theme.name]}>
      Some body
    </div>
  )
}

export default Body
