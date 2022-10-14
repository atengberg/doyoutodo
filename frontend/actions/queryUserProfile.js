
const callCanisterQueryUserProfile = async ({ canister }) => {
    return await canister.queryUserMetadata();
}

export default callCanisterQueryUserProfile;