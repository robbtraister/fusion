(
  cd $(dirname "$0")

  ./zip.sh
  ./upload.js
  
  # NOTE: resolver-generator is manually deployed and requires that the DATADOG_API_KEY env var to be set locally
)
