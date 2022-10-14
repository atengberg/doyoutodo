

const callCanisterDeleteTodo = async ({ canister, todoId }) => {
    return await canister.removeExistingTodo({ todoIdIn: todoId });
}

export default callCanisterDeleteTodo;