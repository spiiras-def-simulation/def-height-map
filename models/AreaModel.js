const { exec } = require('child_process');

const Model = require('./Model');

const { mapObject } = require('./helpers');

const mapAreaObject = { type: 'type', coordinates: 'area' };

const queues = { GET_OBJECTS: 'get_uav_regions_rpc', ADD_OBJECTS: 'add_regions_rpc' };

class AreaModel extends Model {
  async getAreas() {
    const dataResponse = await this.getData({
      queue: queues.GET_OBJECTS,
      message: { type: 'ban' },
    });

    if (this.checkFailedResponse(dataResponse)) return [];

    return Object.entries(dataResponse).map(([id, value]) => {
      const data = mapObject(value, mapAreaObject);
      return { id, ...data };
    });
  }

  async addAreas(areas) {
    const input = { ban: Object.values(areas) };

    const dataResponse = await this.getData({ queue: queues.ADD_OBJECTS, message: { ...input } });

    if (this.checkFailedResponse(dataResponse)) return null;

    return dataResponse;
  }

  analyseHeights(analyser, map, distance, scale, height) {
    return new Promise((resolve, reject) => {
      const command = `py ${analyser} ${map} ${distance} ${scale} ${height}`;
      exec(command, (error, stdout, stderr) => {
        if (error) reject(error);
        if (stderr) reject(stderr);
        resolve(stdout);
      });
    });
  }

  checkFailedResponse(response) {
    return !response || response.status === 'error' || response.status === 'Not found';
  }
}

module.exports = AreaModel;
