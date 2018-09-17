#!/bin/sh

cat <<EOB

  geo \$dollar {
    default                     '\$';
  }

  map \$request_uri \$valid_request {
    ~[\{\}]                     'false';
    default                     'true';
  }

  map \$http_x_forwarded_host \$host_header {
    ''                          \$host;
    default                     \$http_x_forwarded_host;
  }

  map \$is_args \$query_params {
    '?'                         \$is_args\$args;
    default                     '';
  }

  # request_time is recorded in s with ms resolution; remove the '.' for ms
  map \$request_time \$latency_padded {
    ~^(?<i>\d*)\.(?<d>\d*)\$    \$i\$d ;
    default                     'NaN';
  }

  # this is just to cleanup stray 0 padding
  map \$latency_padded \$latency {
    '0000'                      '0';
    ~^0*(?<num>[^0].*)\$        \$num;
    default                     \$latency_padded;
  }

  map \$request_uri \$context_free_uri {
    ~*^${CONTEXT_PATH}/(.*)     /\$1;
    default                     \$request_uri;
  }

  map \$http_referer \$refererVersion {
    ~(\?|&)v=([0-9]+)(&|$)      \$2;
    default                     'production'; #'\${dollar}LATEST';
  }

  map \$cookie_version \$cookieVersion {
    default                     \$cookie_version;
    ''                          \$refererVersion;
  }

  map \$http_version \$headerVersion {
    default                     \$http_version;
    ''                          \$cookieVersion;
  }

  map \$arg_v \$version {
    default                     \$arg_v;
    ''                          \$headerVersion;
  }

  map \$host \$environment {
    default                     '${ENVIRONMENT:-localhost}';
EOB
if [ "${IS_PROD}" ]
then
  cat <<EOB
    ~^(?<subdomain>[^.]+)\.     \$subdomain;
EOB
fi
cat <<EOB
  }

  map \$host \$mode {
EOB
if [ "${IS_PROD}" ]
then
  cat <<EOB
    default                     'live';
    ~^(?<subdomain>[^.]+)\.(?<mode>cache|backup|live)\.     \$mode;
EOB
else
  cat <<EOB
    default                     'local';
EOB
fi
cat <<EOB
  }

  map \$http_user_agent \$defaultOutputType {
    ~*(phone|mobile)            'mobile';
    default                     'default';
  }

  map \$arg_outputType \$outputType {
    default                     \$arg_outputType;
    ''                          \$defaultOutputType;
  }
EOB
