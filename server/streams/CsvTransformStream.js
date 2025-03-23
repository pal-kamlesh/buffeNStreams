// server/streams/CsvTransformStream.js
const { Transform } = require('stream');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');

class CsvTransformStream extends Transform {
  constructor(options) {
    super({ objectMode: true, ...options });
    this.parser = parse({
      columns: true,
      skip_empty_lines: true
    });
    
    this.stringifier = stringify({
      header: true
    });
    
    this.transformFn = options.transform || ((record) => record);
    
    // Set up the pipeline
    this.parser.on('data', (record) => {
      try {
        const transformed = this.transformFn(record);
        if (transformed) {
          this.stringifier.write(transformed);
        }
      } catch (err) {
        this.emit('error', err);
      }
    });
    
    this.parser.on('end', () => {
      this.stringifier.end();
    });
    
    this.stringifier.on('data', (data) => {
      this.push(data);
    });
    
    this.stringifier.on('end', () => {
      this.push(null);
    });
  }
  
  _transform(chunk, encoding, callback) {
    this.parser.write(chunk);
    callback();
  }
  
  _flush(callback) {
    this.parser.end();
    callback();
  }
}

module.exports = CsvTransformStream;