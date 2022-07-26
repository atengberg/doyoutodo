import Principal "mo:base/Principal";
import Prim "mo:⛔";
import Prelude "mo:base/Prelude";
import D "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Nat "mo:base/Nat";
import Hash "mo:base/Hash";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Array "mo:base/Array";
import List "mo:base/List";
import Iter "mo:base/Iter";
import Bool "mo:base/Bool";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Types "./modules/static/Types";
import Constants "./modules/static/Constants";
import PIdContext "./modules/PIdContext";
import UsersMetadata "./modules/UsersMetadata";
import UsersTodos "./modules/UsersTodos";

    // todo
    // use boolean in constants to check if dev production mode, if so bypass assertions; return Result.Result for all those methods all the time

shared ({ caller }) actor class() = this {

  // authenticateWithUserAccountCreationIfNecessary
  // authenticate -> userId

  // getUserMetadata
  // updateUserMetadata

  // addNewUnscheduledTodo
  // addNewScheduledTodo
  // addNewActiveTodo
  
  // editTodoMetadataOrContent

  // scheduleUnscheduledTodo
  // rescheduleScheduledTodo

  // activateExistingTodo

  // completeActiveTodo

  // TBD:
  //  
  //
  // need: 
  //  forceDeleteTodo 
  //  forceUnschedulingTodo 
  //
  // want:
  //  mark completed with scheduling process ?
  
  // FOR LOCAL DEVELOPMENT PURPOSES ONLY
  func thisCanister(): Principal { Principal.fromActor(this); };

  stable var monotonicIdCreationCount: Nat = 0;
  stable var pidStableState: Types.PIdContextStableState = [];
  stable var usersMetadataStableState: Types.UsersMetadataStableState = [];
  stable var usersTodosStableState: Types.UsersTodosStableState = [];

  let authenticator: PIdContext.Authenticator = PIdContext.Authenticator(monotonicIdCreationCount, pidStableState);
  let users: UsersMetadata.UsersMetadata = UsersMetadata.UsersMetadata(usersMetadataStableState);
  let todos: UsersTodos.UsersTodos = UsersTodos.UsersTodos(usersTodosStableState);

  system func preupgrade() {
    monotonicIdCreationCount := authenticator.getMonotonicIdCreationCount();
    pidStableState := authenticator.getEntries();
    usersMetadataStableState := users.getEntries();
    usersTodosStableState := todos.getEntries();
  };

  system func postupgrade() {
    pidStableState := [];
    usersMetadataStableState := [];
    usersTodosStableState := [];
  };

  public func authenticateWithUserAccountCreationIfNecessary(): async Result.Result<Types.UniqueId, Text> {
    let caller = thisCanister();
    if (caller == Constants.getAnonymousPrincipal()) { return #err("Random users cannot authenticate"); };
    if (not (authenticator.isKnownPrincipal(caller))) {
      let batchCreateUserCalls = func(forPrincipal: Principal): Types.UniqueId {
        let createdId: Types.UniqueId = authenticator.persistNewId(caller); 
        users.persistNewUserMetadata(createdId);
        todos.persistNewUserTodosAllocation(createdId);
        return createdId;
      };
      let createdUserId = batchCreateUserCalls(caller);
    };
    let authId = authenticator.authenticate(caller);
    return #ok(authId);
  };

  public func queryUserMetadata(): async Result.Result<Types.UserMetadata, Text> {
    let caller = thisCanister();
    return users.getUserMetadata(authenticator.authenticate(caller));
  };

  public func updateUserMetadata({ preferredDisplayNameIn: ?Text; emailAddressIn: ?Text }): async Result.Result<Text, Text> {
    let caller = thisCanister();
    users.persistUserMetadataEdits(authenticator.authenticate(caller), preferredDisplayNameIn, emailAddressIn);
    return #ok("Success");
  };

  public func queryAllTodosOfUser(): async Result.Result<[Types.Todo], Text> {
    let caller = thisCanister();
    return #ok(todos.getSpecificUserTodos(authenticator.authenticate(caller)));
  };

  public func querySpecificTodoOfUser({ todoIdIn: Types.UniqueId }): async Result.Result<Types.Todo, Text> {
    let caller = thisCanister();
    return todos.getSpecificUserTodo(authenticator.authenticate(caller), todoIdIn);
  };

  public func updateSpecificTodoMetadataOrContent({ todoIdIn: Types.UniqueId; titleIn: ?Text; contentIn: ?Text; tagsIn: ?[Text] }): async Result.Result<Text, Text> {
    let caller = thisCanister();
    todos.editTodoMetadataOrContent(authenticator.authenticate(caller), todoIdIn, titleIn, contentIn, tagsIn);
    return #ok"Successfully updated todo";
  };

  func getNextTodoIdForUserId(forUserId: Types.UniqueId): Types.UniqueId {
    return Nat.toText(users.incrementSetAndGetUserMonotonicCreateTodoCount(forUserId));
  };

  public func addNewUnscheduledTodo({ titleIn: ?Text; contentIn: ?Text; tagsIn: ?[Text] }): async Result.Result<Text, Text> {
    let caller = thisCanister();
    let authdId = authenticator.authenticate(caller);
    todos.addNewUnscheduledTodo(authdId, getNextTodoIdForUserId(authdId), titleIn, contentIn, tagsIn);
    return #ok"Successfully added unscheduled todo";
  };

  public func addNewScheduledTodo({ titleIn: ?Text; contentIn: ?Text; tagsIn: ?[Text]; scheduledStartTime: Time.Time; scheduledStopTime: Time.Time }): async Result.Result<Text, Text> {
    let caller = thisCanister();
    let authdId = authenticator.authenticate(caller);
    todos.addNewScheduledTodo(authdId, getNextTodoIdForUserId(authdId), titleIn, contentIn, tagsIn, scheduledStartTime, scheduledStopTime);
    return #ok"Successfully added scheduled todo";
  };

  public func addNewActiveTodo({ titleIn: ?Text; contentIn: ?Text; tagsIn: ?[Text] }): async Result.Result<Text, Text> {
    let caller = thisCanister();
    let authdId = authenticator.authenticate(caller);
    todos.addNewActiveTodo(authdId, getNextTodoIdForUserId(authdId), titleIn, contentIn, tagsIn);
    return #ok"Successfully added active todo";
  };

  public func scheduledUnscheduledTodo({ todoIdIn: Types.UniqueId; scheduledStartTime: Time.Time; scheduledStopTime: Time.Time }): async Result.Result<Text, Text> {
    let caller = thisCanister();
    let authdId = authenticator.authenticate(caller);
    todos.scheduleUnscheduledTodo(authdId, todoIdIn, scheduledStartTime, scheduledStopTime);
    return #ok"Successfully scheduled todo";
  };  

  public func rescheduleScheduledTodo({ todoIdIn: Types.UniqueId; newScheduledStartTime: Time.Time; newScheduledStopTime: Time.Time }): async Result.Result<Text, Text> {
    let caller = thisCanister();
    let authdId = authenticator.authenticate(caller);
    todos.rescheduleScheduledTodo(authdId, todoIdIn, newScheduledStartTime, newScheduledStopTime);
    return #ok"Successfully rescheduled todo";
  };  

  public func activateScheduledOrUnscheduledTodo({ todoIdIn: Types.UniqueId }): async Result.Result<Text, Text> {
    let caller = thisCanister();
    let authdId = authenticator.authenticate(caller);
    todos.activateExistingTodo(authdId, todoIdIn);
    return #ok"Successfully activated todo";
  };

  public func completeActiveTodo({ todoIdIn: Types.UniqueId }): async Result.Result<Text, Text> {
    let caller = thisCanister();
    let authdId = authenticator.authenticate(caller);
    todos.completeActiveTodo(authdId, todoIdIn);
    return #ok"Successfully completed todo";
  };

  public func removeExistingTodo({ todoIdIn: Types.UniqueId }): async Result.Result<Text, Text> {
    let caller = thisCanister();
    let authdId = authenticator.authenticate(caller);
    todos.removeExistingTodo(authdId, todoIdIn);
    return #ok"Successfully deleted todo";
  };
  
  public func unscheduleScheduledTodo({ todoInIn: Types.UniqueId }): async Result.Result<Text, Text> {
    let caller = thisCanister();
    let authdId = authenticator.authenticate(caller);
    todos.unscheduleScheduledTodo(authdId, todoInIn);
    return #ok"Successfully unscheduled todo";
  };


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// new methods

  public func getTotalCreatedTodoCount(): async Result.Result<Nat, Text> {
    let todoCount = todos.getCountOfAllTodos();
    return #ok(todoCount);
  };

  public func DEBUG_resetUserTodos(): async () {
    authenticator.reset();
    users.reset();
    todos.reset();
    let val = await authenticateWithUserAccountCreationIfNecessary();
  };






  public func helloCanister(): async Text {
    let caller = thisCanister();
    return "Canister says hello to caller with principal " # Principal.toText(caller); 
  };

  public func greet(): async Text {
    return "Canister says hello";
  };

  public func orderTest({ firstArg: ?Text; secondArg: Nat; thirdArg: Text }): async Result.Result<Text, [Nat]> {
    var isSome = "not set";
    if (Option.isSome(firstArg)) {
      isSome := "true";
    } else {
      isSome := "false";
    };
    if (secondArg == 0) {
      return #err([1, 2, 3]);
    } else {
      return #ok("Test worked " # isSome);
    };
  }
}