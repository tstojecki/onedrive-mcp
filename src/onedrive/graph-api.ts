import axios from 'axios';
import { config } from '../config.js';

export interface GraphAPIResponse {
  [key: string]: any;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface QueryParams {
  [key: string]: string | number | boolean;
}

export interface Headers {
  [key: string]: string;
}

export async function invokeGraphApi(
  accessToken: string,
  method: HttpMethod,
  path: string,
  data: any = null,
  queryParams: QueryParams = {},
  headers: Headers = {}
): Promise<GraphAPIResponse> {
  const encodedPath = path.split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  
  const url = `${config.onedrive.graphApiEndpoint}${encodedPath}`;
  
  const options = {
    method,
    url,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...headers
    },
    params: queryParams,
    data: data
  };

  console.log('request -> ' + url);

  try {
    const response = await axios(options);
    return response.data;
  } catch (error: any) {
    console.log(error);
    
    if (error.response?.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    
    const status = error.response?.status || 'unknown';
    const message = error.response?.data?.error?.message || error.message;
    throw new Error(`API call failed with status ${status}: ${message}`);
  }
}