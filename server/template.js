const React = require('react')

const Template = (content) => {
  return <html>
    <head>
      <title>React Rendering Engine</title>
      <link rel='icon' type='image/png' sizes='96x96' href='/favicon-96x96.png' />
      <link rel='icon' type='image/png' sizes='32x32' href='/favicon-32x32.png' />
      <link rel='icon' type='image/png' sizes='16x16' href='/favicon-16x16.png' />
      <link rel='stylesheet' type='text/css' href='/style.css' />
    </head>
    <body>
      <div id='App' dangerouslySetInnerHTML={{ __html: content }} />
    </body>
  </html>
}

module.exports = Template
module.exports.Body = Template
