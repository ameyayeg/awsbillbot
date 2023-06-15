@app
billbot3

@http
get /

@scheduled
checkbills cron(0 11 ? * MON-FRI *)

@aws
profile default
region us-east-2
architecture arm64
runtime nodejs18.x

@events
postbill

@plugins
architect/plugin-lambda-invoker

