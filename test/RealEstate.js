const {expect} = require('chai');
const {ethers} = require('hardhat');

const tokens = (n) =>{
    return ethers.utils.parseUnits(n.toString(), 'ether');
}

const ether = tokens;

describe('RealEstate', ()=>{
    let realEstate, escrow;
    let deployer,seller;
    let nftID = 1;
    let purchasePrice = ether(100);
    let escrowAmount = ether(20);

    beforeEach(async () =>{
        //setup accounts
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        seller = deployer
        buyer = accounts[1]
        inspector = accounts[2]
        lender = accounts[3]



        //Load Contracts
        const RealEstate = await ethers.getContractFactory('RealEstate');
        const Escrow = await ethers.getContractFactory('Escrow');


        //Deploy contracts
        realEstate = await RealEstate.deploy();
        escrow = await Escrow.deploy(
            realEstate.address,
            nftID,
            purchasePrice,
            escrowAmount,
            seller.address,
            buyer.address,
            inspector.address,
            lender.address
        )



        //seller now approves NFT
        transaction = await realEstate.connect(seller).approve(escrow.address, nftID)
        await transaction.wait();


    })


    describe('Deployment', async()=>{

        it('sends an NFT to seller/deployer', async() =>{
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);
        })
    })

    //selling the Real Estate

    describe('Selling the RealEstate', async() =>{

        let transaction, balance

        it('executes a successfull transaction', async()=>{
            //Expect seller to be NFT owner before the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(seller.address)

            //checks the escrow balance
            balance = await escrow.getBalance()
            console.log("escrow balance: ", ethers.utils.formatEther(balance));

            //buyer deposits the earnest
            transaction = await escrow.connect(buyer).depositEarnest({ value: ether(20)})
            console.log("buyer deposits earnest money");
            
            
            //checks the escrow balance
            balance = await escrow.getBalance()
            console.log("escrow balance: ", ethers.utils.formatEther(balance));
            
            //Inspector update status
            transaction = await escrow.connect(inspector).updateInspectionStatus(true)
            await transaction.wait()
            console.log("Inspector updates Status");

            //buyer approves sale
            transaction = await escrow.connect(buyer).approveSale()
            await transaction.wait()
            console.log("Buyer approves sale");
            
            //seller approves sale
            transaction = await escrow.connect(seller).approveSale()
            await transaction.wait()
            console.log("seller approves sale")

            //lender funds the sale
            transaction = await lender.sendTransaction({ to: escrow.address, value: ether(80) });

            //lender approves sale
            transaction = await escrow.connect(lender).approveSale()
            await transaction.wait()
            console.log("lender approves sale");
            



            //Finsalize the sale
            transaction = await escrow.connect(buyer).finalizeSale()
            await transaction.wait();
            console.log("Buyer Finalizes the sale");

            //Expects buyer is the owner of the NFT after the sale
            expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address)

            //Expects seller to recieve funds
            balance = await ethers.provider.getBalance(seller.address)
            console.log("Seller balance: ", ethers.utils.formatEther(balance));
            expect(balance).to.be.above(ether(10099))
            

            
        })
    })
})