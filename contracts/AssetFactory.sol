// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

uint256 constant minValue = 20000000000000000;

address constant creator = 0x726150C568f3C7f1BB3C47fd1A224a5C3F706BB1;

contract AssetFactory {

    // Define an event that will be emitted whenever a new NFT is created
    event NewAsset(
        address indexed creator,
        uint256 indexed assetId,
        string name,
        uint power
    );

    modifier checkCreator() {
        require(msg.sender == creator, "You're not the factory creator");
        _;
    }

    modifier onlyAssetOwner(uint256 assetId) {
        require(msg.sender == idToAsset[assetId].owner(), "You're not the owner of the contract");
        _;
    }

    modifier assetNotForSale(uint256 assetId) {
        require(idToAsset[assetId].forSale() == false, "You're not the owner of the contract");
        _;
    }

    modifier checkValue {
        require(msg.value >= minValue, "Value below the necessary");
        _;
    }

    modifier checkAssetValue(uint256 marketAssetId) {
        require(msg.value >= assetsOnMarket[marketAssetId].value(), "Value below the asset value");
        _;
    }

    modifier existAssetOnMarket() {
        require(assetsOnMarket.length > 0, "There is no asset on the market");
        _;
    }

    modifier notBoss() {
        require(msg.sender == boss, "You are already the boss");
        _;
    }

    // Create a mapping from asset IDs to NFT contract addresses
    mapping(uint256 => Asset) public idToAsset;
    mapping(address => Asset[]) public addressToAssetList;

    // Create a counter to keep track of the next asset ID to be assigned
    uint256 public nextAssetId;

    Asset[] public assetsOnMarket;

    address public boss = creator;
    uint public bossPower = 250;

    function kingBalance() public view returns (uint){
        return address(this).balance;
    } 

    // Define a function to create a new NFT contract
    function createAsset() public payable checkValue {
        uint nameId = uint(keccak256(abi.encodePacked(msg.sender, gasleft(), block.timestamp))) % 3;
        string memory _name;
        if (nameId == 0) 
            _name = "Weapon";
        else if (nameId == 1) 
            _name = "Armor";
        else
            _name = "Accessory";
            
        uint _power = 1 + uint(keccak256(abi.encodePacked(msg.sender, gasleft(), block.timestamp, "batata"))) % 100;

        if (_power <= 70)
            _power = 1 + uint(keccak256(abi.encodePacked(msg.sender, gasleft(), block.timestamp, "batata aldeao"))) % 50;
        else if (_power <= 95)
            _power = 51 + uint(keccak256(abi.encodePacked(msg.sender, gasleft(), block.timestamp, "batata soldado"))) % 30;
        else
            _power = 21 + uint(keccak256(abi.encodePacked(msg.sender, gasleft(), block.timestamp, "batata rei"))) % 100;

        // Increment the asset ID counter and assign the new ID to the asset
        idToAsset[nextAssetId] = new Asset(nextAssetId, _name, _power, msg.sender, address(this));
        addressToAssetList[msg.sender].push(idToAsset[nextAssetId]);
        // Emit an event to announce the creation of the new NFT
        emit NewAsset(msg.sender, nextAssetId, _name, _power);
        // Increment the asset ID counter for the next asset to be created
        nextAssetId++;
    }

    function payCreator() external checkCreator {
        uint balance = address(this).balance;
        (bool success, ) = payable(creator).call{value: balance}("");
        require(success, "Failed to send Coin");
    }

    function bossBattle() public payable notBoss returns (bool)
    {
        uint bestWeapon = 0;
        uint bestArmor = 0;
        uint bestAcessory = 0;

        for (uint i=0; i<addressToAssetList[msg.sender].length; i++)
        {
            if(keccak256(bytes(addressToAssetList[msg.sender][i].name())) == keccak256(bytes("Weapon")))
            {
                if(addressToAssetList[msg.sender][i].power() > bestWeapon)
                    bestWeapon = addressToAssetList[msg.sender][i].power();
            }
            else if(keccak256(bytes(addressToAssetList[msg.sender][i].name())) == keccak256(bytes("Armor")))
            {
                if(addressToAssetList[msg.sender][i].power() > bestArmor)
                    bestArmor = addressToAssetList[msg.sender][i].power();
            }
            else
            {
                if(addressToAssetList[msg.sender][i].power() > bestAcessory)
                    bestAcessory = addressToAssetList[msg.sender][i].power();
            }
        }

        uint totalPower = bestWeapon + bestArmor + bestAcessory;

        if (totalPower > bossPower)
        {
            bossPower = totalPower;

            uint balance = address(this).balance;
            (bool success, ) = payable(msg.sender).call{value: balance/2}("");
            require(success, "Failed to send Coin to new Boss");
            (success, ) = payable(boss).call{value: balance/2}("");
            require(success, "Failed to send Coin to previous Boss");

            boss = msg.sender;
            return true;
        }
        return false;
    }

    function putAssetToSale(uint assetId, uint value) public onlyAssetOwner(assetId) assetNotForSale(assetId){
        idToAsset[assetId].putAssetToSale(value);
        assetsOnMarket.push(idToAsset[assetId]);

    }

    function getAssetsOnMarketCount() public view returns(uint count) {
        return assetsOnMarket.length;
    }

    function getAllAssetsOnMarket() public view returns(Asset[] memory) {
        return assetsOnMarket;
    }

    function getAllMyAssets() public view returns(Asset[] memory) {
        return addressToAssetList[msg.sender];
    }

    function getAssetsCount(address owner) public view returns(uint count) {
        return addressToAssetList[owner].length;
    }

    function getAssetAtRow(address owner, uint row) public view returns(Asset theAsset) {
        return addressToAssetList[owner][row];
    }

    function transferAssetOwnership(uint256 assetId, address newOwner) private {
        idToAsset[assetId].transferAssetOwnership(newOwner);
    }

    function buyAsset(uint assetId) public payable existAssetOnMarket checkAssetValue(assetId){
        address prevOwner = idToAsset[assetId].owner();
        (bool success, ) = payable(idToAsset[assetId].owner()).call{value: msg.value}("");
        require(success, "Failed to buy asset");
        idToAsset[assetId].transferAssetOwnership(msg.sender);

        addressToAssetList[msg.sender].push(idToAsset[assetId]);

        uint prevAssetId = 0;
        for (uint i = 0; i < addressToAssetList[prevOwner].length-1; i++){
            if(addressToAssetList[prevOwner][i] == idToAsset[assetId])
            {
                prevAssetId = i;
                break;
            }
        }
        for (uint i = prevAssetId; i < addressToAssetList[prevOwner].length-1; i++){
            addressToAssetList[prevOwner][i] = addressToAssetList[prevOwner][i+1];
        }
        addressToAssetList[prevOwner].pop();

        uint marketAssetId = 0;
        for (uint i = 0; i < assetsOnMarket.length-1; i++){
            if(assetsOnMarket[i] == idToAsset[assetId])
            {
                marketAssetId = i;
                break;
            }
        }
        for (uint i = marketAssetId; i < assetsOnMarket.length-1; i++){
            assetsOnMarket[i] = assetsOnMarket[i+1];
        }
        assetsOnMarket.pop();
    }
}

// Define the Asset contract
contract Asset {
    // Define the variables for the NFT
    uint256 public assetId;
    string public name;
    uint public power;
    address public owner;
    address private factory;

    bool public forSale;
    uint public value;

    modifier onlyOwner(address caller) {
        require(caller == owner, "You're not the owner of the contract");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "You need to use the factory");
        _;
    }

    modifier notForSale() {
        require(forSale == false, "Your asset is on the market");
        _;
    }

    // Define the constructor function for the NFT
    constructor(uint256 _assetId, string memory _name, uint _power, address _owner, address _factory) {
        assetId = _assetId;
        name = _name;
        power = _power;
        owner = _owner;
        factory = _factory;
        forSale = false;
    }

    function transferAssetOwnership(address newOwner) public onlyFactory {
        forSale = false;
        value = 0;
        owner = newOwner;
    }

    function putAssetToSale(uint _value) public onlyFactory notForSale {
        forSale = true;
        value = _value;
    }
}