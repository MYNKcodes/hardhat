const {expect} = require('chai');
const {ethers} = require('hardhat');
describe ('Counter', () => {

    let counter
    beforeEach(async () => {
        const Counter = await ethers.getContractFactory('Counter');
        counter = await Counter.deploy('My Counter',1);
    })
    
    describe('Deployment', () => {
        it('sets the initial count', async () =>{
            const count = await counter.count();
            expect(count).to.equal(1);
            //fetch the count
            //check the count to make sure it's what we expect
        })
    
        it('sets the initial name', async () =>{
            const name = await counter.name();
            expect(name).to.equal('My Counter');
            //fetch the name
            //check the name to make sure it's what we expect
        })
    })
    describe('Counting', () =>{
        let transaction;

        it('reads the count from"count"public variable', async()=>{
            expect(await counter.count()).to.equal(1);
        })

        it('reads from the "getCount()"function', async() =>{
            expect(await counter.getCount()).is.equal(1);
        })


        it('increments the count', async()=>{
            transaction = await counter.increment();
            await transaction.wait();
            expect(await counter.count()).to.equal(2);

            //increment one more
            transaction = await counter.increment()
            await transaction.wait();
            expect(await counter.count()).is.equal(3);
        })

        it('Decrements the count', async() =>{
            transaction = await counter.decrement();
            await transaction.wait();
            expect(await counter.count()).is.equal(0);

            //cannot decrement count below 0
            await expect(counter.decrement()).to.be.reverted;
        })

        it('reads the name from "name" public variable', async() =>{
            expect(await counter.name()).to.equal('My Counter');
        })

        it('reads the name from "getName()" function', async() =>{
            expect(await counter.getName()).to.equal('My Counter');
        })


        it('updates the name', async()=>{
            transaction = await counter.setName('New Counter');
            await transaction.wait();
            expect(await counter.name()).is.equal('New Counter');
        })

    })

})