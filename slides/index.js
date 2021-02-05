const remark = require('remark');
// const recommended = require('remark-preset-lint-recommended');
const html = require('remark-html');
// const report = require('vfile-reporter');
 
remark()
  // .use(recommended)
  .use(html)
  .process('## Hello world!', function (err, file) {
    // console.error(report(err || file))
    console.log(String(file))
  });