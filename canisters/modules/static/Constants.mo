
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Principal "mo:base/Principal";

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
