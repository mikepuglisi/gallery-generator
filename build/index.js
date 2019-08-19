"use strict";

var _react = _interopRequireDefault(require("react"));

var _gallery = _interopRequireDefault(require("./components/gallery"));

var _server = _interopRequireDefault(require("react-dom/server"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const prompts = require('prompts');

const mime = require('mime-types');

var pretty = require('pretty');

(async () => {
  const sourcePathInput = await prompts({
    type: 'text',
    name: 'value',
    default: "./",
    message: 'Paste the directory of the full size images you wish to convert to a gallery. (Default: Current Directory)' // validate: value => value < 18 ? `Nightclub is 18+ only` : true

  });
  const relativeBasePathInput = await prompts({
    type: 'text',
    name: 'value',
    default: "./",
    message: 'Relative Path from which images are served (Default: ./assets/gallery)' // validate: value => value < 18 ? `Nightclub is 18+ only` : true

  });
  const gallerySourcePath = sourcePathInput.value ? sourcePathInput.value : './';
  const THUMBNAIL_WIDTH = 400;
  const THUMBNAIL_HEIGHT = 300;

  const fs = require('fs');

  const fsPromises = require('fs').promises;

  const url = require('url');

  const path = require('path');

  const Promise = require('bluebird');

  const mkdirp = require('mkdirp-promise');

  var Jimp = require('jimp');

  function fileExistsCheck(filepath) {
    return new Promise((resolve, reject) => {
      fs.access(filepath, fs.F_OK, error => {
        resolve(!error);
      });
    });
  }

  async function walk(dir, fileList = []) {
    const files = await fsPromises.readdir(dir);

    for (const file of files) {
      const stat = await fsPromises.stat(path.join(dir, file));

      if (stat.isDirectory()) {
        if (file !== 'output') {
          fileList = await walk(path.join(dir, file), fileList);
        }
      } else if (`${mime.lookup(file)}`.indexOf('image') === 0) {
        fileList.push(path.join(dir, file));
      }
    }

    return fileList;
  }

  const processFile = async filePath => {
    const relativeBasePath = relativeBasePathInput.value ? relativeBasePathInput.value : "./assets/gallery";
    const thumbnailSuffix = '_thumb';
    const tinySuffix = '_tiny';
    const httpRelativePathBase = `${relativeBasePath.replace(/\\/g, '/')}`.toLowerCase();
    const destinationPath = path.join(gallerySourcePath, "output"); // path.dirname(path.join('./dist', baseDirectory, relative))

    await mkdirp(destinationPath);
    const ext = path.extname(filePath).toLowerCase();
    var filename = path.basename(filePath, ext).toLowerCase();
    const fileNameFullSize = `${filename}${ext}`;
    const fileNameThumbnail = `${filename}${thumbnailSuffix}${ext}`;
    const fileNameTiny = `${filename}${tinySuffix}${ext}`;
    return Jimp.read(filePath).then(async jimpFile => {
      const fullWidth = jimpFile.bitmap.width;
      const fullHeight = jimpFile.bitmap.height;
      const targetPathFullSize = path.join(destinationPath, fileNameFullSize).toLowerCase();

      if (!(await fileExistsCheck(targetPathFullSize))) {
        await jimpFile // .resize(256, 256) // resize
        .quality(70) // set JPEG quality
        // .greyscale() // set greyscale
        .write(targetPathFullSize);
      }

      const targetPathThumbnail = path.join(destinationPath, fileNameThumbnail).toLowerCase();

      if (!(await fileExistsCheck(targetPathThumbnail))) {
        await jimpFile.clone().cover(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT).write(targetPathThumbnail);
      }

      const targetPathTiny = path.join(destinationPath, fileNameTiny).toLowerCase();

      if (!(await fileExistsCheck(targetPathTiny))) {
        await jimpFile.clone().resize(Jimp.AUTO, 40).write(targetPathTiny);
      }

      return {
        url: `${httpRelativePathBase}/${fileNameFullSize}`,
        width: fullWidth,
        height: fullHeight,
        thumbnail: {
          url: `${httpRelativePathBase}/${fileNameThumbnail}`,
          width: THUMBNAIL_WIDTH,
          height: THUMBNAIL_HEIGHT
        },
        tiny: {
          url: `${httpRelativePathBase}/${fileNameTiny}`
        }
      };
    }).catch(err => {
      console.error(err);
    });
  };

  walk(gallerySourcePath).then(async originalFiles => {
    const fileCollectionFiles = [];
    await Promise.map(originalFiles, async originalFile => {
      console.log('originalFile', originalFile);
      const fileMeta = await processFile(originalFile);

      if (fileMeta) {
        fileCollectionFiles.push(fileMeta);
      }
    });

    if (fileCollectionFiles.length > 0) {
      const fileCollection = {
        name: "Example",
        files: fileCollectionFiles
      };

      const gallery = _server.default.renderToString(_react.default.createElement(_gallery.default, {
        fileCollection: fileCollection
      }));

      const css = `<link rel="stylesheet" type="text/css" href="./style.css">`;
      await fsPromises.writeFile(path.join(gallerySourcePath, "output", "gallery.html"), `${css}${pretty(gallery)}`);
      console.log("Image and HTML writen to " + path.join(gallerySourcePath, "output"));
    }
  });
})();