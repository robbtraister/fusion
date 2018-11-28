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

  map \$cookie_deployment \$cookieDeployment {
    ''                          'live';
    default                     \$cookie_deployment;
  }

  map \$http_deployment \$headerDeployment {
    ''                          \$cookieDeployment;
    default                     \$http_deployment;
  }

  map \$arg_v \$arg_vDeployment {
    ''                          \$headerDeployment;
    default                     \$arg_v;
  }

  map \$arg_d \$deployment {
    ''                          \$arg_vDeployment;
    default                     \$arg_d;
  }

  map \$deployment \$isLive {
    'live'                      'true';
    default                     'false';
  }

  map \$arg__ignoreCache \$ignoreCache {
    ~*^true\$                   'true';
    default                     'false';
  }

  map \$http_fusion_cache_mode \$cacheModeHeader {
    ~*^allowed\$                'allowed';
    ~*^preferr?ed\$             'preferred';
    ~*^update\$                 'update';
    default                     'none';
  }

  map \${ignoreCache}_\${isLive}_\${cacheModeHeader} \$cacheMode {
EOB
if [ "${IS_PROD}" ]
then
  cat <<EOB
    ~^true_true_                'update';
    ~_true_allowed\$            'allowed';
    ~_true_preferred\$          'preferred';
    ~_true_update\$             'update';
    default                     'none';
EOB
else
  cat <<EOB
    default                     'local';
EOB
fi
cat <<EOB
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

  map '\$http_arc_site' \$headerSite {
    default                     \$http_arc_site;
    ''                          'default';
  }

  map \$arg__website \$arcSite {
    default                     \$arg__website;
    ''                          \$headerSite;
  }

  map \$arg_outputType \$outputType {
    default                     \$arg_outputType;
    ''                          'default';
  }

  map \$uri \$s3Suffix {
    default                     '';
    ~/$                         'index.html';
  }
EOB
