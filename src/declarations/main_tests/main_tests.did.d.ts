import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type Interval = [StartTime, StopTime];
export type NominalInterval = [StartTime, StopTime];
export type PIdContextStableState = Array<[Principal, UniqueId]>;
export type Result = { 'ok' : Array<Todo> } |
  { 'err' : string };
export type Result_1 = {
    'ok' : [
      PIdContextStableState,
      UsersMetadataStableState,
      UsersTodosStableState,
    ]
  } |
  { 'err' : string };
export type ScheduledStatus = { 'scheduled' : NominalInterval } |
  { 'active' : [StartTime, [] | [NominalInterval]] } |
  { 'completed' : [Interval, [] | [NominalInterval]] } |
  { 'unscheduled' : null };
export type StartTime = bigint;
export type StopTime = bigint;
export type Time = bigint;
export interface Todo {
  'id' : UniqueId,
  'title' : string,
  'content' : string,
  'tags' : Array<string>,
  'epochCreationTime' : Time,
  'epochLastUpdateTime' : Time,
  'currentScheduledStatus' : ScheduledStatus,
}
export type UniqueId = string;
export interface UserMetadata {
  'epochCreationTime' : Time,
  'preferredDisplayName' : string,
  'epochLastUpdateTime' : Time,
  'emailAddress' : string,
  'monotonicCreateTodoCount' : bigint,
}
export type UsersMetadataStableState = Array<[UniqueId, UserMetadata]>;
export type UsersTodosStableState = Array<[UniqueId, Array<Todo>]>;
export interface anon_class_32_1 {
  'testTodoCompletion' : ActorMethod<[], undefined>,
  'test_creation_pidmetadatatodos_editmetadata' : ActorMethod<[], Result_1>,
  'test_todos' : ActorMethod<[], Result>,
}
export interface _SERVICE extends anon_class_32_1 {}
