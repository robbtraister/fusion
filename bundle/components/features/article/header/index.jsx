'use strict'

import React from 'react'
import styled from 'styled-components'

import styles from './styles.scss'
import logo from '~/resources/img/logo.svg'

const DIV = styled.div`
  text-transform: uppercase;
`

const Header = () =>
  <nav className={styles.banner}>
    <img className={styles.logo} src={logo} />
    <DIV className={styles.title}>Title</DIV>
  </nav>

export default Header
