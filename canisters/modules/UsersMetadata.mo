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
import Types "./static/Types";
import Constants "./static/Constants";

module {
  public class UsersMetadata(initSet: Types.UsersMetadataStableState) {

    var idToUsersMap = HashMap.fromIter<Types.UniqueId, Types.UserMetadata>(
      initSet.vals(), initSet.size(), Text.equal, Text.hash
    );

    public func reset(): () {
      idToUsersMap := HashMap.HashMap<Types.UniqueId, Types.UserMetadata>(0, Text.equal, Text.hash);
    };

    public func getEntries(): [(Types.UniqueId, Types.UserMetadata)] { Iter.toArray(idToUsersMap.entries()) };
    public func getCurrentUsersCount(): Nat { idToUsersMap.size() };

    public func queryGetUserMonotonicCreateTodoCount(forUniqueUserId: Text): Nat {
      switch (getUserMetadata(forUniqueUserId)) {
        case (#err(msg)) { Prelude.unreachable(); }; // maybe not ideal if won't show error 
        case (#ok(exists)) { exists.monotonicCreateTodoCount; };
      };
    };

    public func incrementSetAndGetUserMonotonicCreateTodoCount(forUniqueUserId: Text): Nat { 
      assert(userMetadataExists(forUniqueUserId));
      // can use do ? but the problem is NEED the actual non-opt val to do subsequent action
      switch (getUserMetadata(forUniqueUserId)) {
        case (#err(msg)) { Prelude.unreachable(); };
        case (#ok(exists)) { 
          let next = exists.monotonicCreateTodoCount + 1;
          idToUsersMap.put(forUniqueUserId, {
            epochCreationTime = exists.epochCreationTime;
            epochLastUpdateTime = Time.now();
            monotonicCreateTodoCount = next;
            preferredDisplayName = exists.preferredDisplayName;
            emailAddress = exists.emailAddress;
          });
          return next;
        };
      };
    };

    public func userMetadataExists(forUniqueUserId: Types.UniqueId): Bool {
      // or add log here and make this private so if it fails there could be hypothetical stack trace
      return Option.isSome(idToUsersMap.get(forUniqueUserId));
    };

    public func getUserMetadata(forUniqueUserId: Types.UniqueId): Result.Result<Types.UserMetadata, Text> {
      let exists = idToUsersMap.get(forUniqueUserId);
      switch exists {
        case (null) { #err"No user profile found for id given" };
        case (?exists) { #ok(exists) };
      };
    };

    public func persistNewUserMetadata(forUniqueUserId: Text): () {
      assert(not userMetadataExists(forUniqueUserId));
      idToUsersMap.put(forUniqueUserId, {
        epochCreationTime = Time.now();
        epochLastUpdateTime = Time.now();
        monotonicCreateTodoCount = 0;
        preferredDisplayName = Constants.LITERALLY_UNSPECIFIED;
        emailAddress = Constants.LITERALLY_UNSPECIFIED;
      });
    };

    public func persistUserMetadataEdits(
      forUniqueUserId: Text,
      preferredDisplayNameIn: ?Text,
      emailAddressIn: ?Text,
      ): () {
      assert(userMetadataExists(forUniqueUserId));
      let exists = idToUsersMap.get(forUniqueUserId);
      switch exists {
        case (null) { Prelude.unreachable(); };
        case (?exists) {
          idToUsersMap.put(forUniqueUserId, {
            epochCreationTime = exists.epochCreationTime;
            epochLastUpdateTime = Time.now();
            monotonicCreateTodoCount = exists.monotonicCreateTodoCount;
            preferredDisplayName = Option.get<Text>(preferredDisplayNameIn, exists.preferredDisplayName);
            emailAddress =  Option.get<Text>(emailAddressIn, exists.emailAddress);
          });
        };
      };
    };
  };    
}