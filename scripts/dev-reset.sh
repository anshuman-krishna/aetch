#!/bin/bash
# kill port 3000 and restart dev

PORT=3000

echo "checking port $PORT..."
PID=$(lsof -ti :$PORT 2>/dev/null)

if [ -n "$PID" ]; then
  echo "killing process $PID on port $PORT"
  kill -9 $PID 2>/dev/null
  sleep 1
else
  echo "port $PORT is free"
fi

echo "starting next dev server..."
npm run dev
