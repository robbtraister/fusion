'use strict'

const React = require('react')

const sections = [
  {
    id: 'nav',
    cssClass: 'col-xs-12'
  },
  {
    id: 'top',
    cssClass: ''
  },
  {
    id: 'bomb-1',
    cssClass: 'col-xs-12'
  },
  {
    id: 'upper-west',
    cssClass: 'col-lg-8 col-md-8 col-sm-12 col-xs-12 with-right-border'
  },
  {
    id: 'upper-east',
    cssClass: 'col-lg-4 col-md-4 col-sm-12 col-xs-12'
  },
  {
    id: 'bomb-2',
    cssClass: 'col-xs-12'
  },
  {
    id: 'lower-west',
    cssClass: 'col-lg-8 col-md-8 col-sm-12 col-xs-12 with-right-border'
  },
  {
    id: 'lower-east',
    cssClass: 'col-lg-4 col-md-4 col-sm-12 col-xs-12'
  },
  {
    id: 'bottom',
    cssClass: 'col-xs-12'
  },
  {
    id: 'sub-footer',
    cssClass: ''
  }
]

const Section = (props) =>
  <section id={props.id} className={props.cssClass}>{props.children}</section>

const HomepageWithBomb = (props) =>
  <div id='pb-root'>
    {sections.map((section, i) => <Section key={i} {...section} >{props.children[i]}</Section>)}
  </div>

module.exports = HomepageWithBomb
