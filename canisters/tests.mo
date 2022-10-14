import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Time "mo:base/Time";

import Constants "./modules/static/Constants";
import Types "./modules/static/Types";

import PIdContext "./modules/PIdContext";
import UsersMetadata "./modules/UsersMetadata";
import UsersTodos "./modules/UsersTodos";

// note tests so far in three parts, the third part uses its own users/todos and has two parts necessary for checking time elapsed,
// upgrade integrity checks
// ie test_todos() must be called in same canister version instance (for now) as testTodoCompletion()

shared ({ caller = installer }) actor class() = this {

    stable var monotonicIdCreationCount: Nat = 0;
    stable var pidStableState: Types.PIdContextStableState = [];
    stable var usersMetadataStableState: Types.UsersMetadataStableState = [];
    stable var usersTodosStableState: Types.UsersTodosStableState = [];

// these are used in two first calls
  let authenticator: PIdContext.Authenticator = PIdContext.Authenticator(monotonicIdCreationCount, pidStableState);
  let users: UsersMetadata.UsersMetadata = UsersMetadata.UsersMetadata(usersMetadataStableState);
  let todos: UsersTodos.UsersTodos = UsersTodos.UsersTodos(usersTodosStableState);

  public func test_creation_pidmetadatatodos_editmetadata(): async Result.Result<(Types.PIdContextStableState, Types.UsersMetadataStableState, Types.UsersTodosStableState), Text> {

    let canisterPrincipal = Principal.fromActor(this);

    assert(authenticator.getEntries().size() == 0);
    assert(authenticator.getCurrentPIdCount() == authenticator.getMonotonicIdCreationCount());
    assert(users.getEntries().size() == 0);
    assert(users.getEntries().size() == users.getCurrentUsersCount());
    assert(todos.getEntries().size() == 0);
    assert(todos.getCountOfAllTodos() == 0);


    if (authenticator.isKnownPrincipal(canisterPrincipal)) {
      assert(false);
    } else {
      // note to self, user creation on these three classes should be batched into one call
      let createdId: Types.UniqueId = authenticator.persistNewId(canisterPrincipal); // PID CREATE NEW CALL

      if (users.userMetadataExists(createdId)) {
        assert(false);
      } else {
        users.initializeNewUserMetadata(createdId, canisterPrincipal); // METADATA CREATE NEW CALL
        switch (users.getUserMetadata(createdId)) {
          case (#err(msg)) { assert(false); };
          case (_) { }; 
        }
      };

      // check defaults for metadata
      if (users.userMetadataExists(createdId)) {
        switch (users.getUserMetadata(createdId)) {
          case (#ok(user)) {
            assert(user.preferredDisplayName == Constants.LITERALLY_UNSPECIFIED);
            assert(user.emailAddress == Constants.LITERALLY_UNSPECIFIED);
            assert(user.associatedPrincipal == Principal.toText(canisterPrincipal));
          };
          case (#err(msg)) { 
            assert(false);
          };
        }
      } else {
        assert(false);
      };

      // check vals for todos
      todos.initializeNewUserTodos(createdId); // TODOS CREATE NEW CALL
      assert(todos.getSpecificUserTodos(createdId).size() == 0);
      assert(todos.getSpecificUserTotalTodoCount(createdId) == todos.getSpecificUserTodos(createdId).size());
      assert(todos.getCountOfAllTodos() == 0);

      // check authenticator worked
      if (not (authenticator.isKnownPrincipal(canisterPrincipal))) {
        assert(false);
      } else {
        let checkedId: Types.UniqueId = authenticator.authenticate(canisterPrincipal);
        assert(checkedId == createdId);
      };
    };

    assert(authenticator.getEntries().size() == 1);
    assert(authenticator.getCurrentPIdCount() == authenticator.getMonotonicIdCreationCount());
    assert(users.getEntries().size() == 1);
    assert(users.getEntries().size() == users.getCurrentUsersCount());
    assert(todos.getEntries().size() == 1);
    assert(todos.getCountOfAllTodos() == 0);

    let id: Types.UniqueId = authenticator.authenticate(canisterPrincipal);
    // check update metadata calls
    if (users.userMetadataExists(id)) {

      let newName = "new user name";
      let newEmail = "new email address";
      // var lastUpdatedTime = Time.now(); cannot in same call have diff apparently

      var res = users.persistUserMetadataEdits(id, ?newName, ?newEmail);
      switch (users.getUserMetadata(id)) {
        case (#ok(user)) {
          assert(user.preferredDisplayName == newName);
          assert(user.emailAddress == newEmail);
        };
        case (#err(msg)) { 
          assert(false);
        };
      };
      let checkNameEditAlone = (newName#newName);
      res := users.persistUserMetadataEdits(id, ?(checkNameEditAlone), null);
      switch (users.getUserMetadata(id)) {
        case (#ok(user)) {
          assert(user.preferredDisplayName == checkNameEditAlone);
          assert(user.emailAddress == newEmail);
        };
        case (#err(msg)) { 
          assert(false);
        };
      };
      let checkEmailAlone = (newEmail#newEmail);
      res := users.persistUserMetadataEdits(id, null, ?checkEmailAlone);
      switch (users.getUserMetadata(id)) {
        case (#ok(user)) {
          assert(user.preferredDisplayName == checkNameEditAlone);
          assert(user.emailAddress == checkEmailAlone);
        };
        case (#err(msg)) { 
          assert(false);
        };
      };
    } else {
      assert(false);
    };

    // verify info is still the same
    assert(authenticator.getEntries().size() == 1);
    assert(authenticator.getCurrentPIdCount() == authenticator.getMonotonicIdCreationCount());
    assert(users.getEntries().size() == 1);
    assert(users.getEntries().size() == users.getCurrentUsersCount());

    // going to add an arbitrary user id
    let newUserId = "completely_arbitrary_to_check";

    users.initializeNewUserMetadata(newUserId, canisterPrincipal);
    if (users.userMetadataExists(newUserId)) {

      let newName = "new user name";
      let newEmail = "new email address";

      let res = users.persistUserMetadataEdits(newUserId, ?newName, ?newEmail);
      switch (users.getUserMetadata(newUserId)) {
        case (#ok(user)) {
          assert(user.preferredDisplayName == newName);
          assert(user.emailAddress == newEmail);
        };
        case (#err(msg)) { 
          assert(false);
        };
      };
      let checkNameEditAlone = (newName#newName);
      let res2 = users.persistUserMetadataEdits(newUserId, ?(checkNameEditAlone), null);
      switch (users.getUserMetadata(newUserId)) {
        case (#ok(user)) {
          assert(user.preferredDisplayName == checkNameEditAlone);
          assert(user.emailAddress == newEmail);
        };
        case (#err(msg)) { 
          assert(false);
        };
      };
      let checkEmailAlone = (newEmail#newEmail);
      let res3 = users.persistUserMetadataEdits(newUserId, null, ?checkEmailAlone);
      switch (users.getUserMetadata(newUserId)) {
        case (#ok(user)) {
          assert(user.preferredDisplayName == checkNameEditAlone);
          assert(user.emailAddress == checkEmailAlone);
        };
        case (#err(msg)) { 
          assert(false);
        };
      };
    } else {
      assert(false);
    };

    // double check metadata changes

    let firstUserNewName = "first user new name";
    let secondUserEmail = "second user email";
    
    let first = users.persistUserMetadataEdits(id, ?firstUserNewName, null);
    let second = users.persistUserMetadataEdits(newUserId, null, ?secondUserEmail);

    switch (users.getUserMetadata(id)) {
      case (#ok(user)) {
        assert(user.preferredDisplayName == firstUserNewName);
      };
      case (#err(msg)) { 
        assert(false);
      };
    };
    switch (users.getUserMetadata(newUserId)) {
      case (#ok(user)) {
        assert(user.emailAddress == secondUserEmail);
      };
      case (#err(msg)) { 
        assert(false);
      };
    };

    // check the cardinal
    assert(users.getEntries().size() == 2);
    assert(users.getEntries().size() == users.getCurrentUsersCount());

    // add another to todos
    todos.initializeNewUserTodos(newUserId);

    assert(todos.getEntries().size() == 2);
    assert(todos.getCountOfAllTodos() == 0);

    var timeTest = "start";
    
    var instanceOne: ?Types.UserMetadata = null;
    var instanceTwo: ?Types.UserMetadata = null;
    switch (users.getUserMetadata(id)) {
      case (#ok(user)) {
        timeTest #= " FIRST" # Int.toText(user.epochLastUpdateTime);
        instanceOne := ?user;
      };
      case (#err(msg)) { 
        assert(false);
      };
    };
    var res = users.persistUserMetadataEdits(id, ?"confounded", null);
    switch (users.getUserMetadata(id)) {
      case (#ok(user)) {
        timeTest #= " NEXT: " # Int.toText(user.epochLastUpdateTime);
        instanceTwo := ?user;
      };
      case (#err(msg)) { 
        assert(false);
      };
    };

    return #ok(authenticator.getEntries(), users.getEntries(), todos.getEntries());
  };    


  let usersMetadataTodosTest: UsersMetadata.UsersMetadata = UsersMetadata.UsersMetadata(usersMetadataStableState);
  let todosTest: UsersTodos.UsersTodos = UsersTodos.UsersTodos(usersTodosStableState);

  public func test_todos(): async Result.Result<([Types.Todo]), Text> {

    let canisterPrincipal = Principal.fromActor(this);

    assert(todosTest.getCountOfAllTodos() == 0);
    assert(todosTest.getCountOfAllTodos() == todosTest.getEntries().size());

    let idOne = "idOne";
    usersMetadataTodosTest.initializeNewUserMetadata(idOne, canisterPrincipal);
    assert(usersMetadataTodosTest.queryGetUserMonotonicCreateTodoCount(idOne) == 0);

    todosTest.initializeNewUserTodos(idOne);
    assert(todosTest.getEntries().size() == 1);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == 0);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == todosTest.getSpecificUserTodos(idOne).size());

    switch (todosTest.getSpecificUserTodo(idOne, "random arbitrary value")) {
      case (#ok(todo)) { assert(false); };
      case (#err(msg)) { assert(true); };
    };

    let firstTodoId = Nat.toText(usersMetadataTodosTest.incrementSetAndGetUserMonotonicCreateTodoCount(idOne));
    assert(usersMetadataTodosTest.queryGetUserMonotonicCreateTodoCount(idOne) == 1);

    let firstTodoTitle = "first todo title";
    let firstTodoContent = "1st todo content";

    // ADD UNSCHEDULED
    var res = todosTest.addNewUnscheduledTodo(idOne, firstTodoId, ?firstTodoTitle, ?firstTodoContent, null);

    assert(todosTest.getCountOfAllTodos() == 1);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == 1);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == todosTest.getSpecificUserTodos(idOne).size());

    switch (todosTest.getSpecificUserTodo(idOne, firstTodoId)) {
      case (#ok(todo)) {
        assert(todo.id == firstTodoId);
        assert(todo.title == firstTodoTitle);
        assert(todo.content == firstTodoContent);
        assert(todo.tags.size() == 0);
      };
      case (#err(msg)) { assert(false); };
    };

    let firstTodoEditedTitle = "first todo EDITED title";
    let firstTodoEditedContent = "1st todo EDITED content";
    let firstTodoTags = ["tags"];

    res := todosTest.editTodoMetadataOrContent(idOne, firstTodoId, ?firstTodoEditedTitle, ?firstTodoEditedContent, ?firstTodoTags);

    assert(todosTest.getCountOfAllTodos() == 1);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == 1);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == todosTest.getSpecificUserTodos(idOne).size());

    switch (todosTest.getSpecificUserTodo(idOne, firstTodoId)) {
      case (#ok(todo)) {
        assert(todo.id == firstTodoId);
        assert(todo.title == firstTodoEditedTitle);
        assert(todo.content == firstTodoEditedContent);
        assert(todo.tags.size() == 1);
        assert(todo.tags[0] == "tags");
        assert(todo.currentScheduledStatus == #unscheduled);
      };
      case (#err(msg)) { assert(false); };
    };

    let secondTodoId = Nat.toText(usersMetadataTodosTest.incrementSetAndGetUserMonotonicCreateTodoCount(idOne));
    assert(usersMetadataTodosTest.queryGetUserMonotonicCreateTodoCount(idOne) == 2);
    
    let someTimeStart: Time.Time = Time.now() + 10000000;
    let someTimeEnd: Time.Time = Time.now() +   100000000;

    // ADD SCHEDULED
    res := todosTest.addNewScheduledTodo(idOne, secondTodoId, ?firstTodoTitle, ?firstTodoContent, null, someTimeStart, someTimeEnd);

    assert(todosTest.getCountOfAllTodos() == 2);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == 2);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == todosTest.getSpecificUserTodos(idOne).size());

    switch (todosTest.getSpecificUserTodo(idOne, secondTodoId)) {
      case (#ok(todo)) {
        assert(todo.id == secondTodoId);
        assert(todo.title == firstTodoTitle);
        assert(todo.content == firstTodoContent);
        assert(todo.tags.size() == 0);
        switch (todo.currentScheduledStatus) {
          case (#scheduled(nomStart, nomStop)) {
            assert(nomStart == someTimeStart);
            assert(nomStop == someTimeEnd);
          };
          case (_) { assert(false); };
        };
      };
      case (#err(msg)) { assert(false); };
    };

    // SCHEDULE PREVIOUSILY ALREADY ADDED UNSCHEDULED
    res := todosTest.scheduleUnscheduledTodo(idOne, firstTodoId, someTimeStart, someTimeEnd);

    //make sure count didn't change
    assert(todosTest.getCountOfAllTodos() == 2);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == 2);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == todosTest.getSpecificUserTodos(idOne).size());

    switch (todosTest.getSpecificUserTodo(idOne, firstTodoId)) {
      case (#ok(todo)) {
        assert(todo.id == firstTodoId);
        assert(todo.title == firstTodoEditedTitle);
        assert(todo.content == firstTodoEditedContent);
        assert(todo.tags.size() == 1);
        switch (todo.currentScheduledStatus) {
          case (#scheduled(nomStart, nomStop)) {
            assert(nomStart == someTimeStart);
            assert(nomStop == someTimeEnd);
          };
          case (_) { assert(false); };
        };
      };
      case (#err(msg)) { assert(false); };
    };


    // add new active todo (generates startime but has no nominal interval)
    let thirdTodoId = Nat.toText(usersMetadataTodosTest.incrementSetAndGetUserMonotonicCreateTodoCount(idOne));
    assert(usersMetadataTodosTest.queryGetUserMonotonicCreateTodoCount(idOne) == 3);

    let thirdTodoTitle = "active added todo title";
    let thirdTodoContent = "active added todo content";
    let thirdTodoTags = ["tagOne", "tagTwo"];

    // NOTE as far as has been determined, current time will be the same for all these calls ie 
    // calling newActiveTodo will have a real start time the same as now()
    let currentTime = Time.now();

    res :=  todosTest.addNewActiveTodo(idOne, thirdTodoId, ?thirdTodoTitle, ?thirdTodoContent, ?thirdTodoTags);
    assert(todosTest.getCountOfAllTodos() == 3);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == 3);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == todosTest.getSpecificUserTodos(idOne).size());

    switch (todosTest.getSpecificUserTodo(idOne, thirdTodoId)) {
      case (#ok(todo)) {
        assert(todo.id == thirdTodoId);
        assert(todo.title == thirdTodoTitle);
        assert(todo.content == thirdTodoContent);
        assert(todo.tags.size() == 2);
        switch (todo.currentScheduledStatus) {
          case (#active(startTime, optNomInterval)) {
            assert(startTime == Time.now());
            assert(not (Option.isSome(optNomInterval)));
          };
          case (_) { assert(false); };
        };
      };
      case (#err(msg)) { assert(false); };
    };

    // reschedule existing scheduled todo

    let forthTodoId = Nat.toText(usersMetadataTodosTest.incrementSetAndGetUserMonotonicCreateTodoCount(idOne));
    assert(usersMetadataTodosTest.queryGetUserMonotonicCreateTodoCount(idOne) == 4);

    let forthTodoTitle = "scheduled todo title";
    let forthTodoContent = "scheduled todo content";
    let forthTodoTags = ["tagOne", "tagTwo", "tagthree"];

    let forthTodo_firstStartTime = Time.now() + 10000000;
    let forthTodo_firstStopTime = Time.now() +  50000000;
    res := todosTest.addNewScheduledTodo(idOne, forthTodoId, ?forthTodoTitle, ?forthTodoContent,?forthTodoTags, forthTodo_firstStartTime, forthTodo_firstStopTime);

    assert(todosTest.getCountOfAllTodos() == 4);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == 4);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == todosTest.getSpecificUserTodos(idOne).size());

    switch (todosTest.getSpecificUserTodo(idOne, forthTodoId)) {
      case (#ok(todo)) {
        assert(todo.id == forthTodoId);
        assert(todo.title == forthTodoTitle);
        assert(todo.content == forthTodoContent);
        assert(todo.tags.size() == 3);
        assert(todo.tags[2] == "tagthree");
        switch (todo.currentScheduledStatus) {
          case (#scheduled(nomStart, nomStop)) {
            assert(nomStart == forthTodo_firstStartTime);
            assert(nomStop == forthTodo_firstStopTime);
          };
          case (_) { assert(false); };
        };
      };
      case (#err(msg)) { assert(false); };
    };
    
    let forthTodo_updatedStartTime = Time.now() +  50000000;
    let forthTodo_updatedStopTime = Time.now() +  100000000;
    
    res := todosTest.rescheduleScheduledTodo(idOne, forthTodoId, forthTodo_updatedStartTime, forthTodo_updatedStopTime);

    // going to edit other metadata just to verfiy things working

    let forthUpdatedTitle = "updated title";
    let forthUpdatedTags = ["tags"];
    res := todosTest.editTodoMetadataOrContent(idOne, forthTodoId, ?forthUpdatedTitle, null, ?forthUpdatedTags);

    // verify nothing changed as far as counts
    assert(todosTest.getCountOfAllTodos() == 4);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == 4);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == todosTest.getSpecificUserTodos(idOne).size());

    switch (todosTest.getSpecificUserTodo(idOne, forthTodoId)) {
      case (#ok(todo)) {
        assert(todo.id == forthTodoId);
        assert(todo.title == forthUpdatedTitle);
        assert(todo.content == forthTodoContent);
        assert(todo.tags.size() == 1);
        assert(todo.tags[0] == "tags");
        switch (todo.currentScheduledStatus) {
          case (#scheduled(nomStart, nomStop)) {
            assert(nomStart == forthTodo_updatedStartTime);
            assert(nomStop == forthTodo_updatedStopTime);
          };
          case (_) { assert(false); };
        };
      };
      case (#err(msg)) { assert(false); };
    };

    // to recap, now there is the following methods that need to be tested:
    // activateExisting (can be scheduled, or unscheduled)
    // completeActive (can only be active, becomes completed)
    // because there's assertion tests on the start time different

    // have so far
    // todo four -> scheduled (forthTodo_updatedStartTime, forthTodo_updatedStopTime)
    // todo 5 adding one scheduled

    let fifthTodoId = Nat.toText(usersMetadataTodosTest.incrementSetAndGetUserMonotonicCreateTodoCount(idOne));
    assert(usersMetadataTodosTest.queryGetUserMonotonicCreateTodoCount(idOne) == 5);

    res := todosTest.addNewUnscheduledTodo(idOne, fifthTodoId, ?"title", ?"content", null);

    switch (todosTest.getSpecificUserTodo(idOne, fifthTodoId)) {
      case (#ok(todo)) {
        assert(todo.id == fifthTodoId);
        assert(todo.title == "title");
        assert(todo.content == "content");
        assert(todo.tags.size() == 0);
        switch (todo.currentScheduledStatus) {
          case (#unscheduled) { assert(true); };
          case (_) { assert(false); };
        };
      };
      case (#err(msg)) { assert(false); };
    };

    res := todosTest.activateExistingTodo(idOne, forthTodoId);

    switch (todosTest.getSpecificUserTodo(idOne, forthTodoId)) {
      case (#ok(todo)) {
        assert(todo.id == forthTodoId);
        assert(todo.title == forthUpdatedTitle);
        assert(todo.content == forthTodoContent);
        assert(todo.tags.size() == 1);
        assert(todo.tags[0] == "tags");
        switch (todo.currentScheduledStatus) {
          case (#active(startTime, optNomInterval)) {
            assert(startTime == Time.now());
            switch (optNomInterval) {
              case (?optNomInterval) {
                let (nomStart, nomStop) = optNomInterval;
                assert(nomStart == forthTodo_updatedStartTime);
                assert(nomStop == forthTodo_updatedStopTime);
              };
              case (null) { assert(false); };
            };
          };
          case (_) { assert(false); };
        };
      };
      case (#err(msg)) { assert(false); };
    };

    res := todosTest.activateExistingTodo(idOne, fifthTodoId);

    switch (todosTest.getSpecificUserTodo(idOne, fifthTodoId)) {
      case (#ok(todo)) {
        assert(todo.id == fifthTodoId);
        switch (todo.currentScheduledStatus) {
          case (#active(startTime, optNomInterval)) {
            assert(startTime == currentTime);
            switch (optNomInterval) {
              case (?optNomInterval) { assert(false); };
              case (null) { assert(true); };
            };
          };
          case (_) { assert(false); };
        };
      };
      case (#err(msg)) { assert(false); };
    };
    assert(todosTest.getCountOfAllTodos() == 5);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == 5);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == todosTest.getSpecificUserTodos(idOne).size());


    let idTwo = "idTwo";

    usersMetadataTodosTest.initializeNewUserMetadata(idTwo, canisterPrincipal);
    assert(usersMetadataTodosTest.queryGetUserMonotonicCreateTodoCount(idTwo) == 0);

    todosTest.initializeNewUserTodos(idTwo);
    assert(todosTest.getEntries().size() == 2);
    assert(todosTest.getSpecificUserTotalTodoCount(idOne) == 5);
    assert(todosTest.getSpecificUserTotalTodoCount(idTwo) == 0);

    let secondpersonfirsttodo = Nat.toText(usersMetadataTodosTest.incrementSetAndGetUserMonotonicCreateTodoCount(idTwo));
    assert(usersMetadataTodosTest.queryGetUserMonotonicCreateTodoCount(idTwo) == 1);

    res := todosTest.addNewUnscheduledTodo(idTwo, secondpersonfirsttodo, ?firstTodoTitle, ?firstTodoContent, null);

    assert(todosTest.getCountOfAllTodos() == 6);
    assert(todosTest.getCountOfAllTodos() == (todosTest.getSpecificUserTotalTodoCount(idOne) + todosTest.getSpecificUserTotalTodoCount(idTwo)));
    assert(todosTest.getSpecificUserTotalTodoCount(idTwo) == 1);
    assert(todosTest.getSpecificUserTotalTodoCount(idTwo) == todosTest.getSpecificUserTodos(idTwo).size());

    switch (todosTest.getSpecificUserTodo(idTwo, secondpersonfirsttodo)) {
      case (#ok(todo)) {
        assert(todo.id == secondpersonfirsttodo);
        assert(todo.title == firstTodoTitle);
        assert(todo.content == firstTodoContent);
        assert(todo.tags.size() == 0);
      };
      case (#err(msg)) { assert(false); };
    };

    res := todosTest.editTodoMetadataOrContent(idTwo, secondpersonfirsttodo, ?firstTodoEditedTitle, ?firstTodoEditedContent, ?firstTodoTags);

    assert(todosTest.getCountOfAllTodos() == 6);
    assert(todosTest.getCountOfAllTodos() == (todosTest.getSpecificUserTotalTodoCount(idOne) + todosTest.getSpecificUserTotalTodoCount(idTwo)));
    assert(todosTest.getSpecificUserTotalTodoCount(idTwo) == 1);
    assert(todosTest.getSpecificUserTotalTodoCount(idTwo) == todosTest.getSpecificUserTodos(idTwo).size());

    switch (todosTest.getSpecificUserTodo(idTwo, secondpersonfirsttodo)) {
      case (#ok(todo)) {
        assert(todo.id == secondpersonfirsttodo);
        assert(todo.title == firstTodoEditedTitle);
        assert(todo.content == firstTodoEditedContent);
        assert(todo.tags.size() == 1);
        assert(todo.tags[0] == "tags");
        assert(todo.currentScheduledStatus == #unscheduled);
      };
      case (#err(msg)) { assert(false); };
    };

    res := todosTest.scheduleUnscheduledTodo(idTwo, secondpersonfirsttodo, someTimeStart, someTimeEnd);

    switch (todosTest.getSpecificUserTodo(idTwo, secondpersonfirsttodo)) {
      case (#ok(todo)) {
        assert(todo.id == secondpersonfirsttodo);
        assert(todo.title == firstTodoEditedTitle);
        assert(todo.content == firstTodoEditedContent);
        assert(todo.tags.size() == 1);
        switch (todo.currentScheduledStatus) {
          case (#scheduled(nomStart, nomStop)) {
            assert(nomStart == someTimeStart);
            assert(nomStop == someTimeEnd);
          };
          case (_) { assert(false); };
        };
      };
      case (#err(msg)) { assert(false); };
    };

    assert(todosTest.getCountOfAllTodos() == 6);
    assert(todosTest.getCountOfAllTodos() == (todosTest.getSpecificUserTotalTodoCount(idOne) + todosTest.getSpecificUserTotalTodoCount(idTwo)));
    assert(todosTest.getSpecificUserTotalTodoCount(idTwo) == 1);
    assert(todosTest.getSpecificUserTotalTodoCount(idTwo) == todosTest.getSpecificUserTodos(idTwo).size());

    res := todosTest.activateExistingTodo(idTwo, secondpersonfirsttodo);

    switch (todosTest.getSpecificUserTodo(idTwo, secondpersonfirsttodo)) {
      case (#ok(todo)) {
        assert(todo.id == secondpersonfirsttodo);
        assert(todo.title == firstTodoEditedTitle);
        assert(todo.content == firstTodoEditedContent);
        assert(todo.tags.size() == 1);
        assert(todo.tags[0] == "tags");
        switch (todo.currentScheduledStatus) {
          case (#active(startTime, optNomInterval)) {
            assert(startTime == Time.now());
            switch (optNomInterval) {
              case (?optNomInterval) {
                let (nomStart, nomStop) = optNomInterval;
                assert(nomStart == someTimeStart);
                assert(nomStop == someTimeEnd);
              };
              case (null) { assert(false); };
            };
          };
          case (_) { assert(false); };
        };
      };
      case (#err(msg)) { assert(false); };
    };

    assert(todosTest.getCountOfAllTodos() == 6);
    assert(todosTest.getCountOfAllTodos() == (todosTest.getSpecificUserTotalTodoCount(idOne) + todosTest.getSpecificUserTotalTodoCount(idTwo)));
    assert(todosTest.getSpecificUserTotalTodoCount(idTwo) == 1);
    assert(todosTest.getSpecificUserTotalTodoCount(idTwo) == todosTest.getSpecificUserTodos(idTwo).size());

    return #ok(todosTest.getSpecificUserTodos(idOne));
  };

  public func testTodoCompletion(): async () {
    let idTwo = "idTwo";
    let todoId = "1";


    let todosCount = todosTest.getCountOfAllTodos();
    assert(todosTest.getSpecificUserTotalTodoCount(idTwo) == 1);
    var realStartTest = Time.now();
    var nomStartTest = Time.now();
    var nomStopTest = Time.now();

    switch (todosTest.getSpecificUserTodo(idTwo, todoId)) {
      case (#ok(todo)) {
        assert(todo.id == todoId);
        switch (todo.currentScheduledStatus) {
          case (#active(startTime, optNomInterval)) {
            realStartTest := startTime;
            switch (optNomInterval) {
              case (?optNomInterval) {
                let (nomStart, nomStop) = optNomInterval;
                nomStartTest := nomStart;
                nomStopTest := nomStop;
              };
              case (null) { assert(false); };
            };
          };
          case (_) { assert(false); };
        };
      };
      case (#err(msg)) { assert(false); };
    };
    var res = todosTest.completeActiveTodo("idTwo", "1");

    assert(todosTest.getSpecificUserTotalTodoCount(idTwo) == 1);
    assert(todosTest.getCountOfAllTodos() == todosCount);

    switch (todosTest.getSpecificUserTodo(idTwo, todoId)) {
      case (#ok(todo)) {
        assert(todo.id == todoId);
        switch (todo.currentScheduledStatus) {
          case (#completed(interval, optNomInterval)) {
            let (realStart, realStop) = interval;
            assert(realStart == realStartTest);
            switch (optNomInterval) {
              case (?optNomInterval) {
                let (nomStart, nomStop) = optNomInterval;
                assert(nomStartTest == nomStart);
                assert(nomStopTest == nomStop);
              };
              case (null) { assert(false); };
            };
          };
          case (_) { assert(false); };
        };
      };
      case (#err(msg)) { assert(false); };
    };
  };
}