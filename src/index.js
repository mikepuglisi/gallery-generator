import React from 'react'
import Gallery from './components/gallery';
import ReactDOMServer from 'react-dom/server';

const gallerySourcePath = './examples/gallery';
// const gallerySourcePath = 'C:\\Users\\mikep\\gallery';

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 300;

const fs = require('fs');
const fsPromises = require('fs').promises;
const url = require('url')
const path = require('path')
const Promise = require('bluebird');
const mkdirp = require('mkdirp-promise')
var Jimp = require('jimp');



function fileExistsCheck(filepath){
  return new Promise((resolve, reject) => {
    fs.access(filepath, fs.F_OK, error => {
      resolve(!error);
    });
  });
}

async function walk(dir, fileList = []) {
  const files = await fsPromises.readdir(dir)
  for (const file of files) {
    const stat = await fsPromises.stat(path.join(dir, file))
    if (stat.isDirectory()) fileList = await walk(path.join(dir, file), fileList)
    else fileList.push(path.join(dir, file))
  }
  return fileList
}

const processFile = async (filePath) => {
  console.log('gallerySourcePath', gallerySourcePath)
    const baseDirectory = path.basename(gallerySourcePath);
    const thumbnailSuffix = '_thumb';
    const tinySuffix = '_tiny';
    const relative = path.relative(gallerySourcePath, filePath);
    const httpRelativePathBase = `./${path.dirname(path.join(baseDirectory, relative)).replace(/\\/g, '/')}`
    const destinationPath = path.dirname(path.join('./dist', baseDirectory, relative))

    await mkdirp(destinationPath)
    const ext = path.extname(filePath)
    var filename = path.basename(filePath, ext);
    // console.log('filePath', filePath)
    // console.log('path.resolve', path.join(filePath, '../'))
   //  const parentFolder = path.dirname(filePath).split(path.sep).pop()
    // const destinationPath = path.join('./dist', parentFolder)
    const fileNameFullSize = `${filename}${ext}`;
    const fileNameThumbnail = `${filename}${thumbnailSuffix}${ext}`;
    const fileNameTiny = `${filename}${tinySuffix}${ext}`;

    return Jimp.read(filePath)
    .then(async jimpFile => {

        console.log('destinationPath', destinationPath)
        console.log('height', jimpFile.bitmap.height)
        console.log('width', jimpFile.bitmap.width)
        const fullWidth = jimpFile.bitmap.width;
        const fullHeight = jimpFile.bitmap.height;
        const targetPathFullSize = path.join(destinationPath, fileNameFullSize)
        if (!await fileExistsCheck(targetPathFullSize)) {
          console.log("DOESNTEXIS")
          await jimpFile
          // .resize(256, 256) // resize
          .quality(70) // set JPEG quality
          // .greyscale() // set greyscale
          .write(targetPathFullSize)
        }

        const targetPathThumbnail = path.join(destinationPath, fileNameThumbnail);
        if (!await fileExistsCheck(targetPathThumbnail)) {
          await jimpFile.clone()
          .cover(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT)
          .write(targetPathThumbnail)
        }
        const targetPathTiny = path.join(destinationPath, fileNameTiny);
        if (!await fileExistsCheck(targetPathTiny)) {
          await jimpFile.clone()
          .resize(Jimp.AUTO, 40)
          .write(targetPathTiny)
        }


       // console.log('targetPathFullSize', url.pathToFileURL(targetPathFullSize))
      //  const relative = path.relative(gallerySourcePath, filePath);
      //  console.log('rel', relative)
       // console.log('rel', './' + relative.replace(/\\/g, '/'))
      return {
        url: `${httpRelativePathBase}/${fileNameFullSize}`,
        width: fullWidth,
        height: fullHeight,
        thumbnail: {
          url: `${httpRelativePathBase}/${fileNameThumbnail}`,
          width: THUMBNAIL_WIDTH,
          height: THUMBNAIL_HEIGHT,
        },
        tiny: {
          url: `${httpRelativePathBase}/${fileNameTiny}`,
        }
      }
    })
    .catch(err => {
    console.error(err);
    });
}

walk(gallerySourcePath).then(async (originalFiles) => {
    const fileCollectionFiles = []
    // console.log('gallerySourcePath', gallerySourcePath)
    // console.log('originalFiles', originalFiles[0])

    await Promise.map(originalFiles, async (originalFile) => {
        console.log('originalFile', originalFile)
        const fileMeta = await processFile(originalFile);
        if (fileMeta) {
          fileCollectionFiles.push(fileMeta);
        }

    });
    console.log('fileCollectionFiles', fileCollectionFiles)
    if (fileCollectionFiles.length > 0) {
      const fileCollection = {
        name: "Example",
        files: fileCollectionFiles,
      }
      const gallery = ReactDOMServer.renderToString(<Gallery fileCollection={fileCollection}></Gallery>)
      const css = `<link rel="stylesheet" type="text/css" href="./style.css">`
      await fsPromises.writeFile('./dist/gallery.html', `${css}${gallery}`);

      console.log('gallery', gallery)
    }

    // const gallery = ReactDOMServer.renderToString(<Gallery></Gallery>)
    // console.log('gallery', gallery)
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