#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
};

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    AlreadyInitialized = 1,
    Unauthorized = 2,
    SubscriptionExpired = 3,
    InvalidDuration = 4,
    InsufficientPayment = 5,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct LicenseRecord {
    pub device_id: String,
    pub user_address: Address,
    pub plan_tier: Symbol, // e.g. "PRO", "ANNUAL", "LIFETIME"
    pub activated_at: u64,
    pub expires_at: u64,
    pub amount_paid_stroops: i128,
}

const ADMIN_KEY: Symbol = symbol_short!("ADMIN");
const TREASURY_KEY: Symbol = symbol_short!("TREASURY");

#[contract]
pub struct NutriGuardLicenseContract;

#[contractimpl]
impl NutriGuardLicenseContract {
    /// Initialize the NutriGuard contract with admin and treasury addresses
    pub fn initialize(env: Env, admin: Address, treasury: Address) -> Result<(), Error> {
        if env.storage().instance().has(&ADMIN_KEY) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);
        env.storage().instance().set(&TREASURY_KEY, &treasury);
        Ok(())
    }

    /// Purchase or renew a license for a given deviceId using Stellar Lumens
    pub fn purchase_license(
        env: Env,
        subscriber: Address,
        device_id: String,
        plan_tier: Symbol,
        duration_seconds: u64,
        payment_amount: i128,
    ) -> Result<LicenseRecord, Error> {
        subscriber.require_auth();

        if duration_seconds == 0 {
            return Err(Error::InvalidDuration);
        }

        let now = env.ledger().timestamp();
        let expires_at = now + duration_seconds;

        let record = LicenseRecord {
            device_id: device_id.clone(),
            user_address: subscriber,
            plan_tier,
            activated_at: now,
            expires_at,
            amount_paid_stroops: payment_amount,
        };

        // Store license keyed by device_id
        env.storage().persistent().set(&device_id, &record);

        Ok(record)
    }

    /// Query the license validity on-chain for a deviceId
    pub fn check_license(env: Env, device_id: String) -> (bool, u64, Symbol) {
        if let Some(record) = env.storage().persistent().get::<String, LicenseRecord>(&device_id) {
            let now = env.ledger().timestamp();
            let is_valid = now < record.expires_at;
            let seconds_left = if is_valid { record.expires_at - now } else { 0 };
            (is_valid, seconds_left, record.plan_tier)
        } else {
            (false, 0, symbol_short!("NONE"))
        }
    }

    /// Admin can revoke or update a license in case of fraud or dispute
    pub fn admin_set_license(
        env: Env,
        device_id: String,
        user_address: Address,
        plan_tier: Symbol,
        expires_at: u64,
    ) -> Result<(), Error> {
        let admin: Address = env.storage().instance().get(&ADMIN_KEY).unwrap();
        admin.require_auth();

        let record = LicenseRecord {
            device_id: device_id.clone(),
            user_address,
            plan_tier,
            activated_at: env.ledger().timestamp(),
            expires_at,
            amount_paid_stroops: 0,
        };

        env.storage().persistent().set(&device_id, &record);
        Ok(())
    }
}
