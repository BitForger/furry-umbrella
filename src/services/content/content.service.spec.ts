import { Test, TestingModule } from '@nestjs/testing';
import { ContentService } from './content.service';
import { HttpModule } from '@nestjs/common';

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [ContentService],
    }).compile();

    service = module.get<ContentService>(ContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#getById', () => {
    it('should return a valid response from the acoustic api when a valid id is passed', async () => {
      const result = await service.getById('277004d0-fe6e-42c1-96be-403da85aba80');
      expect(result).toBeDefined();
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('id');
    });

    it('should throw an error when an id isn\'t found', async () => {
      let result;
      let error;
      try {
        result = await service.getById('277004d0-fe6e-42c1-96be-403da85aba81');
      } catch (e) {
        error = e;
        // NOTE: catches and logs in here but whenever I try to run it properly in Jest
        //  it keeps saying that the passed value is an object and not an error
        //  Essentially it just never catches an error for some reason so I'm going to do
        //  this and just check the value of the object. It's probably something weird Axios
        //  is doing to the returned value when awaiting the promise

      }
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('response');
      expect(error.response).toHaveProperty('status');
    });
  });

  describe('#getFields', () => {
    const properties = ['prop1', 'prop2', 'prop4', 'prop5'];
    const object = {
      prop1: 'hello',
      prop2: 393883,
      prop3: 'some more text',
      prop4: false,
      prop5: {
        aNestedObject: 'hello',
      },
    };
    it('should return an object with just the properties passed in', () => {
      const result = service.getFields(properties, object);
      expect(result).toHaveProperty('prop1', 'hello');
      expect(result).toHaveProperty('prop2', 393883);
      expect(result).toHaveProperty('prop4', false);
      expect(result).toHaveProperty('prop5', {aNestedObject: 'hello'});
    });

    it('should return false when no properties are found in the object', () => {
      const result = service.getFields(['prop6', 'prop7'], object);
      expect(result).toBeFalsy();
    });

    it('should return an array of objects that only contain specified properties', () => {
      const objArray = [];
      for (let i = 0; i < 5; i++) {
        objArray.push(object);
      }

      const result = service.getFields(properties, objArray);
      expect(result).toEqual(expect.arrayContaining([{prop1: 'hello', prop2: 393883, prop4: false, prop5: {aNestedObject: 'hello'}}]));
    });

    it('should return empty objects when an array of objects don\'t contain any specified properties', () => {
      // NOTE: in hindsight this architecture isn't good at all.
      //   I would rewrite this to somehow validate that the values being returned
      //   valid and return a single boolean false instead of an array of blank objects
      const objArray = [];
      for (let i = 0; i < 5; i++) {
        objArray.push(object);
      }
      const result = service.getFields(['prop6', 'prop7'], objArray);
      expect(result).toEqual(expect.arrayContaining([{}]));
    });
  });

  describe('#getContentUrl', () => {
    it('should return a string with the id value passed', () => {
      const result = service.getContentUrl('some-id');
      expect(result).toEqual(expect.stringContaining('some-id'));
    });
  });

  describe('#buildMap', () => {
    const properties = ['prop1', 'prop2', 'prop4', 'prop5'];
    const object = {
      prop1: 'hello',
      prop2: 393883,
      prop3: 'some more text',
      prop4: false,
      prop5: {
        aNestedObject: 'hello',
      },
    };
    it('should return an object with the properties specified', () => {
      const result = service.buildMap(properties, object);
      expect(result).toEqual({prop1: 'hello', prop2: 393883, prop4: false, prop5: {aNestedObject: 'hello'}});
    });

    it('should return false when no specified properties are found', () => {
      const result = service.buildMap(['prop6', 'prop7'], object);
      expect(result).toEqual(false);
    });
  });
});
