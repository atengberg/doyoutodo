import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";

import Constants "./modules/static/Constants";
import Errors "./modules/static/Errors";
import Types "./modules/static/Types";

import PIdContext "./modules/PIdContext";
import UsersMetadata "./modules/UsersMetadata";
import UsersTodos "./modules/UsersTodos";

// note here the "original" caller (the principal that deployed this canister)
// is reassigned as to prevent accidental reuse in subsequent shared modified calls
shared ({ caller = installer }) actor class() = this {

  ////////////////////////////////////////// Method Listing:
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
  // unscheduleScheduledTodo

  // activateExistingTodo
  // completeActiveTodo
  
  // removeExistingTodo

  // getTotalCreatedTodoCount

  // "stable" modifier is used to desiginate that variable to have the quality of orthogonal persistence, which is
  // another way of saying if the canister is upgraded, that variable will retain its value whereas non-stable variables will not. 
  // another way to say explain this is that stable variables can be reliably serialized 
  // not all variables have a stable form, in fact if a variable is compound and has private fields, it cannot be 
  // reliably serialized and is not stable (such as a hashmap, althought there is a stable hashmap implementation available)

  // also note that fields followed by an underscore are a reminder that is private to the class/file

  // the "next" used and incremented each time a new account is allocated
  stable var monotonicIdCreationCount_: Nat = 0;
  
  // variables used to migrate data between canister upgrades (see below)
  stable var pidStableState_: Types.PIdContextStableState = [];
  stable var usersMetadataStableState_: Types.UsersMetadataStableState = [];
  stable var usersTodosStableState_: Types.UsersTodosStableState = [];

  // the next three declarations are the primary units of this file, each is a mapping from 
  // the id to the respective data type (principal > id, id > metadata, id > todos) that 
  // handles all the functionality needed. to do: add get/set to each so that the underlying map 
  // structure can be swapped out to whatever's more suitable (ie stablehashmap, or other structure)

  // class based module wrapper that maps principal to the id used to subsequently do any CRUD related calls, 
  // so each shared call in this file first passes its shared { caller } to the authenticator, which will return the id associated with that principal 
  let authenticator_: PIdContext.Authenticator = PIdContext.Authenticator(monotonicIdCreationCount_, pidStableState_);

  // class based module wrapper for handling all the logic related to users' "profile" functionality
  let users_: UsersMetadata.UsersMetadata = UsersMetadata.UsersMetadata(usersMetadataStableState_);

  // class based module wrapper for handling all the logic related to users' todos functionality
  let todos_: UsersTodos.UsersTodos = UsersTodos.UsersTodos(usersTodosStableState_);

  // when canister is deployed, it processes the canister's code. when it is deployed again, so that
  // it is upgraded, this callback is triggered first which is used serialize any non-stable data to a 
  // stable form for that data. then the entire canister's code is run again, so that the
  // three declarations above are invoked, passing the stable data to their respective constructors
  // note this is why only half the available canister memory is used, since whatever must be serialized during
  // upgrade must temporarily be allocated as stable. Note that if all declarations were stable, this
  // would not have to happen
  system func preupgrade() {
    monotonicIdCreationCount_ := authenticator_.getMonotonicIdCreationCount();
    pidStableState_ := authenticator_.getEntries();
    usersMetadataStableState_ := users_.getEntries();
    usersTodosStableState_ := todos_.getEntries();
  };

  // after the canister has been deployed so it has upgraded, so that preupgrade and the class code is
  // ran, this will be called at the end (ie, as if it were declared at the file scope at the very end of the file)
  // hence it is used for cleanup or deallocated whatever was serialized above
  system func postupgrade() {
    pidStableState_ := [];
    usersMetadataStableState_ := [];
    usersTodosStableState_ := [];
  };

  // in web3, where a user can login with their wallet, they don't need to create a new account. this method is called
  // when a user first logs in, to verify if any allocation needs to take place. possibly a better way to do this
  // with another form of lazy instantiation; also, could split this into a query and non-query method, since this
  // only needs to be performed once per new user call
  public shared({ caller }) func authenticateWithUserAccountCreationIfNecessary(): async Result.Result<Types.UniqueId, Text> {
    let size = authenticator_.getEntries().size();
    if (caller == Constants.getAnonymousPrincipal()) { return #err(Errors.AnonUnauthorized); };
    if (not (authenticator_.isKnownPrincipal(caller))) {
      let combineInitCalls = func(forPrincipal: Principal): Types.UniqueId {
        let createdId: Types.UniqueId = authenticator_.persistNewId(caller); 
        users_.initializeNewUserMetadata(createdId, caller);
        todos_.initializeNewUserTodos(createdId);
        return createdId;
      };
      let createdUserId = combineInitCalls(caller);
    };
    let authId = authenticator_.authenticate(caller);
    return #ok(authId # " " # Principal.toText(caller));
  };

  public shared query({ caller }) func queryUserMetadata(): async Result.Result<Types.UserMetadata, Text> {
    return users_.getUserMetadata(authenticator_.authenticate(caller));
  };

  public shared({ caller }) func updateUserMetadata({ 
    preferredDisplayNameIn: ?Text; 
    emailAddressIn: ?Text 
  }): async Result.Result<Types.UserMetadata, Text> {
    return users_.persistUserMetadataEdits(authenticator_.authenticate(caller), preferredDisplayNameIn, emailAddressIn);
  };

  public shared query({ caller }) func queryAllTodosOfUser(): async Result.Result<[Types.Todo], Text> {
    return #ok(todos_.getSpecificUserTodos(authenticator_.authenticate(caller)));
  };

  public shared query({ caller }) func querySpecificTodoOfUser({ todoIdIn: Types.UniqueId }): async Result.Result<Types.Todo, Text> {
    return todos_.getSpecificUserTodo(authenticator_.authenticate(caller), todoIdIn);
  };

  public shared({ caller }) func updateSpecificTodoMetadataOrContent({ 
    todoIdIn: Types.UniqueId; 
    titleIn: ?Text; 
    contentIn: ?Text; 
    tagsIn: ?[Text] 
  }): async Result.Result<Types.Todo, Text> {
    return (todos_.editTodoMetadataOrContent(authenticator_.authenticate(caller), todoIdIn, titleIn, contentIn, tagsIn));
  };

  // connects UsersMetadata to UsersTodos when a user creates a new todo to get the "next" (user specific todo creation count)
  // used to create the id of that todo
  func getNextTodoIdForUserId_(forUserId: Types.UniqueId): Types.UniqueId {
    return Nat.toText(users_.incrementSetAndGetUserMonotonicCreateTodoCount(forUserId));
  };

  // NOTE on the next three methods!
  // the next three methods were originally declared intended to make it simpler for the client to create a todo
  // however, "enumerating the options" like this might be less desirable than a single endpoint for todo creation
  public shared({ caller }) func addNewUnscheduledTodo({ 
    titleIn: ?Text; 
    contentIn: ?Text; 
    tagsIn: ?[Text] 
  }): async Result.Result<Types.Todo, Text> {
    let authdId = authenticator_.authenticate(caller);
    return todos_.addNewUnscheduledTodo(authdId, getNextTodoIdForUserId_(authdId), titleIn, contentIn, tagsIn);
  };

  public shared({ caller }) func addNewScheduledTodo({ 
    titleIn: ?Text; 
    contentIn: ?Text; 
    tagsIn: ?[Text]; 
    scheduledStartTime: Time.Time; 
    scheduledStopTime: Time.Time 
  }): async Result.Result<Types.Todo, Text> {
    let authdId = authenticator_.authenticate(caller);
    return todos_.addNewScheduledTodo(authdId, getNextTodoIdForUserId_(authdId), titleIn, contentIn, tagsIn, scheduledStartTime, scheduledStopTime);
  };

  public shared({ caller }) func addNewActiveTodo({ 
    titleIn: ?Text; 
    contentIn: ?Text; 
    tagsIn: ?[Text] 
  }): async Result.Result<Types.Todo, Text> {
    let authdId = authenticator_.authenticate(caller);
    return todos_.addNewActiveTodo(authdId, getNextTodoIdForUserId_(authdId), titleIn, contentIn, tagsIn);
  };

  public shared({ caller }) func scheduledUnscheduledTodo({ 
    todoIdIn: Types.UniqueId; 
    scheduledStartTime: Time.Time; 
    scheduledStopTime: Time.Time 
  }): async Result.Result<Types.Todo, Text> {
    let authdId = authenticator_.authenticate(caller);
    return todos_.scheduleUnscheduledTodo(authdId, todoIdIn, scheduledStartTime, scheduledStopTime);
  };  

  public shared({ caller }) func rescheduleScheduledTodo({ 
    todoIdIn: Types.UniqueId; 
    newScheduledStartTime: Time.Time; 
    newScheduledStopTime: Time.Time 
  }): async Result.Result<Types.Todo, Text> {
    let authdId = authenticator_.authenticate(caller);
    return todos_.rescheduleScheduledTodo(authdId, todoIdIn, newScheduledStartTime, newScheduledStopTime);
  };  

  public shared({ caller }) func activateScheduledOrUnscheduledTodo({ 
    todoIdIn: Types.UniqueId 
  }): async Result.Result<Types.Todo, Text> {
    let authdId = authenticator_.authenticate(caller);
    return todos_.activateExistingTodo(authdId, todoIdIn);
  };

  public shared({ caller }) func completeActiveTodo({ 
    todoIdIn: Types.UniqueId 
  }): async Result.Result<Types.Todo, Text> {
    let authdId = authenticator_.authenticate(caller);
    return todos_.completeActiveTodo(authdId, todoIdIn);
  };

  public shared({ caller }) func removeExistingTodo({ 
    todoIdIn: Types.UniqueId 
  }): async Result.Result<(Text, Types.UniqueId), Text> {
    let authdId = authenticator_.authenticate(caller);
    return todos_.removeExistingTodo(authdId, todoIdIn);
  };
  
  public shared({ caller }) func unscheduleScheduledTodo({ 
    todoInIn: Types.UniqueId 
  }): async Result.Result<Types.Todo, Text> {
    let authdId = authenticator_.authenticate(caller);
    return todos_.unscheduleScheduledTodo(authdId, todoInIn);
  };

  // note there's no shared({ caller }) here since it is not specific to any user, that is, it'll return the total number of todos
  // created by all users and doesn't require authentication to access. As it does not cause any state change in the canister, 
  // the query modifer can be added which speeds up response by not requiring the nodes to come to consensus
  public query func getTotalCreatedTodoCount(): async Nat {
    return todos_.getCountOfAllTodos();
  };
}