import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';

export type Interval = [StartTime, StopTime];
export type NominalInterval = [StartTime, StopTime];
export type Result = { 'ok' : string } |
  { 'err' : string };
export type Result_1 = { 'ok' : UserMetadata } |
  { 'err' : string };
export type Result_2 = { 'ok' : Todo } |
  { 'err' : string };
export type Result_3 = { 'ok' : Array<Todo> } |
  { 'err' : string };
export type Result_4 = { 'ok' : string } |
  { 'err' : Array<bigint> };
export type Result_5 = { 'ok' : bigint } |
  { 'err' : string };
export type Result_6 = { 'ok' : UniqueId } |
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
export interface anon_class_28_1 {
  'DEBUG_resetUserTodos' : ActorMethod<[], undefined>,
  'activateScheduledOrUnscheduledTodo' : ActorMethod<
    [{ 'todoIdIn' : UniqueId }],
    Result,
  >,
  'addNewActiveTodo' : ActorMethod<
    [
      {
        'contentIn' : [] | [string],
        'tagsIn' : [] | [Array<string>],
        'titleIn' : [] | [string],
      },
    ],
    Result,
  >,
  'addNewScheduledTodo' : ActorMethod<
    [
      {
        'contentIn' : [] | [string],
        'tagsIn' : [] | [Array<string>],
        'scheduledStopTime' : Time,
        'scheduledStartTime' : Time,
        'titleIn' : [] | [string],
      },
    ],
    Result,
  >,
  'addNewUnscheduledTodo' : ActorMethod<
    [
      {
        'contentIn' : [] | [string],
        'tagsIn' : [] | [Array<string>],
        'titleIn' : [] | [string],
      },
    ],
    Result,
  >,
  'authenticateWithUserAccountCreationIfNecessary' : ActorMethod<[], Result_6>,
  'completeActiveTodo' : ActorMethod<[{ 'todoIdIn' : UniqueId }], Result>,
  'getTotalCreatedTodoCount' : ActorMethod<[], Result_5>,
  'greet' : ActorMethod<[], string>,
  'helloCanister' : ActorMethod<[], string>,
  'orderTest' : ActorMethod<
    [{ 'secondArg' : bigint, 'thirdArg' : string, 'firstArg' : [] | [string] }],
    Result_4,
  >,
  'queryAllTodosOfUser' : ActorMethod<[], Result_3>,
  'querySpecificTodoOfUser' : ActorMethod<
    [{ 'todoIdIn' : UniqueId }],
    Result_2,
  >,
  'queryUserMetadata' : ActorMethod<[], Result_1>,
  'removeExistingTodo' : ActorMethod<[{ 'todoIdIn' : UniqueId }], Result>,
  'rescheduleScheduledTodo' : ActorMethod<
    [
      {
        'todoIdIn' : UniqueId,
        'newScheduledStartTime' : Time,
        'newScheduledStopTime' : Time,
      },
    ],
    Result,
  >,
  'scheduledUnscheduledTodo' : ActorMethod<
    [
      {
        'todoIdIn' : UniqueId,
        'scheduledStopTime' : Time,
        'scheduledStartTime' : Time,
      },
    ],
    Result,
  >,
  'unscheduleScheduledTodo' : ActorMethod<[{ 'todoInIn' : UniqueId }], Result>,
  'updateSpecificTodoMetadataOrContent' : ActorMethod<
    [
      {
        'todoIdIn' : UniqueId,
        'contentIn' : [] | [string],
        'tagsIn' : [] | [Array<string>],
        'titleIn' : [] | [string],
      },
    ],
    Result,
  >,
  'updateUserMetadata' : ActorMethod<
    [
      {
        'emailAddressIn' : [] | [string],
        'preferredDisplayNameIn' : [] | [string],
      },
    ],
    Result,
  >,
}
export interface _SERVICE extends anon_class_28_1 {}
