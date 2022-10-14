// public func updateUserMetadata({ preferredDisplayNameIn: ?Text; emailAddressIn: ?Text }): async Result.Result<Text, Text> {
  
const callCanisterUpdateProfile = async ({ canister, newName, newEmail }) => {
    const params = {};
    params.preferredDisplayNameIn = newName ? [ newName ] : [];
    params.emailAddressIn = newEmail ? [ newEmail ] : [];
    return await canister.updateUserMetadata({ ...params });
}

export default callCanisterUpdateProfile;