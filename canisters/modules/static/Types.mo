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

module {

  public type UniqueId = Text;

  public type UserMetadata = {
    epochCreationTime: Time.Time;
    epochLastUpdateTime: Time.Time;
    monotonicCreateTodoCount: Nat;
    preferredDisplayName: Text;
    emailAddress: Text;
  };

  public type Todo = {
    id: UniqueId;
    epochCreationTime: Time.Time;
    epochLastUpdateTime: Time.Time;
    title: Text;
    content: Text;
    tags: [Text];
    currentScheduledStatus: ScheduledStatus;
  };

  public type StartTime = Time.Time;
  public type StopTime = Time.Time;
  public type Interval = (StartTime, StopTime);
  public type NominalInterval = Interval;

  public type ScheduledStatus = {
    #unscheduled;
    #scheduled: NominalInterval;
    #active: (StartTime, ?NominalInterval); // if activated todo was prevousily scheduled -> NominalInterval
    #completed: (Interval, ?NominalInterval); // "Real"Interval, if was previousily scheduled -> NominalInterval
  }; 

  public type PIdContextStableState = [(Principal, UniqueId)];
  public type UsersMetadataStableState = [(UniqueId, UserMetadata)];
  public type UsersTodosStableState = [(UniqueId, [Todo])];

  // alternative incarnation ?  normalize like-wise scoped fields for reusability
  public type TodoType = {
    #atomic;
    #composite: [UniqueId]; // contains a list of todo ids it containrs
  };

  public type TodoV2 = {
    kind: TodoType;
    metadata: TodoMetadata;
    schedule: ScheduledStatus;
    content: Text;
  };

// metadata types { #create #edit #reference #administrative etc? }
  public type TodoMetadata = {
    id: UniqueId;
    epochCreationTime: Time.Time;
    epochLastUpdateTime: Time.Time;
    title: Text;
    tags: [Text];
  };
};