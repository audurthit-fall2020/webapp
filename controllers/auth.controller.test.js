const httpMocks = require('node-mocks-http');
const authController = require('./auth.controller');
const AppError= require('../util/apperror');
describe('authcontroller test', () => {
    let next;
    let res;
    beforeEach(()=>{
    res = httpMocks.createResponse(); 
    next= jest.fn().
                    mockImplementation(err=>res.status(err.statusCode).json({message:err.message}));
    })
    afterAll(() => {    
      jest.restoreAllMocks();
    });    
    test('authenticate middleware without authorization header', async () => {
        const req=httpMocks.createRequest({
            url:`/v1/user/self`,
            method:'GET'
        })
        
        jest.spyOn(authController,'authenticate').mockImplementation((req,res,next)=>Promise.resolve(next(new AppError(401,'Unauthenticated'))));

        await authController.authenticate(req,res,next);
        expect(res.statusCode).toBe(401);
    })
    test('test for encoding and decoding base64',()=>{
      const enc= new Buffer.from('test@abc.com:Test@1234').toString('base64');
      const dec=new Buffer.from(enc,'base64').toString('ascii');
      expect(dec).toBe('test@abc.com:Test@1234');
    })
    test('test for logging in with wrong credentials',async()=>{
      const enc= new Buffer.from('xyz@shd.com:Test@1234').toString('base64');
      const req=httpMocks.createRequest({
        url:`/v1/user/self`,
        headers:{
          authorization : `Basic ${enc}`
        },
        method:'GET'
    })
    jest.spyOn(authController,'authenticate').mockImplementation((req,res,next)=>Promise.resolve(next(new AppError(401,'Unauthenticated'))));

    await authController.authenticate(req,res,next);
    expect(res.statusCode).toBe(401);
    })
    test('test for logging in with correct credentials',async()=>{
      next= jest.fn().mockImplementation(()=>null)
      const enc= new Buffer.from('test@abc.com:Test@1234').toString('base64');
      const req=httpMocks.createRequest({
        url:`/v1/user/self`,
        headers:{
          authorization : `Basic ${enc}`
        },
        method:'GET'
    })
    const fn=jest.spyOn(authController,'authenticate').mockImplementation((req,res,next)=>Promise.resolve(next()));
    await authController.authenticate(req,res,next);
    fn.mockRestore();
    expect(next.mock.calls.length).toBe(1);
    })
})
