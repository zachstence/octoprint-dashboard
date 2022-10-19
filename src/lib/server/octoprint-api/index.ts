import {has} from 'ramda';
import fetch from 'cross-fetch';
import url from 'url';
import type {
  IPrinterStatus,
  IPrinterTools,
  ICamera,
  IOctoprintGetRequest,
  IApiVersion,
  IJob,
} from './types';

export class OctoprintApi {
  public apiKey: string;
  public apiPath: string;

  constructor(key: string, path: string) {
    this.apiKey = key;
    this.apiPath = path;
  }

  /**
   * Return the API version of the Octoprint server.
   */
  public async getVersion(): Promise<IApiVersion> {
    const request = this.buildGetRequest('version');

    return new Promise((resolve, reject) => {
      fetch(request.url, request.options)
        .then(response => resolve(response.json()))
        .catch(error => reject(error));
    });
  }

  /**
   * Return basic status of the printer, including a list of tools
   * and their tempratures in addition to any operational flags the
   * printer has emitted.
   */
  public getStatus(): Promise<IPrinterStatus> {
    const request = this.buildGetRequest('printer?history=false,exclude=sd');
    return new Promise((resolve, reject) => {
      fetch(request.url, request.options)
        .then(async response => {
          const responseObj = await response.json();

          const status: IPrinterStatus = {
            flags: {
              cancelling: responseObj.state.flags.cancelling,
              closedOrError: responseObj.state.flags.closedOrError,
              error: responseObj.state.flags.error,
              finishing: responseObj.state.flags.finishing,
              operational: responseObj.state.flags.operational,
              paused: responseObj.state.flags.paused,
              pausing: responseObj.state.flags.pausing,
              printing: responseObj.state.flags.printing,
              ready: responseObj.state.flags.ready,
              resuming: responseObj.state.flags.resuming,
            },
            text: responseObj.state.text,
            tools: this._getTools(responseObj.temperature),
            bed: {
              target: responseObj.temperature.bed.target,
              actual: responseObj.temperature.bed.actual,
              offset: responseObj.temperature.bed.offset,
            },
          };
          resolve(status);
        })
        .catch(error => reject(error));
    });
  }

  /**
   * Returns only tools that have the name 'tool', returning an
   * object without beds.
   * @param toolDict Object containing tools.
   */
  private _getTools(toolDict: IPrinterTools): IPrinterTools {
    const tools: IPrinterTools = {};

    const retrieveTool = (toolNumber = 0): void => {
      const toolName = `tool${toolNumber}`;
      const hasTool = has(toolName);

      if (hasTool(toolDict)) {
        tools[toolName] = {
          target: toolDict[toolName].target,
          actual: toolDict[toolName].actual,
          offset: toolDict[toolName].offset,
        };
        retrieveTool(toolNumber + 1);
      }
    };
    retrieveTool();
    return tools;
  }

  /**
   * Retrieve cameras. If the multicam plugin is installed,
   * all listed cameras are retrieved.
   */
  public getCameras(): Promise<ICamera[]> {
    const request = this.buildGetRequest('settings');

    return new Promise((resolve, reject) => {
      fetch(request.url, request.options)
        .then(async response => {
          const responseObj = await response.json();
          const hasMulticamPlugin = has('multicam');
          const cameras: ICamera[] = [];

          if (hasMulticamPlugin(responseObj.plugins)) {
            responseObj.plugins.multicam.multicam_profiles.forEach((camera: any) => {
              const cam = url.parse(camera.URL);
              cameras.push({
                name: camera.name,
                url: cam.hostname ? camera.URL : `${this.apiPath}${camera.URL}`,
              });
            });
          } else {
            cameras.push({
              name: 'default',
              url: responseObj.webcam.snapshotUrl,
            });
          }
          resolve(cameras);
        })
        .catch(error => reject(error));
    });
  }

  /**
   * Retrieve specific camera by index.
   * @param cameraId index of camera
   */
  public getCamera(cameraId: number): Promise<ICamera> {
    return new Promise((resolve, reject) => {
      if (isNaN(cameraId)) {
        reject('Invalid camera ID - must be a integer');
        return;
      }

      this.getCameras().then(r => {
        if (!r.length || cameraId > r.length) {
          reject('Invalid camera ID. No camera exists with that index.');
          return;
        }
        console.log(r[cameraId]);
        resolve(r[cameraId]);
      });
    });
  }

  /**
   * Return the status of a currently running job
   */
  public getJobInfo(): Promise<IJob> {
    const request = this.buildGetRequest('job');
    return new Promise((resolve, reject) => {
      fetch(request.url, request.options)
        .then(async response => {
          const json = await response.json();
          resolve(json);
        })
        .catch(error => reject(error));
    });
  }

  public getLogs(): Promise<any> {
    const request = {
      url: `${this.apiPath}/plugin/logging/logs`,
      options: {
        headers: {
          'X-Api-Key': `${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    };

    return new Promise((resolve, reject) => {
      fetch(request.url, request.options)
        .then(async response => {
          const json = await response.json();
          resolve(json);
        })
        .catch(error => reject(error));
    });
  }

  /**
   * Build a get request options object to query the octoprint api
   * @param path Api path to query
   */
  private buildGetRequest(path: string): IOctoprintGetRequest {
    return {
      url: `${this.apiPath}/api/${path}`,
      options: {
        headers: {
          'X-Api-Key': `${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      },
    };
  }
}