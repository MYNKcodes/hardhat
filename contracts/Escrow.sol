//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 id) external;
}

contract Escrow{

    address public nftAddress;
    uint256 public nftID;
    uint256 public purchasePrice;
    uint256 public escrowAmount;
    address payable public seller;
    address payable public buyer;
    address public inspector;
    address public lender;


    modifier onlyBuyer(){
        require(msg.sender == buyer,"Only buyer can call this function");
        _;
    }
    modifier onlyInspector(){
        require(msg.sender == inspector,"Only Inspector can call this function");
        _;
    }


    bool public inspectionPassed = false;
    mapping(address => bool) public approval;

    receive() external payable {} //enables the contract to recieve amount

    constructor(
    address _nftAddress,
    uint256 _nftID,
    uint256 _purchasePrice,
    uint256 _escrowAmount,
    address payable _seller,
    address payable _buyer,
    address _inspector,
    address _lender
    ) {
        nftAddress = _nftAddress;
        nftID = _nftID;
        purchasePrice = _purchasePrice;
        escrowAmount = _escrowAmount;
        seller = _seller;
        buyer = _buyer;
        inspector = _inspector;
        lender = _lender;
    }



    function depositEarnest() public payable onlyBuyer {
        require(msg.value >= escrowAmount,"deposit more than 20% of actual amount");
    }

    function updateInspectionStatus (bool _passed) public onlyInspector {
        inspectionPassed = _passed;
    }

    function approveSale() public{
        approval[msg.sender] = true;
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;        
    }

    function cancelSale() public{
        if(inspectionPassed == false) {
            payable(buyer).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
    }

    function finalizeSale() public {
        require(inspectionPassed, 'Must pass Inspection');
        require(approval[seller], 'Must be approved by seller');
        require(approval[buyer], 'Must be approved by buyer');
        require(approval[lender], 'Must be approved by lender');
        require(address(this).balance >= purchasePrice, 'Must have enough ether for Sale');

        (bool success,) = payable(seller).call{value: address(this).balance}("");
        require(success);

        //transfer ownership of property
        IERC721(nftAddress).transferFrom(seller, buyer, nftID);
    }
}