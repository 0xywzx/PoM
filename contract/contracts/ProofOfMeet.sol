// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import '@openzeppelin/contracts/utils/Strings.sol';
import "base64-sol/base64.sol";
import './libraries/HexStrings.sol';

contract ProofOfMeet is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter public _tokenIdCounter;
    using HexStrings for uint256;
    uint256 private _pomId = 0;
    mapping(uint256 => uint256) public tokenIdToPomId;

    struct PoM {
        uint256 pomId;
        string name;
        string imageURL;
    }

    mapping (uint256 => PoM) public poms;

    // EIP712 Precomputed hashes:
    // keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract,bytes32 salt)")
    bytes32 constant EIP712DOMAINTYPE_HASH = 0xd87cd6ef79d4e2b95e15ce8abf732db51ec771f1ca2edccf22a46c729ac56472;

    // keccak256("Proof Of Meet")
    bytes32 constant NAME_HASH = 0xebee521eae932390d0dbe84467e87ed73f5d224ec6e2324c0689cdc44d1aaf85;

    // keccak256("1")
    bytes32 constant VERSION_HASH = 0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6;

    // keccak256("MintWithSignature(uint256 nonce)")
    bytes32 constant TXTYPE_HASH = 0x0a10f69f3a9a030116013b2a75915b26ec4ae208dd054217644db4a9ca7c451f;

    bytes32 constant SALT = 0x251543af6a222378665a76fe38dbceae4871a070b7fdaf5c6c30cf758dc33cc0;

    mapping (uint => bool) isUsed;
    mapping (address => bool) isOwner; // immutable state

    bytes32 DOMAIN_SEPARATOR;          // hash for EIP712, computed from contract address

    constructor() ERC721("ProofOfMeet", "PoM") {
        uint chainId = block.chainid;
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712DOMAINTYPE_HASH,
                NAME_HASH,
                VERSION_HASH,
                chainId,
                this,
                SALT
            )
        );
    }

    // Note that address recovered from signatures must be strictly increasing, in order to prevent duplicates
    // @dev: delete executor
    function safeMultiMint(
        uint8[] memory sigV,
        bytes32[] memory sigR,
        bytes32[] memory sigS,
        string memory uri,
        uint nonce
    ) public {
        require(sigR.length == sigS.length && sigR.length == sigV.length);
        require(!isUsed[nonce]);
        // EIP712 scheme: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-712.md
        bytes32 txInputHash = keccak256(abi.encode(TXTYPE_HASH, nonce));
        bytes32 totalHash = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, txInputHash));

        for (uint i = 0; i < sigR.length; i++) {
            address recovered = ecrecover(totalHash, sigV[i], sigR[i], sigS[i]);
            _safeMint(recovered, _tokenIdCounter.current());
            tokenIdToPomId[_tokenIdCounter.current()]=_pomId;
            _tokenIdCounter.increment();
        }
        isUsed[nonce] = true;

        poms[_pomId] = PoM({
            pomId: _pomId,
            name: uint256(nonce).toHexString(8),
            imageURL: uri
        });
        _pomId += 1;
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        uint256 pomId = tokenIdToPomId[tokenId];
        PoM memory _pom = poms[pomId];
        return
            string(
                abi.encodePacked(
                'data:application/json;base64,',
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"',
                            _pom.name,
                            '", "image": "',
                            _pom.imageURL,
                            '"}'
                        )
                    )
                )
                )
            );
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    fallback () payable external {}
    receive () payable external {}

}

