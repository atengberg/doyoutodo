
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";

import Constants "./static/Constants";
import Errors "./static/Errors";
import Types "./static/Types";

module {
  // class wrapper for handling caller access control, here it simply serves as a 1:1 principal > userid mapping
  public class Authenticator(monotonicIdCreationCount: Nat, initSet: Types.PIdContextStableState) {

    // "next" field used in the simple id creation also serves as a count of all user accounts created
    var monotonicIdCount_: Nat = monotonicIdCreationCount;

    // could be many to one!
    var principalToIdMap_ = HashMap.fromIter<Principal, Types.UniqueId>(
      initSet.vals(), initSet.size(), Principal.equal, Principal.hash
    );
    // to original anchor principal if needed 
    //var idToPrincipalMap = HashMap.HashMap<Types.UniqueId, Principal>(1024, Text.equal, Text.hash);

    // for stable stating
    public func getMonotonicIdCreationCount(): Nat { monotonicIdCount_; };
    public func getEntries(): [(Principal, Types.UniqueId)] { Iter.toArray(principalToIdMap_.entries()) };

    public func getCurrentPIdCount(): Nat { principalToIdMap_.size() };

    public func isKnownPrincipal(forPrincipal: Principal): Bool {
      Option.isSome(principalToIdMap_.get(forPrincipal))
    };

    // called when a new user "account" needs to be created
    public func persistNewId(forPrincipal: Principal): Types.UniqueId {
      assert(not (forPrincipal == Constants.getAnonymousPrincipal()));
      assert(not isKnownPrincipal(forPrincipal));
      let newId: Text = Nat.toText(monotonicIdCount_ + 1);
      // 2do use ulid instead of simple parsed nat
      principalToIdMap_.put(forPrincipal, newId);
      monotonicIdCount_ += 1;
      return newId;
    };

    public func authenticate(forPrincipal: Principal): Types.UniqueId {
      assert(not (forPrincipal == Constants.getAnonymousPrincipal()));
      assert(isKnownPrincipal(forPrincipal));
      let id = Option.get<Text>(principalToIdMap_.get(forPrincipal), Constants.INVALID_UNIQUE_ID);
      assert(not (id == Constants.INVALID_UNIQUE_ID));
      return id;
    };
  };    
}