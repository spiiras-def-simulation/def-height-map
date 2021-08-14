const express = require('express');
const fs = require('fs');
const path = require('path');
const jimp = require('jimp');
const multer = require('multer');

const upload = multer();

const router = express.Router();

router.get('/mapConfig', function (req, res) {
  res.status(200).sendFile(path.join(req.pathStorage, 'mapConfig.json'));
});

router.post('/mapConfig', upload.none(), function (req, res) {
  const { pathStorage } = req;

  const validate = ({ centerLongitude, centerLatitude, distance, scale, height }) =>
    parseFloat(centerLongitude) &&
    parseFloat(centerLatitude) &&
    parseFloat(distance) &&
    parseFloat(scale) &&
    parseFloat(height);

  if (validate(req.body)) {
    const { centerLatitude, centerLongitude, distance, scale, height } = req.body;

    const existStorage = fs.existsSync(pathStorage) && fs.lstatSync(pathStorage).isDirectory();
    if (!existStorage) {
      fs.mkdirSync(pathStorage);
    }

    fs.writeFile(
      path.join(pathStorage, 'mapConfig.json'),
      Buffer.from(
        JSON.stringify({
          center: {
            x: parseFloat(centerLatitude),
            y: parseFloat(centerLongitude),
          },
          distance: parseFloat(distance),
          scale: parseFloat(scale),
          height: parseFloat(height),
        }),
      ),
      (err) => {
        if (err) throw err;

        res.status(200).send('Параметры карты обновлены');
      },
    );
  } else {
    res.status(403).send('Заданы неверные параметры');
  }
});

router.get('/mapImage', function (req, res) {
  res.status(200).sendFile(path.join(req.pathStorage, 'mapImage.jpg'));
});

router.post('/mapImage', upload.single('map'), async function (req, res, next) {
  const { pathStorage } = req;

  const existStorage = fs.existsSync(pathStorage) && fs.lstatSync(pathStorage).isDirectory();
  if (!existStorage) {
    fs.mkdirSync(pathStorage);
  }

  const image = await jimp.read(req.file.buffer);
  await image.write(path.join(pathStorage, 'mapImage.jpg'));

  res.status(200).send('Изображение карты обновлено');
});

router.get('/areas', async function (req, res) {
  const { areaModel } = req.models;
  try {
    const result = await areaModel.getAreas();
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(403).send('Не удалось получить список зон');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post('/areas', async function (req, res) {
  const { areaModel } = req.models;
  const areas = JSON.parse(req.body.areas);
  try {
    const result = await areaModel.addAreas(areas);
    if (result) {
      res.status(200).send(result);
    } else {
      res.status(403).send('Не удалось добавить непроходимые зоны');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get('/analyseHeights', async function (req, res) {
  try {
    const { areaModel } = req.models;
    const { pathAnalyser: analyser } = req;

    const map = path.join(req.pathStorage, 'mapImage.jpg');

    const mapConfigFile = fs.readFileSync(path.join(req.pathStorage, 'mapConfig.json'));
    const { distance, scale, height } = JSON.parse(mapConfigFile);

    const result = await areaModel.analyseHeights(analyser, map, distance, scale, height);

    if (result) {
      res.status(200).send(result);
    } else {
      res.status(403).send('Не удалось выполнить поиск непроходимых зон на карте');
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
