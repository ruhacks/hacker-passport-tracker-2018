if [ -d 'build' ]; then
  echo 'Starting application on port 6000'
  serve -s build -p 6000
fi

if [ ! -d 'build' ]; then
  echo 'Build the application first by running `npm run build`'
fi