
const callCanisterQueryAllTodosOfUser = async ({ canister }) => {
    return await canister.queryAllTodosOfUser();
}

export default callCanisterQueryAllTodosOfUser;