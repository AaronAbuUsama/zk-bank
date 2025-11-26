// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {DaoAuthorizableUpgradeable} from "@aragon/osx-commons-contracts/src/permission/auth/DaoAuthorizableUpgradeable.sol";
import {IDAO} from "@aragon/osx-commons-contracts/src/dao/IDAO.sol";

/// @title ProtocolBase
/// @notice Base contract for all Bank Protocol upgradeable contracts with DAO authorization
/// @dev Combines Aragon DAO authorization with UUPS upgradeability pattern.
///      All protocol contracts should inherit from this base to ensure consistent
///      authorization and upgrade mechanisms.
///
///      **Architecture Pattern:**
///      - DaoAuthorizableUpgradeable: Provides Aragon DAO permission checks via auth() modifier
///        (also includes Initializable for upgrade safety)
///      - UUPSUpgradeable: Enables contract upgrades via UUPS proxy pattern
///
///      **Usage in Child Contracts:**
///      ```solidity
///      contract MyContract is ProtocolBase {
///          function initialize(IDAO _dao) external initializer {
///              __ProtocolBase_init(_dao);
///              // Additional initialization...
///          }
///
///          function myProtectedFunction()
///              external
///              auth(SOME_PERMISSION_ID)
///          {
///              // Function logic...
///          }
///      }
///      ```
///
///      **Why ProtocolBase?**
///      - DRY Principle: Define auth + upgrade pattern once, inherit everywhere
///      - Consistency: All contracts have same authorization and upgrade mechanism
///      - Maintainability: Protocol-wide changes in one place
///      - Error Prevention: Can't forget _disableInitializers() or _authorizeUpgrade()
///      - Flexibility: Contracts can separately inherit CircuitBreaker if needed
///
///      **Note:** We don't inherit from Initializable directly because DaoAuthorizableUpgradeable
///      already inherits from it. This avoids diamond inheritance conflicts.
abstract contract ProtocolBase is DaoAuthorizableUpgradeable, UUPSUpgradeable {
    /*//////////////////////////////////////////////////////////////////////////
                                    CONSTANTS
    //////////////////////////////////////////////////////////////////////////*/

    /// @notice Permission ID required to upgrade the contract
    bytes32 public constant ADMIN_UPGRADE_PERMISSION_ID = keccak256("ADMIN_UPGRADE_PERMISSION");

    /*//////////////////////////////////////////////////////////////////////////
                                    INITIALIZATION
    //////////////////////////////////////////////////////////////////////////*/

    /// @notice Prevents implementation contract from being initialized
    /// @dev This is a security measure to ensure the implementation contract
    ///      cannot be initialized directly. Only proxies pointing to this
    ///      implementation can be initialized.
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializes the DAO authorization
    /// @dev Must be called by child contract's initialize() function.
    ///      Uses onlyInitializing to allow chained initialization calls.
    /// @param _dao The Aragon DAO contract address
    function __ProtocolBase_init(IDAO _dao) internal onlyInitializing {
        __DaoAuthorizableUpgradeable_init(_dao);
    }

    /*//////////////////////////////////////////////////////////////////////////
                                    UPGRADE AUTHORIZATION
    //////////////////////////////////////////////////////////////////////////*/

    /// @notice Authorizes contract upgrades
    /// @dev Only callable by addresses with ADMIN_UPGRADE_PERMISSION_ID permission.
    ///      This is called by the UUPS proxy before upgrading to a new implementation.
    ///      The DAO must grant this permission to trusted upgrade executors.
    /// @param newImplementation The new implementation contract address
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        auth(ADMIN_UPGRADE_PERMISSION_ID)
    // solhint-disable-next-line no-empty-blocks
    {}
}
