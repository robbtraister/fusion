(
  cd $(dirname "$0")

  ./zip.sh
  ./deploy.js
  rm -rf generator.zip
)
