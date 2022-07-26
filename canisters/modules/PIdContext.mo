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
  public class Authenticator(monotonicIdCreationCount: Nat, initSet: Types.PIdContextStableState) {

    var monotonicIdCount: Nat = monotonicIdCreationCount;
    // could be many to one!
    var principalToIdMap = HashMap.fromIter<Principal, Types.UniqueId>(
      initSet.vals(), initSet.size(), Principal.equal, Principal.hash
    );

    public func reset(): () {
      monotonicIdCount := 0;
      principalToIdMap := HashMap.HashMap<Principal, Types.UniqueId>(0, Principal.equal, Principal.hash);
    };
    // to original anchor principal if needed 
    //var idToPrincipalMap = HashMap.HashMap<Types.UniqueId, Principal>(1024, Text.equal, Text.hash);

    // for stable stating
    public func getMonotonicIdCreationCount(): Nat { monotonicIdCount; };
    public func getEntries(): [(Principal, Types.UniqueId)] { Iter.toArray(principalToIdMap.entries()) };

    public func getCurrentPIdCount(): Nat { principalToIdMap.size() };

    public func isKnownPrincipal(forPrincipal: Principal): Bool {
      Option.isSome(principalToIdMap.get(forPrincipal))
    };

    public func persistNewId(forPrincipal: Principal): Types.UniqueId {
      assert(not isKnownPrincipal(forPrincipal));
      assert(not (forPrincipal == Constants.getAnonymousPrincipal()));
      let newId: Text = Nat.toText(monotonicIdCount + 1);
      // add timestamp and hash the id before texting
      principalToIdMap.put(forPrincipal, newId);
      monotonicIdCount += 1;
      return newId;
    };

    public func authenticate(forPrincipal: Principal): Types.UniqueId {
      assert(not (forPrincipal == Constants.getAnonymousPrincipal()));
      assert(isKnownPrincipal(forPrincipal));
      let id = Option.get<Text>(principalToIdMap.get(forPrincipal), Constants.INVALID_UNIQUE_ID);
      assert(not (id == Constants.INVALID_UNIQUE_ID));
      return id;
    };
  };    
}