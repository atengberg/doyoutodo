import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Prelude "mo:base/Prelude";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

import Constants "./static/Constants";
import Errors "./static/Errors";
import Types "./static/Types";


module {
  // class wrapper for handling logic to a store users' metadata (such as profile, etc) 
  // 2do: make generator for taking a type, and then generating the proper implementation
  // for the 
  public class UsersMetadata(initSet: Types.UsersMetadataStableState) {

    var idToUsersMap_ = HashMap.fromIter<Types.UniqueId, Types.UserMetadata>(
      initSet.vals(), initSet.size(), Text.equal, Text.hash
    );

    public func getEntries(): [(Types.UniqueId, Types.UserMetadata)] { Iter.toArray(idToUsersMap_.entries()) };
    public func getCurrentUsersCount(): Nat { idToUsersMap_.size() };

    public func queryGetUserMonotonicCreateTodoCount(forUniqueUserId: Text): Nat {
      switch (getUserMetadata(forUniqueUserId)) {
        case (#err(msg)) { Prelude.unreachable(); }; // maybe not ideal if won't show error 
        case (#ok(exists)) { exists.monotonicCreateTodoCount; };
      };
    };
 
    // updates "next" field for a specific user's todo creation count; called when a new todo is created
    public func incrementSetAndGetUserMonotonicCreateTodoCount(forUniqueUserId: Text): Nat { 
      assert(userMetadataExists(forUniqueUserId));
      switch (getUserMetadata(forUniqueUserId)) {
        case (#err(msg)) { Prelude.unreachable(); };
        case (#ok(exists)) { 
          let next = exists.monotonicCreateTodoCount + 1;
          idToUsersMap_.put(forUniqueUserId, {
            epochCreationTime = exists.epochCreationTime;
            epochLastUpdateTime = Time.now();
            monotonicCreateTodoCount = next;
            preferredDisplayName = exists.preferredDisplayName;
            emailAddress = exists.emailAddress;
            associatedPrincipal = exists.associatedPrincipal;
          });
          return next;
        };
      };
    };

    public func userMetadataExists(forUniqueUserId: Types.UniqueId): Bool {
      return Option.isSome(idToUsersMap_.get(forUniqueUserId));
    };

    public func getUserMetadata(forUniqueUserId: Types.UniqueId): Result.Result<Types.UserMetadata, Text> {
      let exists = idToUsersMap_.get(forUniqueUserId);
      switch exists {
        case (null) { #err(Errors.ProfileNotFound)};
        case (?exists) { #ok(exists) };
      };
    };

    // "allocates" metadata for a new user in the map
    public func initializeNewUserMetadata(forUniqueUserId: Text, associatedPrincipal: Principal): () {
      assert(not userMetadataExists(forUniqueUserId));
      idToUsersMap_.put(forUniqueUserId, {
        epochCreationTime = Time.now();
        epochLastUpdateTime = Time.now();
        monotonicCreateTodoCount = 0;
        preferredDisplayName = Constants.LITERALLY_UNSPECIFIED;
        emailAddress = Constants.LITERALLY_UNSPECIFIED;
        associatedPrincipal = Principal.toText(associatedPrincipal);
      });
    };
 
    // updates user metadata, notice the params are opt so it will only overwrite if they are present
    public func persistUserMetadataEdits(
      forUniqueUserId: Text,
      preferredDisplayNameIn: ?Text,
      emailAddressIn: ?Text,
        ): Result.Result<Types.UserMetadata, Text> {
      assert(userMetadataExists(forUniqueUserId));
      let exists = idToUsersMap_.get(forUniqueUserId);
      switch exists {
        case (null) { Prelude.unreachable(); };
        case (?exists) {
          idToUsersMap_.put(forUniqueUserId, {
            epochCreationTime = exists.epochCreationTime;
            epochLastUpdateTime = Time.now();
            monotonicCreateTodoCount = exists.monotonicCreateTodoCount;
            preferredDisplayName = Option.get<Text>(preferredDisplayNameIn, exists.preferredDisplayName);
            emailAddress =  Option.get<Text>(emailAddressIn, exists.emailAddress);
            associatedPrincipal = exists.associatedPrincipal;
          });
        };
      };
      return getUserMetadata(forUniqueUserId);
    };
  };    
}