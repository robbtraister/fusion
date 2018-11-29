# Fusion

Fusion is a server-side + client-side rendering engine. It is designed for sites that consist of many separate pages that share a small number of templates that may be constantly changing.

# Metrics
Below is a list of available metrics emitted by Fusion components

## Fusion Origin
| Metric | Description | Tags |
| ------ | ------------ | ---- |
| `arc.fusion.origin.latency` | Origin request time (milliseconds)| `nile_env:[Origin Nile Environment]` </br> `environment:[Arc Org-Env]` </br> `arcSite:[Arc Site]` | 

## Fusion Cache Proxy
| Metric | Description | Tags |
| ------ | ------------ | ---- |
| `arc.fusion.cacheproxy.request_time` | Overall Cache Proxy request time (milliseconds)| `nile_env:[Cache-proxy Nile Environment]` </br> `environment:[Arc Org (no env)]` </br> `requestMethod:[GET, PUT, POST, DELETE]` | 
| `arc.fusion.cacheproxy.upstream_response_time` | Upstream (Elasticache Cluster) latency (milliseconds)| `nile_env:[Cache-proxy Nile Environment]` </br> `environment:[Arc Org (no env)]` </br> `requestMethod:[GET, PUT, POST, DELETE]` | 

## Fusion Engine
| Metric | Description  | Tags | 
| ------ | ------------ | ---- |
| `arc.fusion.cache.latency` | Content cache latency (milliseconds) | `operation: [put, fetch]` </br> `result:[error, success, cache_hit, cache_miss, cache_error]`</br> `source: [content source name]` |
| `arc.fusion.cache.bytes` | Size of returned cache object (bytes)| `operation: [put, fetch]`</br> `result:[success, cache_hit]`</br> `source: [content source name]` | 
| `arc.fusion.compile.duration` | Time to generate the rendering (milliseconds) | `compile:[generate-source]` |
| `arc.fusion.content.latency` | Latency to fetch content from a source (milliseconds) | `operation:[fetch]`</br> `result:[success]`</br> `source:[content source name]` |
| `arc.fusion.content.bytes` | Content length in bytes (bytes) | `operation:[fetch]`</br> `result:[success]`</br> `source:[content source name]` | 
| `arc.fusion.db.duration` | Duration (milliseconds) to perform database operation | `operation:[find, findOne, get, put]` |
| `arc.fusion.db.result` | Result of database operation (values in tags) | `operation:[find, findOne, get, put]`</br> `result:[success]`|
| `arc.fusion.render.duration` | Time (milliseconds) to render | `render:[component, element, html, first-render, content-hydration, second-render]` | 
| `arc.fusion.render.result` | Result of a rendering. Currently only emitted when there's an error | `result: [error]` |
| `arc.fusion.webpack.duration` | Time (milliseconds) to run webpack operations | `webpack-op:[setup, compile]` |   