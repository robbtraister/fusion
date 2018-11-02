#!/bin/sh

cat <<EOB
    statsd_timing             "arc.fusion.origin.latency#nile_env:${NILE_ENV},arc-site:\${arcSite}" "\$request_time";
EOB

