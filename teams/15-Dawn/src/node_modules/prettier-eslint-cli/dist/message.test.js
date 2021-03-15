"use strict";

var messages = _interopRequireWildcard(require("./messages"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/*eslint import/namespace: [2, { allowComputed: true }]*/
const tests = {
  success: [{
    input: {
      success: 'success',
      count: 1,
      countString: '1String'
    },
    output: 'success formatting 1String file with prettier-eslint'
  }, {
    input: {
      success: 'success',
      count: 3,
      countString: '3String'
    },
    output: 'success formatting 3String files with prettier-eslint'
  }],
  failure: [{
    input: {
      failure: 'failure',
      count: 1,
      countString: '1String'
    },
    output: 'failure formatting 1String file with prettier-eslint'
  }, {
    input: {
      failure: 'failure',
      count: 3,
      countString: '3String'
    },
    output: 'failure formatting 3String files with prettier-eslint'
  }],
  unchanged: [{
    input: {
      unchanged: 'unchanged',
      count: 1,
      countString: '1String'
    },
    output: '1String file was unchanged'
  }, {
    input: {
      unchanged: 'unchanged',
      count: 3,
      countString: '3String'
    },
    output: '3String files were unchanged'
  }]
};
Object.keys(tests).forEach(messageKey => {
  tests[messageKey].forEach(({
    input,
    output
  }) => {
    test(`${messageKey} ${JSON.stringify(input)}`, () => {
      expect(messages[messageKey](input)).toEqual(output);
    });
  });
});