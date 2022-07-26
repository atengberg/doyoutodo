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
import Buffer "mo:base/Buffer";
import Result "mo:base/Result";
import Option "mo:base/Option";
import Array "mo:base/Array";
import List "mo:base/List";
import Iter "mo:base/Iter";
import Bool "mo:base/Bool";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Types "./static/Types";
import Constants "./static/Constants";

// todo -> excise duplicate [todo] gets when can use the one verified
// change to always return result and only assert fail if deploying for production

module {
  public class UsersTodos(initSet: Types.UsersTodosStableState) {

    var userIdToTodosMap = HashMap.fromIter<Types.UniqueId, [Types.Todo]>(
      initSet.vals(), initSet.size(), Text.equal, Text.hash
    );

    public func reset(): () {
      userIdToTodosMap := HashMap.HashMap<Types.UniqueId, [Types.Todo]>(0, Text.equal, Text.hash);
    };

    // non assertive boolean to see if the user id has a corresponding [todo]
    func userIdMaps(forUniqueUserId: Types.UniqueId): Bool { 
      Option.isSome(userIdToTodosMap.get(forUniqueUserId)) 
    };

    // non assertive boolean to see if the todo id exists in the [todo]
    func todoIdExistsInTodoSet(todosSearchSet: [Types.Todo], forUniqueTodoId: Types.UniqueId): Bool {
      let todo = Array.find<Types.Todo>(
        todosSearchSet, 
        func(t: Types.Todo): Bool { t.id == forUniqueTodoId }
      );
      switch (todo) {
        case (?todo) { true };
        case (_) { false };
      };
    };

    // for stable state
    public func getEntries(): [(Types.UniqueId, [Types.Todo])] { Iter.toArray(userIdToTodosMap.entries()) };
    
    public func getCountOfAllTodos(): Nat { 
      var count: Nat = 0;
      for (todos in userIdToTodosMap.vals()) { count += todos.size(); };
      return count;
    };

    // assertive call to allocate :[todo] for given userid
    public func persistNewUserTodosAllocation(forUniqueUserId: Types.UniqueId): () {
      assert(not userIdMaps(forUniqueUserId));
      userIdToTodosMap.put(forUniqueUserId, []);
    };

    // assertive call 
    public func getSpecificUserTodos(forUniqueUserId: Types.UniqueId): [Types.Todo] {
      assert(userIdMaps(forUniqueUserId));
      let exists = userIdToTodosMap.get(forUniqueUserId);
      switch (exists) {
        case (null) { Prelude.unreachable(); };
        case (?exists) { return exists };
      };
    };

    // assertive call
    public func getSpecificUserTotalTodoCount(forUniqueUserId: Types.UniqueId): Nat {
      assert(userIdMaps(forUniqueUserId));
      return getSpecificUserTodos(forUniqueUserId).size();
    };

    // assertive call but will assert fail if user id does not have todos created at all
    public func getSpecificUserTodo(forUniqueUserId: Types.UniqueId, forUniqueTodoId: Types.UniqueId): Result.Result<Types.Todo, Text> {
      assert(userIdMaps(forUniqueUserId));
      let todo = Array.find<Types.Todo>(
        getSpecificUserTodos(forUniqueUserId), 
        func(t: Types.Todo): Bool { t.id == forUniqueTodoId }
      );
      switch (todo) {
        case (?todo) { #ok(todo) };
        case (_) { #err"No todo with supplied id for supplied user id was found"; };
      };
    };

    public func editTodoMetadataOrContent(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
      titleIn: ?Text,
      contentIn: ?Text,
      tagsIn: ?[Text],
    ): () {
      assert(userIdMaps(forUniqueUserId));
      let userTodos = getSpecificUserTodos(forUniqueUserId);
      assert(todoIdExistsInTodoSet(userTodos, forUniqueTodoId));
      userIdToTodosMap.put(
        forUniqueUserId, 
        editTodoDetails(
          userTodos, 
          forUniqueTodoId, titleIn, contentIn, tagsIn, null
        )
      );
    }; 

    // { unscheduled, scheduled, active, complete }
    // psuedostate-machine flowchart representation of todo status
    //               -> xactive 
    //                     -> xcomplete (only)
    // <user intent> -> xscheduled 
    //                      -> xactive or -> xunscheduled (if bumped) or -> x(re)scheduled
    //               -> xunscheduled
    //                      -> xscheduled or -> xactive
    // so todo status is a dag with complete as the 

    func addTodo( 
      forUniqueUserId: Types.UniqueId,
      newTodoId: Types.UniqueId,
      titleIn: ?Text,
      contentIn: ?Text,
      tagsIn: ?[Text],
      scheduledStatusIn: Types.ScheduledStatus,
    ): () { // maybe change return type to Result? instead of assert failing, but assert fails for "system sures"
      assert(userIdMaps(forUniqueUserId));
      switch (scheduledStatusIn) {
        case (#completed args) { assert(true); };
        case (#scheduled (start, stop)) { assert(start < stop); };
        case (#active (start, optNomInterval)) { assert(not Option.isSome(optNomInterval)); };
        case (#unscheduled) {  };
      }; 
      // reverse order unwrapped:
      // get existing todos
      // add new unscheduled todo to this list
      // pass the returned list with the new todo to the edit todo function
      // pass the returned list now containing a new todo whose fields have been set to the map 
      userIdToTodosMap.put(forUniqueUserId, 
        editTodoDetails( // cause this is totally not confusing
          addNewUnscheduledNonSpecificTodo(
            getSpecificUserTodos(forUniqueUserId), newTodoId), 
            newTodoId, titleIn, contentIn, tagsIn, ?scheduledStatusIn
        )
      );
    }; 

    public func addNewUnscheduledTodo(
      forUniqueUserId: Types.UniqueId,
      newTodoId: Types.UniqueId,
      titleIn: ?Text,
      contentIn: ?Text,
      tagsIn: ?[Text],
    ): () {
      addTodo(forUniqueUserId, newTodoId, titleIn, contentIn, tagsIn, #unscheduled);
    };

    public func addNewScheduledTodo(
      forUniqueUserId: Types.UniqueId,
      newTodoId: Types.UniqueId,
      titleIn: ?Text,
      contentIn: ?Text,
      tagsIn: ?[Text],
      nominalStartTimeIn: Time.Time,
      nominalStopTimeIn: Time.Time
    ): () {
      assert(nominalStartTimeIn < nominalStopTimeIn);
      addTodo(forUniqueUserId, newTodoId, titleIn, contentIn, tagsIn, (#scheduled(nominalStartTimeIn, nominalStopTimeIn)));
    };

    public func addNewActiveTodo(
      forUniqueUserId: Types.UniqueId,
      newTodoId: Types.UniqueId,
      titleIn: ?Text,
      contentIn: ?Text,
      tagsIn: ?[Text],
    ): () {
      addTodo(forUniqueUserId, newTodoId, titleIn, contentIn, tagsIn, (#active(Time.now(), null)));
    };

    // turn an unscheduled todo into a scheduled todo 
    public func scheduleUnscheduledTodo(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
      nominalStartTimeIn: Time.Time, // becomes nominal
      nominalStopTimeIn: Time.Time   // becomes nominal
    ): () {
      assert(nominalStartTimeIn < nominalStopTimeIn);
      assert(userIdMaps(forUniqueUserId));
      let todo = Array.find<Types.Todo>(
        getSpecificUserTodos(forUniqueUserId), 
        func(t: Types.Todo): Bool { t.id == forUniqueTodoId }
      );
      switch (todo) {
        case (null) { assert(false); }; // verify it existed
        case (?todo) { 
          switch (todo.currentScheduledStatus) {
            case (#unscheduled) { }; // only unscheduled -> scheduled
            case (_) { assert(false); };
          };
        };
      };
      let allTodos = getSpecificUserTodos(forUniqueUserId);
      let updatedTodos = editTodoDetails(
        allTodos, forUniqueTodoId, null, null, null, 
        ?(#scheduled(nominalStartTimeIn, nominalStopTimeIn))); 
      userIdToTodosMap.put(forUniqueUserId, updatedTodos);
    }; 

    public func rescheduleScheduledTodo(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
      nominalStartTimeIn: Time.Time, // becomes nominal
      nominalStopTimeIn: Time.Time   // becomes nominal
    ): () {
      assert(nominalStartTimeIn < nominalStopTimeIn);
      assert(userIdMaps(forUniqueUserId));
      let userTodos = getSpecificUserTodos(forUniqueUserId);
      let todo = Array.find<Types.Todo>(userTodos, 
        func(t: Types.Todo): Bool { t.id == forUniqueTodoId }
      );
      switch (todo) {
        case (null) { assert(false); }; // verify it existed
        case (?todo) { 
          switch (todo.currentScheduledStatus) {
            case (#scheduled(nominal)) { }; // only rescheduled means only scheduled -> scheduled
            case (_) { assert(false); };
          };
        };
      };
      let allTodos = getSpecificUserTodos(forUniqueUserId);
      let updatedTodos = editTodoDetails(
        allTodos, forUniqueTodoId, null, null, null, 
        ?(#scheduled(nominalStartTimeIn, nominalStopTimeIn))); 
      userIdToTodosMap.put(forUniqueUserId, updatedTodos);
    }; 

    // can only be scheduled, for "bumping" in case an active todo completes after another one was scheduled to be active
    public func unscheduleScheduledTodo(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
    ): () {
      assert(userIdMaps(forUniqueUserId));
      let userTodos = getSpecificUserTodos(forUniqueUserId);
      let todo = Array.find<Types.Todo>(userTodos, 
        func(t: Types.Todo): Bool { t.id == forUniqueTodoId }
      );
      switch (todo) {
        case (null) { assert(false); }; // verify it existed
        case (?todo) { 
          switch (todo.currentScheduledStatus) {
            case (#scheduled(nominal)) { }; // verify it was scheduled
            case (_) { assert(false); };
          };
        };
      };
      let allTodos = getSpecificUserTodos(forUniqueUserId);
      let updatedTodos = editTodoDetails(
        allTodos, forUniqueTodoId, null, null, null, 
        ?(#unscheduled)); 
      userIdToTodosMap.put(forUniqueUserId, updatedTodos);
    }; 

    // can be either scheduled or unscheduled
    public func activateExistingTodo(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
    ): () {
      assert(userIdMaps(forUniqueUserId));
      let userTodos = getSpecificUserTodos(forUniqueUserId);
      let todo = Array.find<Types.Todo>(userTodos, 
        func(t: Types.Todo): Bool { t.id == forUniqueTodoId }
      );
      var schedule: Types.ScheduledStatus = #unscheduled;
      switch (todo) {
        case (null) { assert(false); }; // verify it existed
        case (?todo) { 
          switch (todo.currentScheduledStatus) {
            case (#unscheduled) { schedule := (#active(Time.now(), null)); };
            // should a user be able to activate a previousily scheduled todo, ie, !realStartTime < nominalStartTime?
            case (#scheduled(nominal)) { schedule := (#active(Time.now(), ?nominal)); };  
            case (_) { assert(false); }; // active/complete fails
          };
        };
      };
      assert(not (schedule == #unscheduled));

      let allTodos = getSpecificUserTodos(forUniqueUserId);

      let updatedTodos = editTodoDetails(
        allTodos, forUniqueTodoId, null, null, null, 
        ?(schedule)); 

      userIdToTodosMap.put(forUniqueUserId, updatedTodos);
    }; 
 
    // can only be active
    public func completeActiveTodo(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
    ): () {
      assert(userIdMaps(forUniqueUserId));
      let userTodos = getSpecificUserTodos(forUniqueUserId);
      let todo = Array.find<Types.Todo>(userTodos, 
        func(t: Types.Todo): Bool { t.id == forUniqueTodoId }
      );
      var schedule: Types.ScheduledStatus = #unscheduled;
      switch (todo) {
        case (null) { assert(false); }; // verify it existed
        case (?todo) { 
          switch (todo.currentScheduledStatus) {
            case (#active(realStartTime, optNominalInterval)) {
              assert(realStartTime < Time.now()); 
              schedule := #completed((realStartTime, Time.now()), optNominalInterval); 
            };
            case (_) { assert(false); }; // only active todos can be completed
          };
        };
      };
      // no need to assert schedule == active

      let allTodos = getSpecificUserTodos(forUniqueUserId);

      let updatedTodos = editTodoDetails(
        allTodos, forUniqueTodoId, null, null, null, 
        ?(schedule)); 

      userIdToTodosMap.put(forUniqueUserId, updatedTodos);
    }; 

    public func removeExistingTodo(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
    ): () {
      assert(userIdMaps(forUniqueUserId));
      let userTodos = getSpecificUserTodos(forUniqueUserId);
      let todo = Array.find<Types.Todo>(userTodos, 
        func(t: Types.Todo): Bool { t.id == forUniqueTodoId }
      );
      var schedule: Types.ScheduledStatus = #unscheduled;
      switch (todo) {
        case (null) { assert(false); }; // verify it existed
        case (?todo) { };
      };
      let updatedTodos = deleteTodo(userTodos, forUniqueTodoId); 
      userIdToTodosMap.put(forUniqueUserId, updatedTodos);
    }; 

    // generic function that simply returns array with new non-specific todo added
    func addNewUnscheduledNonSpecificTodo(
      existingTodos: [Types.Todo],
      newTodoId: Types.UniqueId,
    ): [Types.Todo] {
      let todos: Buffer.Buffer<Types.Todo> = Constants.toFilledBuffer(existingTodos);
      todos.add({
        id = newTodoId;
        epochCreationTime = Time.now();
        epochLastUpdateTime = Time.now();
        title = "unnamed todo #" # newTodoId;
        content = "unspecified default content";
        tags = [];
        currentScheduledStatus = #unscheduled;
      });
      return todos.toArray();
    };

    // generic function that overwrites any existing values if new values are present
    func editTodoDetails(
      existingTodos: [Types.Todo],
      targetTodoId: Types.UniqueId,
      titleIn: ?Text,
      contentIn: ?Text,
      tagsIn: ?[Text],
      scheduledStatusIn: ?Types.ScheduledStatus,
    ): [Types.Todo] {
      var throwError: Bool = true;
      let updateFcn = func(todo: Types.Todo): Types.Todo {
        if (todo.id == targetTodoId) {
          throwError := false;
          return {
            id = targetTodoId;
            epochCreationTime = todo.epochCreationTime;
            epochLastUpdateTime = Time.now();
            title = Option.get<Text>(titleIn, todo.title);
            content = Option.get<Text>(contentIn, todo.content);
            tags = Option.get<[Text]>(tagsIn, todo.tags);
            currentScheduledStatus = Option.get<Types.ScheduledStatus>(scheduledStatusIn, todo.currentScheduledStatus);
          };
        } else { todo };
      };
      let updated = Array.map<Types.Todo, Types.Todo>(existingTodos, updateFcn);
      assert(not throwError);
      return updated;
    };
  };

     // generic function that drops todo if present
    func deleteTodo(existingTodos: [Types.Todo], targetTodoId: Types.UniqueId): [Types.Todo] {
      var throwError: Bool = true;
      let filterFcn = func(todo: Types.Todo): Bool {
        if (targetTodoId == todo.id) {
          throwError := false;
          return false;
        } else { return true; };
      };
      let updated = Array.filter<Types.Todo>(existingTodos, filterFcn);
      assert(not throwError);
      return updated;
    };
}