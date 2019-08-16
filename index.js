const fs = require('fs').promises
const path = require('path')
const Promise = require('bluebird');
var Jimp = require('jimp');

async function walk(dir, fileList = []) {
  const files = await fs.readdir(dir)
  for (const file of files) {
    const stat = await fs.stat(path.join(dir, file))
    if (stat.isDirectory()) fileList = await walk(path.join(dir, file), fileList)
    else fileList.push(path.join(dir, file))
  }
  return fileList
}

const processFile = async (filePath) => {
    const ext = path.extname(filePath)    
    var filename = path.basename(filePath, ext);    
    // console.log('filename', filename)
    console.log('filePath', filePath)
    return Jimp.read(filePath)
    .then(jimpFile => {
        return jimpFile
            // .resize(256, 256) // resize
            .quality(70) // set JPEG quality
            // .greyscale() // set greyscale
            .write(`./dist/${filename}_full${ext}`)
            .resize(400, 300 )
            .write(`./dist/${filename}_thumb${ext}`)
    })
    .catch(err => {
    console.error(err);
    });
}

walk('./examples/gallery').then((originalFiles) => {
    console.log(originalFiles);

    
    // const ext = path.extname(originalFiles[0])
    // console.log('ext', ext)
    // var filename = path.basename(originalFiles[0], ext);
    // console.log('filename', filename)
    Promise.map(originalFiles, async (originalFile) => {
        console.log('originalFile', originalFile)
        await processFile(originalFile);
    })
    // Jimp.read(originalFiles[0], (err, file) => {
    //     console.log('file', file)
    // if (err) throw err;
    // file
    //     .resize(256, 256) // resize
    //     .quality(60) // set JPEG quality
    //     .greyscale() // set greyscale
    //     .write('lena-small-bw.jpg'); // save
    // });

})