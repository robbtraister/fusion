#!/bin/sh

CONTEXT_PATH="${CONTEXT_PATH:-pb}"
# strip trailing slash
CONTEXT_PATH="${CONTEXT_PATH%%/}"
# enforce leading slash
CONTEXT_PATH="/${CONTEXT_PATH##/}"

API_PREFIX="${CONTEXT_PATH}/api/v3"

IS_PROD=$(echo "${NODE_ENV}" | grep -i "^prod")

if [ "${IS_PROD}" ]
then
  AWS_REGION=$(curl --max-time 2 http://169.254.169.254/latest/meta-data/placement/availability-zone | sed 's/[a-z]*$//')
else
  AWS_REGION=${AWS_REGION:-us-east-1}
fi


DNS_SERVER=''
for word in $(cat '/etc/resolv.conf')
do
  # the dns must be 4 segments of digits separated by '.'s
  dns=$(echo "${word}" | egrep '^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$')
  if [ "${dns}"  ]
  then
    DNS_SERVER="${DNS_SERVER}${dns} "
  fi
done


if [ "${LAMBDA_ENGINE}" ]
then
  HTTP_ENGINE=''
else
  if [ ! "${HTTP_ENGINE}" ]
  then
    LAMBDA_ENGINE="arn:aws:lambda:${AWS_REGION:-us-east-1}:${AWS_ACCOUNT_ID:-057404813832}:function:fusion-engine-\${environment}"
  fi
fi


if [ "${LAMBDA_RESOLVER}" ]
then
  HTTP_RESOLVER=''
else
  if [ ! "${HTTP_RESOLVER}" ]
  then
    LAMBDA_RESOLVER="arn:aws:lambda:${AWS_REGION:-us-east-1}:${AWS_ACCOUNT_ID:-057404813832}:function:fusion-resolver-\${environment}"
  fi
fi

S3_HOST="http://${S3_BUCKET:-arc-fusion-discrete-${AWS_REGION}}.s3.amazonaws.com"
