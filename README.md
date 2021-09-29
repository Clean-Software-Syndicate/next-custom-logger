Next Custom Logger
==================

[![CircleCI](https://circleci.com/gh/CleanSoftwareSyndicate/next-custom-logger/tree/master.svg?style=svg)](https://circleci.com/gh/CleanSoftwareSyndicate/next-custom-logger/tree/master)

Because logging is important.

## Setup

`npm install --save @cssynd/next-custom-logger`

In custom server:

~~~ js
const next = require('next');
const withCustomLogger = require('@cssynd/next-custom-logger');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = withCustomLogger(next({ dev }), function (ctx, err) {
    // custom logger callback
    console.log(ctx);
});

... // serve start
~~~
