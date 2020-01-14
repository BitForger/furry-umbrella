import { HttpService, Injectable, NotFoundException } from '@nestjs/common';
import { AxiosResponse } from 'axios';

@Injectable()
export class ContentService {
  private apiDomain = 'https://my12.digitalexperience.ibm.com';
  private apiAccount = '859f2008-a40a-4b92-afd0-24bb44d10124';
  private apiBaseString =
    `${this.apiDomain}/api/${this.apiAccount}/`;
  constructor(private readonly httpService: HttpService) {
  }

  public getById(id: string): Promise<AxiosResponse> {
    return this.httpService.get(this.getContentUrl(id)).toPromise();
  }

  public async searchByType(contentId: string) {
    const response = await this.httpService.get(this.getSearchUrl(contentId)).toPromise();
    if (response.data?.numFound < 1) {
      throw new NotFoundException();
    }
    return this.getFields(['id', 'created', 'name', 'url'], response.data.documents);
  }

  /**
   * Takes in an object or array of objects and filters the objects down to just
   * the properties specified in the array passed to it
   * @param properties The properties you want in the return object[s]
   * @param data The object or array of objects you want to filter properties out of
   */
  public getFields(properties: string[],
                   data: {[s: string]: any} |
                     Array<{[s: string]: string}>): {[s: string]: any}|Array<{[s: string]: any}>|false {
    const returnHash: {[str: string]: string} = {};
    if (!Array.isArray(data)) {
      const dataKeysList = Object.keys(data);

      for (const prop of properties) {
        if (dataKeysList.includes(prop)) {
          returnHash[prop] = data[prop];
        }
      }

      if (data.type?.toLowerCase() === 'hero image') {
        returnHash.image = `${this.apiDomain}${data.elements.image.url}`;
      }

      return Object.keys(returnHash).length < 1 ? false : returnHash;
    } else {
      return data.map((value, index) => {
        const propertiesCopy = [...properties];
        const buildMap = this.buildMap(propertiesCopy, value);
        return buildMap || {};
      });
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
  public buildMap(propertiesList: string[],
                  object: {[s: string]: any},
                  iteration: number = 0,
                  returnMap: {[str: string]: string} = {}): {[str: string]: string} | false {
    const prop = propertiesList.shift();
    if (Object.keys(object).includes(prop)) {
      returnMap[prop] = object[prop];
    } else if (!Object.keys(object).includes(prop) && prop === 'url') {
      returnMap.url = `${this.apiBaseString}delivery/v1/content/${object.id}`;
    }

    if (propertiesList.length > 0) {
      return this.buildMap(propertiesList, object, (iteration + 1), returnMap);
    } else if (Object.keys(returnMap).length > 0) {
      return returnMap;
    } else {
      return false;
    }
  }

  public getContentUrl(id): string {
    return `${this.apiBaseString}delivery/v1/content/${id}`;
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
