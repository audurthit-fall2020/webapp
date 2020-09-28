const httpMocks= require('node-mocks-http');
const validators= require('../util/validators');
describe('usercontroller test',()=>{
    test('user middleware testing for valid password',()=>{
        // Only numbers
        let password='12344566';
        expect(validators.validatePassword(password)).toBe(false);
        // Only small letters and numbers
        password='test1234';
        expect(validators.validatePassword(password)).toBe(false);
        // Missing special characters
        password='Test1234';
        expect(validators.validatePassword(password)).toBe(false);
        // Correct password
        password=`Test@1234`
        expect(validators.validatePassword(password)).toBe(true);
    })
    test('user middleware testing for valid email',()=>{
        let email='test.com';
        expect(validators.validateEmail(email)).toBe(false);
        email='test1234.com';
        expect(validators.validateEmail(email)).toBe(false);
        email='test@abc.com'
        expect(validators.validateEmail(email)).toBe(true);
    })
    
})