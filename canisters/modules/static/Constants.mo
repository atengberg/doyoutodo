import Principal "mo:base/Principal";
import Prim "mo:⛔";
import D "mo:base/Debug";
import Buffer "mo:base/Buffer";
import Map "mo:base/HashMap";
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
import Types "./Types";

module {
  public let INVALID_UNIQUE_ID: Types.UniqueId = "0";
  public let LITERALLY_UNSPECIFIED = "unspecified";

  public let ANONYMOUS_PRINCIPAL_LIT: Text = "2vxsx-fae";
  
  public func getAnonymousPrincipal(): Principal { 
    Principal.fromText(ANONYMOUS_PRINCIPAL_LIT); 
  };
  
  public func isAnonymous(forPrincipal: Principal): Bool { 
    forPrincipal == getAnonymousPrincipal(); 
  };

  public func toFilledBuffer<Y>(src: [Y]): Buffer.Buffer<Y> { 
    let b: Buffer.Buffer<Y> = Buffer.Buffer(src.size());
    for (e in src.vals()) { b.add(e); };
    return b;
  };

};
