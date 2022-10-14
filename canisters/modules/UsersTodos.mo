import Array "mo:base/Array";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Prelude "mo:base/Prelude";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

import Constants "./static/Constants";
import Errors "./static/Errors";
import Types "./static/Types";

module {
  // class wrapper for handling all users' todos
  public class UsersTodos(initSet: Types.UsersTodosStableState) {

    var userIdToTodosMap_ = HashMap.fromIter<Types.UniqueId, [Types.Todo]>(
      initSet.vals(), initSet.size(), Text.equal, Text.hash
    );

    // non assertive boolean to see if the user id has a corresponding [todo]
    func userIdMaps_(forUniqueUserId: Types.UniqueId): Bool { 
      Option.isSome(userIdToTodosMap_.get(forUniqueUserId)) 
    };

    // non assertive boolean to see if the todo id exists in the [todo]
    func todoIdExistsInTodoSet_(todosSearchSet: [Types.Todo], forUniqueTodoId: Types.UniqueId): Bool {
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
    public func getEntries(): [(Types.UniqueId, [Types.Todo])] { Iter.toArray(userIdToTodosMap_.entries()) };
    
    public func getCountOfAllTodos(): Nat { 
      var count: Nat = 0;
      for (todos in userIdToTodosMap_.vals()) { count += todos.size(); };
      return count;
    };

    // assertive call to allocate :[todo] for given userid
    public func initializeNewUserTodos(forUniqueUserId: Types.UniqueId): () {
      assert(not userIdMaps_(forUniqueUserId));
      userIdToTodosMap_.put(forUniqueUserId, []);
    };

    // assertive call 
    public func getSpecificUserTodos(forUniqueUserId: Types.UniqueId): [Types.Todo] {
      assert(userIdMaps_(forUniqueUserId));
      let exists = userIdToTodosMap_.get(forUniqueUserId);
      switch (exists) {
        case (null) { Prelude.unreachable(); };
        case (?exists) { return exists };
      };
    };

    // assertive call
    public func getSpecificUserTotalTodoCount(forUniqueUserId: Types.UniqueId): Nat {
      assert(userIdMaps_(forUniqueUserId));
      return getSpecificUserTodos(forUniqueUserId).size();
    };

    // assertive call but will assert fail if user id does not have todos created at all
    public func getSpecificUserTodo(forUniqueUserId: Types.UniqueId, forUniqueTodoId: Types.UniqueId): Result.Result<Types.Todo, Text> {
      assert(userIdMaps_(forUniqueUserId));
      let todo = Array.find<Types.Todo>(
        getSpecificUserTodos(forUniqueUserId), 
        func(t: Types.Todo): Bool { t.id == forUniqueTodoId }
      );
      switch (todo) {
        case (?todo) { #ok(todo) };
        case (_) { #err(Errors.TodoNotFound)};
      };
    };

    public func editTodoMetadataOrContent(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
      titleIn: ?Text,
      contentIn: ?Text,
      tagsIn: ?[Text],
    ): Result.Result<Types.Todo, Text> {
      assert(userIdMaps_(forUniqueUserId));
      let userTodos = getSpecificUserTodos(forUniqueUserId);
      assert(todoIdExistsInTodoSet_(userTodos, forUniqueTodoId));
      userIdToTodosMap_.put(
        forUniqueUserId, 
        editTodoDetails_(
          userTodos, 
          forUniqueTodoId, titleIn, contentIn, tagsIn, null
        )
      );
      return getSpecificUserTodo(forUniqueUserId, forUniqueTodoId);
    }; 

    // generic add function, note traps if invalid data is passed as error checking done prior to this being called
    func addTodo_( 
      forUniqueUserId: Types.UniqueId,
      newTodoId: Types.UniqueId,
      titleIn: ?Text,
      contentIn: ?Text,
      tagsIn: ?[Text],
      scheduledStatusIn: Types.ScheduledStatus,
    ): Result.Result<Types.Todo, Text> {
      assert(userIdMaps_(forUniqueUserId));
      switch (scheduledStatusIn) {
        case (#completed args) { assert(true); };
        case (#scheduled (start, stop)) { assert(start < stop) }; // error is returned on incoming call, so can safely explicitly trap here
        case (#active (start, optNomInterval)) { assert(not Option.isSome(optNomInterval)); };
        case (#unscheduled) {  };
      }; 
      // reverse order unwrapped: (cause this is totally not confusing)
      // get existing todos
      // add new unscheduled todo to this list
      // pass the returned list with the new todo to the edit todo function
      // pass the returned list now containing a new todo whose fields have been set to the map 

      // alternatively the immutable array of todos could be retrieved, thawed, edited, frozen and stored back in the map
      // was going for "functional"
      userIdToTodosMap_.put(forUniqueUserId, 
        editTodoDetails_(
          addNewUnscheduledNonSpecificTodo_(
            getSpecificUserTodos(forUniqueUserId), newTodoId), 
            newTodoId, titleIn, contentIn, tagsIn, ?scheduledStatusIn
        )
      );
      return getSpecificUserTodo(forUniqueUserId, newTodoId);
    }; 

    public func addNewUnscheduledTodo(
      forUniqueUserId: Types.UniqueId,
      newTodoId: Types.UniqueId,
      titleIn: ?Text,
      contentIn: ?Text,
      tagsIn: ?[Text],
    ): Result.Result<Types.Todo, Text>  {
      return addTodo_(forUniqueUserId, newTodoId, titleIn, contentIn, tagsIn, #unscheduled);
    };

    public func addNewScheduledTodo(
      forUniqueUserId: Types.UniqueId,
      newTodoId: Types.UniqueId,
      titleIn: ?Text,
      contentIn: ?Text,
      tagsIn: ?[Text],
      nominalStartTimeIn: Time.Time,
      nominalStopTimeIn: Time.Time
    ): Result.Result<Types.Todo, Text>  {
      if (nominalStartTimeIn > nominalStopTimeIn) {
        return #err(Errors.InvalidScheduleTimes);
      };
      return addTodo_(forUniqueUserId, newTodoId, titleIn, contentIn, tagsIn, (#scheduled(nominalStartTimeIn, nominalStopTimeIn)));
    };

    public func addNewActiveTodo(
      forUniqueUserId: Types.UniqueId,
      newTodoId: Types.UniqueId,
      titleIn: ?Text,
      contentIn: ?Text,
      tagsIn: ?[Text],
    ): Result.Result<Types.Todo, Text> {
      return addTodo_(forUniqueUserId, newTodoId, titleIn, contentIn, tagsIn, (#active(Time.now(), null)));
    };

    // turn an unscheduled todo into a scheduled todo 
    public func scheduleUnscheduledTodo(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
      nominalStartTimeIn: Time.Time, // becomes nominal
      nominalStopTimeIn: Time.Time   // becomes nominal
    ): Result.Result<Types.Todo, Text> {
      if (nominalStartTimeIn > nominalStopTimeIn) {
        return #err(Errors.InvalidScheduleTimes);
      };
      assert(userIdMaps_(forUniqueUserId));
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
      let updatedTodos = editTodoDetails_(
        allTodos, forUniqueTodoId, null, null, null, 
        ?(#scheduled(nominalStartTimeIn, nominalStopTimeIn))); 
      userIdToTodosMap_.put(forUniqueUserId, updatedTodos);
      return getSpecificUserTodo(forUniqueUserId, forUniqueTodoId);
    }; 

    public func rescheduleScheduledTodo(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
      nominalStartTimeIn: Time.Time, // becomes nominal
      nominalStopTimeIn: Time.Time   // becomes nominal
    ): Result.Result<Types.Todo, Text> {
      if (nominalStartTimeIn > nominalStopTimeIn) {
        return #err(Errors.InvalidScheduleTimes);
      };
      assert(userIdMaps_(forUniqueUserId));
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
      let updatedTodos = editTodoDetails_(
        allTodos, forUniqueTodoId, null, null, null, 
        ?(#scheduled(nominalStartTimeIn, nominalStopTimeIn))); 
      userIdToTodosMap_.put(forUniqueUserId, updatedTodos);
      return getSpecificUserTodo(forUniqueUserId, forUniqueTodoId);
    }; 

    // can only be scheduled, for "bumping" in case an active todo completes after another one was scheduled to be active
    public func unscheduleScheduledTodo(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
    ): Result.Result<Types.Todo, Text> {
      assert(userIdMaps_(forUniqueUserId));
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
      let updatedTodos = editTodoDetails_(
        allTodos, forUniqueTodoId, null, null, null, 
        ?(#unscheduled)); 
      userIdToTodosMap_.put(forUniqueUserId, updatedTodos);
      return getSpecificUserTodo(forUniqueUserId, forUniqueTodoId);
    }; 

    // can be either scheduled or unscheduled
    public func activateExistingTodo(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
    ): Result.Result<Types.Todo, Text> {
      assert(userIdMaps_(forUniqueUserId));
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

      let updatedTodos = editTodoDetails_(
        allTodos, forUniqueTodoId, null, null, null, 
        ?(schedule)); 

      userIdToTodosMap_.put(forUniqueUserId, updatedTodos);
      return getSpecificUserTodo(forUniqueUserId, forUniqueTodoId);
    }; 
 
    // can only be active
    public func completeActiveTodo(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
    ): Result.Result<Types.Todo, Text>  {
      assert(userIdMaps_(forUniqueUserId));
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

      let updatedTodos = editTodoDetails_(
        allTodos, forUniqueTodoId, null, null, null, 
        ?(schedule)); 

      userIdToTodosMap_.put(forUniqueUserId, updatedTodos);
      return getSpecificUserTodo(forUniqueUserId, forUniqueTodoId);
    }; 

    public func removeExistingTodo(
      forUniqueUserId: Types.UniqueId,
      forUniqueTodoId: Types.UniqueId,
    ): Result.Result<(Text, Types.UniqueId), Text>  {
      assert(userIdMaps_(forUniqueUserId));
      let userTodos = getSpecificUserTodos(forUniqueUserId);
      let todo = Array.find<Types.Todo>(userTodos, 
        func(t: Types.Todo): Bool { t.id == forUniqueTodoId }
      );
      var schedule: Types.ScheduledStatus = #unscheduled;
      switch (todo) {
        case (null) { assert(false); }; // verify it existed
        case (?todo) { };
      };
      let updatedTodos = deleteTodo_(userTodos, forUniqueTodoId); 
      userIdToTodosMap_.put(forUniqueUserId, updatedTodos);
      return #ok("Successfully removed todo", forUniqueTodoId);
    }; 

    // generic function that simply returns array with new non-specific todo added
    func addNewUnscheduledNonSpecificTodo_(
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
    func editTodoDetails_(
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
    func deleteTodo_(existingTodos: [Types.Todo], targetTodoId: Types.UniqueId): [Types.Todo] {
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