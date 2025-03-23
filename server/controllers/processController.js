// server/controllers/processController.js
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const zlib = require('zlib');
const File = require('../models/file');
const CsvTransformStream = require('../streams/CsvTransformStream');

const processedDirectory = path.join(__dirname, '../processed');

// Ensure processed directory exists
if (!fs.existsSync(processedDirectory)) {
  fs.mkdirSync(processedDirectory, { recursive: true });
}

exports.compressFile = async (req, res) => {
  const fileId = req.params.id;
  
  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const outputFilename = `${file.filename}.gz`;
    const outputPath = path.join(processedDirectory, outputFilename);
    
    await pipeline(
      fs.createReadStream(file.path),
      zlib.createGzip(),
      fs.createWriteStream(outputPath)
    );
    
    // Save processed file metadata
    const processedFile = new File({
      filename: outputFilename,
      path: outputPath,
      originalFile: fileId,
      processType: 'compression',
      uploadDate: new Date()
    });
    
    await processedFile.save();
    
    res.status(200).json({
      message: 'File compressed successfully',
      file: {
        id: processedFile._id,
        filename: processedFile.filename
      }
    });
  } catch (err) {
    console.error('Compression error:', err);
    res.status(500).json({ error: 'File compression failed' });
  }
};

exports.processCsv = async (req, res) => {
  const fileId = req.params.id;
  const { transformations } = req.body;
  
  if (!transformations || !Array.isArray(transformations)) {
    return res.status(400).json({ error: 'Invalid transformation rules' });
  }
  
  try {
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    if (!file.filename.endsWith('.csv')) {
      return res.status(400).json({ error: 'File is not a CSV' });
    }
    
    const outputFilename = `${path.basename(file.filename, '.csv')}_processed.csv`;
    const outputPath = path.join(processedDirectory, outputFilename);
    
    // Create transform function from provided rules
    const transform = (record) => {
      let result = { ...record };
      
      for (const t of transformations) {
        if (t.type === 'rename' && t.from && t.to) {
          result[t.to] = result[t.from];
          delete result[t.from];
        } else if (t.type === 'calculate' && t.target && t.formula) {
          const formula = new Function(...Object.keys(result), `return ${t.formula}`);
          try {
            result[t.target] = formula(...Object.values(result));
          } catch (err) {
            console.error('Formula error:', err);
          }
        } else if (t.type === 'filter' && t.condition) {
          const condition = new Function(...Object.keys(result), `return ${t.condition}`);
          if (!condition(...Object.values(result))) {
            return null; // Skip this record
          }
        }
      }
      
      return result;
    };
    
    await pipeline(
      fs.createReadStream(file.path),
      new CsvTransformStream({ transform }),
      fs.createWriteStream(outputPath)
    );
    
    // Save processed file metadata
    const processedFile = new File({
      filename: outputFilename,
      path: outputPath,
      originalFile: fileId,
      processType: 'csv-transform',
      uploadDate: new Date()
    });
    
    await processedFile.save();
    
    res.status(200).json({
      message: 'CSV processed successfully',
      file: {
        id: processedFile._id,
        filename: processedFile.filename
      }
    });
  } catch (err) {
    console.error('CSV processing error:', err);
    res.status(500).json({ error: 'CSV processing failed' });
  }
};