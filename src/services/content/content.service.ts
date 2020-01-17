import { HttpService, Injectable, NotFoundException } from '@nestjs/common';
import { AxiosResponse } from 'axios';

@Injectable()
export class ContentService {
  // normally I would store this as an environment variable but seeing as it's
  // not sensitive (as far as I can tell) I'm going to leave it in the code here
  private apiDomain = 'https://my12.digitalexperience.ibm.com';
  private apiAccount = '859f2008-a40a-4b92-afd0-24bb44d10124';
  private apiBaseString =
    `${this.apiDomain}/api/${this.apiAccount}/`;
  constructor(private readonly httpService: HttpService) {
  }

  public getById(id: string, fields?: string): Promise<AxiosResponse> {
    return this.httpService.get(this.getContentUrl(id, fields)).toPromise();
  }

  /**
   * Search for query and return filtered fields
   * @param contentId
   */
  public async searchByType(contentId: string) {
    const response = await this.httpService.get(this.getSearchUrl(contentId)).toPromise();
    if (response.data?.numFound < 1) {
      throw new NotFoundException();
    }
    return await this.getFields(['id', 'created', 'name', 'url'], response.data.documents);
  }

  /**
   * Takes in an object or array of objects and filters the objects down to just
   * the properties specified in the array passed to it
   * @param properties The properties you want in the return object[s]
   * @param data The object or array of objects you want to filter properties out of
   */
  public async getFields(properties: string[],
                         data: {[s: string]: any} | Array<{[s: string]: string}>):
                          Promise<{ [s: string]: any } | Array<{ [s: string]: any }> | false> {
    const returnObj: {[str: string]: string} = {};
    if (!Array.isArray(data)) {
      const dataKeysList = Object.keys(data);

      // iterate through list of properties to find and return, if they exist,
      // add to return object
      for (const prop of properties) {
        if (dataKeysList.includes(prop)) {
          returnObj[prop] = data[prop];
        }
      }

      if (data.type?.toLowerCase() === 'hero image') {
        returnObj.image = `${this.apiDomain}${data.elements.image.url}`;
      }

      return Object.keys(returnObj).length < 1 ? false : returnObj;
    } else {
      const returnArray = [];
      for (const obj of data) {
        const propertiesCopy = [...properties];
        const buildMap = await this.buildMap(propertiesCopy, obj);
        returnArray.push(buildMap || {});
      }
      return returnArray;
    }
  }

  /**
   * Recursive function run inside of array#map function to take an object and
   * filter out the properties that aren't defined in a passed list
   * @param propertiesList
   * @param object
   * @param iteration
   * @param returnMap
   */
  public async buildMap(propertiesList: string[],
                        object: {[s: string]: any},
                        iteration: number = 0,
                        returnMap: {[str: string]: any} = {}): Promise<{ [str: string]: any } | false> {
    const prop = propertiesList.shift();
    if (Object.keys(object).includes(prop)) {
      returnMap[prop] = object[prop];
    } else if (!Object.keys(object).includes(prop) && prop === 'url') {
      returnMap.url = `${this.apiBaseString}delivery/v1/content/${object.id}`;
    }

    // if we're getting an array of hero images make sure to get the resource
    //   url to the hero image so we can render on the page
    //   This is pretty inefficient
    if (object.type?.toLowerCase() === 'hero image') {
      const fullObject = await this.getById(object.id, 'elements');
      returnMap.image = fullObject.data.elements?.image?.url ? `${this.apiDomain}${fullObject.data.elements?.image?.url}` : false;
    }

    if (propertiesList.length > 0) {
      return this.buildMap(propertiesList, object, (iteration + 1), returnMap);
    } else if (Object.keys(returnMap).length > 0) {
      return returnMap;
    } else {
      return false;
    }
  }

  /**
   * Returns a constructed url for retrieving a specific content item by id
   * Can optionally add comma-separated string of fields to shrink response
   * @param id
   * @param fields
   */
  public getContentUrl(id, fields?: string): string {
    return `${this.apiBaseString}delivery/v1/content/${id}${fields ? `?fields=${fields}` : ''}`;
  }

  public getSearchUrl(id: string): string {
    if (id === 'image' || id === 'file') {
      return `${this.apiBaseString}delivery/v1/search?q=*:*&fq=assetType:${id}`;
    } else if (id === 'hero image') {
      return `${this.apiBaseString}delivery/v1/search?q=*:*&fq=classification:content&fq=type:${id.replace(' ', '\\%20')}`;
    } else {
      return `${this.apiBaseString}delivery/v1/search?q=*:*&fq=type:${id}`;
    }
  }
}
