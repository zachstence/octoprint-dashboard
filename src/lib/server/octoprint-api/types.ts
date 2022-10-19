export interface IApiVersion {
    api: string;
    server: string;
    text: string;
  }
  
  export interface IOctoprintGetRequest {
    url: string;
    options: {
      headers: {
        [name: string]: string;
      };
    };
  }
  
  export interface IPrinterTools {
    [name: string]: IPrinterToolProperties;
  }
  
  export interface IPrinterToolProperties {
    target: number;
    actual: number;
    offset: number;
  }
  
  export interface IPrinterStatus {
    flags: {
      cancelling: boolean;
      closedOrError: boolean;
      error: boolean;
      finishing: boolean;
      operational: boolean;
      paused: boolean;
      pausing: boolean;
      printing: boolean;
      ready: boolean;
      resuming: boolean;
    };
    text: string;
    tools: IPrinterTools;
    bed: IPrinterToolProperties;
  }
  
  export interface ICamera {
    name: string;
    url: string;
  }
  
  export interface IJob {
    job: IJobDetails;
    progress: IJobProgress;
    state: JobState;
  }
  
  export interface IJobDetails {
    averagePrintTime: number | null;
    estimatedPrintTime: number | null;
    filament: IJobToolInfo;
    file: IJobFile;
    lastPrintTime: number | null;
    user: string | null;
  }
  
  export interface IJobProgress {
    completion: number | null;
    filepos: number | null;
    printTime: number | null;
    printTimeLeft: number | null;
    printTimeLeftOrigin: string | null;
  }
  
  export interface IJobToolInfo {
    [name: string]: {
      length: number;
      volume: number;
    };
  }
  
  export interface IJobFile {
    date: number | null;
    display: string | null;
    name: string | null;
    origin: string | null;
    path: string | null;
    size: number | null;
  }
  
  export type JobState = 'Operational' | 'Offline' | 'Printing';